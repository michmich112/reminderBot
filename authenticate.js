var app_info        = require('./package.json');  
var fs              = require('fs');                    //give access to files to avoid posting your API key and client-secret (google)
var readline        = require('readline');              //needed for google-Auth
var google          = require('googleapis');            //google api module
var googleAuth     = require('google-auth-library');    //google authentication module to use your own gmail account

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/gmail-nodejs-reminderBot.json
//since this file is meant to create a token if not present we won't need much
var SCOPES = ['https://mail.google.com/','https://www.googleapis.com/auth/gmail.modify','https://www.googleapis.com/auth/gmail.compose','https://www.googleapis.com/auth/gmail.send'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'gmail-nodejs-reminderBot.json';

// Load client secrets from a local file.
fs.readFile('client_secret.json', function processClientSecrets(err, content) {
    if (err) {
      console.log('[ERROR] Error loading client secret file: ' + err);
      console.log('        Make sure you downloaded the correct secret file and you renamed it to client_secret.json');
      return;
    }
    // Authorize a client with the loaded credentials, then call the
    // Gmail API.
    authorize(JSON.parse(content), function(err){
        if(err){
            console.log("[SUCCESS] Authentication Token Successfully created!");
        }
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
        console.log("[WARNING] Authentication Token not yet created. Creating Now.");
        getNewToken(oauth2Client, callback);
        } else {
        console.log("[SUCCESS] Authentication Token already created on system.");
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
            console.log('[ERROR] Error while trying to retrieve access token! ', err);
            return;
        }
        console.log('[SUCCESS] Successfully retrieved access token');
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
    console.log('[SUCCESS] Token stored to ' + TOKEN_PATH);
}