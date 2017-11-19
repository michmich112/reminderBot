var app_info        = require('./package.json');        //package to make module available on npm
var fs              = require('fs');                    //give access to files to avoid posting your API key and client-secret (google)
var readline        = require('readline');              //needed for google-Auth
var google          = require('googleapis');            //google api module
var googleAuth      = require('google-auth-library');    //google authentication module to use your own gmail account
var Airtable        = require('airtable');              //airtable api to access the database
var date            = require('date-and-time');

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/gmail-nodejs-reminderBot.json or run clean.sh
var SCOPES = ['https://mail.google.com/','https://www.googleapis.com/auth/gmail.modify','https://www.googleapis.com/auth/gmail.compose','https://www.googleapis.com/auth/gmail.send'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'gmail-nodejs-reminderBot.json';

//Path & info for log files
var LOG_PATH = ".logs/"
var LOG_FILE = "mainLog.log"

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

//Add to log that you started and check if log exists
fs.stat(LOG_PATH+LOG_FILE, function(err, stat){
  if(err == null){
    addToLog('Starting up reminderbot.');
  }else if(err.code == 'ENOENT') {
    // file does not exist
    fs.writeFile(LOG_PATH+LOG_FILE, '');
} else {
    console.log('[ERROR] Some other error: ', err.code);
}
});


//---> Google API authentication
function authenticateAndSend(to, from, subject, message){
  fs.readFile('client_secret.json', function processClientSecrets(err, content) { // Load client secrets from a local file.
    if (err) {
      displayInfo('[ERROR] Error loading client secret file: ' + err);
      displayInfo('        Make sure you downloaded the correct secret file and you renamed it to client_secret.json');
      return;
    }
    // Authorize a client with the loaded credentials, then call the
    // Gmail API.
    authorize(JSON.parse(content), function (auth) {
      var gmail = google.gmail('v1');
      var raw = makeBody('thefactory@mcgilleus.ca', 'thefactory@mcgilleus.ca', subject, message);
      gmail.users.messages.send({
          auth: auth,
          userId: 'me',
          resource: {
              raw: raw
          }
      }, function(err, res) {
          if(err){
              displayInfo(err);
              return;
          }else{
              displayInfo('[SUCCESS] Mail Successfully sent. Mail id: '+res.id);
          }
      });
  });
  });
}

//---> Airtable Authentication
fs.readFile('AirtableAPIkey.key', function conf(err,key){ //create a file AirtableAPIkey.key
  Airtable.configure({
      endpointUrl: 'https://api.airtable.com',
      apiKey: key
  });
  base = Airtable.base('appGh7ESCOFPw5h8R'); //this is the base ID of your airtable Base
  
  base('Rental Sign Out').select({
      view: "Main View"
  }).eachPage(function page(records){
      overdue(base,records,sendMessages);
  });
});

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
      displayInfo("[WARNING] Authentication Token not yet created. Creating Now.");
      getNewToken(oauth2Client, callback);
    } else {
      displayInfo("[SUCCESS] Authentication Token already created on system.");
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
        displayInfo('[ERROR] Error while trying to retrieve access token! ', err);
        return;
      }
      displayInfo('[SUCCESS] Successfully retrieved access token');
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
  displayInfo('[SUCCESS] Token stored to ' + TOKEN_PATH);
}

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
  callback(base,people);
}

function sendMessages(base,names){ //Constructs and sends the message
  names.forEach(function(value){
      var person = base('Members').find(value.Name,(function(err, record){
          if (err) { displayError(err)}
          //displayInfo("in");
          value.Name = record.get('Name');
          value.Email = record.get('Email');
          constructMessage(base,value);
      }));
  });
}

function constructMessage(base,data){ //construct the message
  var partA = "Hi " + data.Name + ",\nThis is The Factory. The Following item(s) that you have rented are now overdue: ";
  var partB = " (due on " + data.Due + " ). Please return it or reply to this message if you want to continue using it.\nNote that due to limited stock we may ask you to bring it back regardless if other people wish to use it.\nBest,\nThe Factory Management Team";
  addObjects(partA,partB,data);
}

function addObjects(partA,partB,data){ //adding the Equipment rented to the e-mail
  var obj = data.Object;
  if(obj.length == 0){
      var message = partA + partB;
      authenticateAndSend('test','test','Rental Equipment Overdue', data.Email + message)
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