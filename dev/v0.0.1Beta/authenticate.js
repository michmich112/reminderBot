var app_info        = require('./package.json');
var fs              = require('fs');                    //give access to files to avoid posting your API key and client-secret (google)
var readline        = require('readline');              //needed for google-Auth
//var google          = require('googleapis');            //google api module
var googleAuth      = require('google-auth-library');    //google authentication module to use your own gmail account
var google          = require('googleapis');            //google api module
var date            = require('date-and-time');

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/gmail-nodejs-reminderBot.json
//since this file is meant to create a token if not present we won't need much
var SCOPES = ['https://mail.google.com/','https://www.googleapis.com/auth/gmail.modify','https://www.googleapis.com/auth/gmail.compose','https://www.googleapis.com/auth/gmail.send'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'gmail-nodejs-reminderBot.json';

//Path & info for log files
var LOG_PATH = ".logs/";
var LOG_FILE = "mainLog.log";
var LOG_LAST_USE = "lastUse.log";

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

//create dir for logs and file for logs
console.log('Checking log directory and files.');
if (!fs.existsSync(LOG_PATH)){
    console.log('Creating Log directory')
    fs.mkdirSync(LOG_PATH);
}

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
        console.log('[ERROR] Some other error: ', err.code);
    }
  });
}

createLogs(LOG_PATH+LOG_FILE);
createLogs(LOG_PATH+LOG_LAST_USE);

// Load client secrets from a local file.
fs.readFile('client_secret.json', function processClientSecrets(err, content) {
    if (err) {
      displayInfo('[ERROR] Error loading client secret file: ' + err);
      displayInfo('        Make sure you downloaded the correct secret file and you renamed it to client_secret.json');
      return;
    }
    // Authorize a client with the loaded credentials, then call the
    // Gmail API.
    authorize(JSON.parse(content), function(){
        displayInfo("[SUCCESS] reminderBot Authentication completed successfully.")
    });
});

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
            try{
                getNewToken(oauth2Client, callback);
            } catch(err) {
                displayInfo('[ERROR] Failture to create Tolken!');
            }
        }else{
            displayInfo("Authentication Token already created on system.");
            oauth2Client.credentials = JSON.parse(token);
            callback(oauth2Client);
        }
    });
}
  
/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
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

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
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