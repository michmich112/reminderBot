var app_info        = require('./package.json');        //package to make module available on npm
var fs              = require('fs');                    //give access to files to avoid posting your API key and client-secret (google)
var readline        = require('readline');              //needed for google-Auth
var google          = require('googleapis');            //google api module
var googleAuth      = require('google-auth-library');    //google authentication module to use your own gmail account
var Airtable        = require('airtable');              //airtable api to access the database
var date            = require('date-and-time');
var async           = require('async');
var color           = require('colors')
var timer           = require('setinterval-plus');

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/gmail-nodejs-reminderBot.json or run clean.sh
var SCOPES = ['https://mail.google.com/','https://www.googleapis.com/auth/gmail.modify','https://www.googleapis.com/auth/gmail.compose','https://www.googleapis.com/auth/gmail.send'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'gmail-nodejs-reminderBot.json';

//Path & info for log files
var LOG_PATH = ".logs/";
var LOG_FILE = "mainLog.log";
var LOG_LAST_USE = "lastUse.log";

var base = undefined;

// <------- LOG FUNCTIONS ------->
//function to add line to log (Async operation)
function addToLog(message){
  var now = new Date();
  try{
    fs.appendFile(LOG_PATH + LOG_FILE, '[' + date.format(now, 'YYYY/MM/DD HH:mm:ss:SSS') +']-> ' + message+'\n', function (err){
      if(err){console.error(err); return(err);}
      //we could add a console output here but it would only add too much info on the terminal
    });
  }catch(err){
    throw(err);
  }
}

//Making sure that what is displayed goes into the log
function displayInfo(info){
  addToLog(info);
  console.log(info);
}

function displayError(err){
  addToLog(err);
  console.error(err);
}

// <------- General Filesystem Authentication ------->
//Add to log that you started and check if log exists
function createLogs(path){
  fs.stat(path, function(err, stat){
    if(err == null){
      displayInfo('Authenticating reminderBot services on ->' + path);
    }else if(err.code == 'ENOENT') {
      // file does not exist
      fs.writeFile(path, '',function(err){
          if(err){console.error(err); return err;}
          displayInfo('Created '+path)
      });
    } else {
        console.log('[ERROR]'.red + ' Some other error: ', err.code);
    }
  });
}

function authFileSystem(){
  //create dir for logs and file for logs
  console.log('Checking log directory and files.');
  if (!fs.existsSync(LOG_PATH)){
      console.log('Creating Log directory')
      fs.mkdirSync(LOG_PATH);
  }

  createLogs(LOG_PATH+LOG_FILE);
  createLogs(LOG_PATH+LOG_LAST_USE);

  // Load client secrets from a local file.
  fs.readFile('client_secret.json', function processClientSecrets(err, content) {
      if (err) {
        displayInfo('[ERROR]'.red + ' Error loading client secret file: ' + err);
        displayInfo('        Make sure you downloaded the correct secret file and you renamed it to client_secret.json');
        return;
      }
      // Authorize a client with the loaded credentials, then call the
      // Gmail API.
      authorize(JSON.parse(content), function(){
        displayInfo('[SUCCESS]'.green + ' reminderBot Authentication completed successfully.')
        var server = new timer(serverLoop(),86400000);
      });
  });
}

// <------- GOOGLE API AUTHENTICATION AND METHODS ------->
//---> Google API authentication
function authenticateAndSend(to, subject, message, data){
  fs.readFile('client_secret.json', function processClientSecrets(err, content) { // Load client secrets from a local file.
    if (err) {
      displayInfo('[ERROR]'.red + ' Error loading client secret file: ' + err);
      displayInfo('        Make sure you downloaded the correct secret file and you renamed it to client_secret.json');
      return;
    }
    // Authorize a client with the loaded credentials, then call the
    // Gmail API.
    authorize(JSON.parse(content), function (auth) {
      var gmail = google.gmail('v1');
      gmail.users.getProfile({auth:auth, userId:'me'},function(err, res){
        var raw = makeBody( to , res.emailAdress, subject, message); //Change this when done to send correct e-mails
        gmail.users.messages.send({
          auth: auth,
          userId: 'me',
          resource: {
              raw: raw
          }
        }, function(err, res) {
          if(err){
              displayInfo('[ERROR]'.red + ' Mail failed to send to '+data.Name+' at '+data.Email+'. Details: '+err);
              return;
          }else{
              displayInfo('[SUCCESS]'.green + ' Mail Successfully sent to '+data.Email+'. Mail id: '+res.id);
          }
        });
      });
    });
  });
}

//--->Google API main functions
//Create an OAuth2 client with the given credentials, and then execute the given callback function.
function authorize(credentials, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      displayInfo('[WARNING]'.yellow  + ' Authentication Token not yet created. Creating Now.');
      getNewToken(oauth2Client, callback);
    } else {
      displayInfo('[SUCCESS]'.green  + ' Authentication Token already created on system.');
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });
}

