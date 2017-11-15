var app_info        = require('./package.json');        //package to make module available on npm
var fs              = require('fs');                    //give access to files to avoid posting your API key and client-secret (google)
var google          = require('googleapis');            //google api module
var gooogleAuth     = require('google-auth-library');   //google authentication module to use your own gmail account
var Airtable        = require('airtable');              //airtable api to access the database