//Get and store new token after prompting for user authorization, and then execute the given callback with the authorized OAuth2 client.
function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        displayInfo('[ERROR]'.red + ' Error while trying to retrieve access token! ');
        displayError(err);
        return;
      }
      displayInfo('[SUCCESS]'.green +  'Successfully retrieved access token');
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

//Store token to disk be used in later program executions.
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  displayInfo('[SUCCESS]'.green + ' Token stored to ' + TOKEN_PATH);
}

//---> Airtable main Functions
function overdue(base,records,callback){
  var people = [];
  records.forEach(function(record) {
      if(record.get('Due?')=="⏰OVERDUE⏰"){
          try{
              people.push({Name:record.get('Name'),Due: record.get('Due Date'),Object: record.get('Equipment Rented')});
          }catch(err){
              displayError(err);
          }
      }
  });
  if (people == []){
    displayInfo('[INFO]'.blue + ' No overdue items');
  }else{
    callback(base,people);
  }
}

// <------- MESSAGE METHODS ------->
//Constructs and sends the message
function sendMessages(base,names){
  names.forEach(function(value){
      var person = base('Members').find(value.Name,(function(err, record){
          if (err) { displayError(err)}
          value.Name = record.get('Name');
          value.Email = record.get('Email');
          constructMessage(base,value);
      }));
  });
}

///construct the message
function constructMessage(base,data){
  var partA = "Hi " + data.Name + ",\nThis is The Factory. The Following item(s) that you have rented are now overdue: ";
  var partB = " (due on " + data.Due + " ). Please return it or reply to this message if you want to continue using it.\nNote that due to limited stock we may ask you to bring it back regardless if other people wish to use it.\nBest,\nThe Factory Management Team";
  addObjects(partA,partB,data);
}

//adding the Equipment rented to the e-mail (problems using callbacks and promises)
function addObjects(partA,partB,data){ 
  var obj = data.Object;
  if(obj.length == 0){
      var message = partA + partB;
      displayInfo('Attempting to send an e-mail to '+data.Name+' at '+data.Email);
      authenticateAndSend(data.Email,'Rental Equipment Overdue', message,data) //remode data.Email when ready to send correct e-mails
  }else{
      base('Rental Inventory').find(obj.shift(),function(err, object){
          //just to have nice commas
          if(obj.length == 0){
              addObjects(partA+" "+object.get('Name')+",",partB,data);
          }else{
              addObjects(partA+" "+object.get('Name')+",",partB,data);
          }
      })
  }
}

//make the body of the message to send 
function makeBody(to, from, subject, message) {
  var str = ["Content-Type: text/plain; charset=\"UTF-8\"\n",
      "MIME-Version: 1.0\n",
      "Content-Transfer-Encoding: 7bit\n",
      "to: ", to, "\n",
      "from: ", from, "\n",
      "subject: ", subject, "\n\n",
      message
  ].join('');

  var encodedMail = new Buffer(str).toString("base64").replace(/\+/g, '-').replace(/\//g, '_');
      return encodedMail;
}

//---> Airtable Authentication
function main(){
  fs.readFile('AirtableAPIkey.key', function conf(err,key){ //create a file AirtableAPIkey.key
    Airtable.configure({
        endpointUrl: 'https://api.airtable.com',
        apiKey: key
    });
    base = Airtable.base('appGh7ESCOFPw5h8R'); //this is the base ID of your airtable Base
    //Anything past here will be authenticated by Airtable and you will be able to extract data from your base
    try{
      base('Rental Sign Out').select({
        view: "Main View"
      }).eachPage(function page(records){
        overdue(base,records,sendMessages); //This function is the one you want to execute / you can change it but leave it in its' place 
      });
    }catch(err){
      displayError('[ERROR]'.red + ' Check API key.');
      console.error(err);
    }
  });
}

// Makes the server run for ever every n minute/hour/day... (customizable)
function serverLoop(){
  fs.readFile('./.logs/lastUse.log','utf8', function read(err, data) {
    if (err) {
      console.log(err);
      displayError('[ERROR]'.red + ' There was an error trying to read from file ')
      return err;
    }
    if(data == ''){
      fs.writeFile('./.logs/lastUse.log', date.format(new Date(), 'YYYY/MM/DD HH:mm'), function(err,data){
        if(err){
          console.log(err);
          displayError('[ERROR]'.red + ' There was an error writing to file ');
          return err;
        }
        console.log('Added to ./.logs/lastUse.log');
        main(); //run the program on start with empty .logs/lastUSe.log
      });
    }else{
      var past = date.parse(data,'YYYY/MM/DD HH:mm');
      var prime = date.addDays(past,1);
      var ayo = date.subtract(prime,new Date()).toMilliseconds();
      if(ayo <= 0){
        var now = new Date();
        fs.writeFile('./.logs/lastUse.log', date.format(now, 'YYYY/MM/DD HH:mm'), function(err,data){
          if(err){
              console.log(err);
              displayError('[ERROR]'.red + ' There was an error writing the new time');
              return err;
          }
          // Runs the main function
          main();
        });
      }
    }
  },function(err){
    console.log('ERROR');
    console.error(err);
  });
}

authFileSystem();