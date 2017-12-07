[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0) [![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/dwyl/esta/issues)
# reminderBot

Automatically send e-mail based on info provided by an airtable base. In this code, if an item is *OVERDUE* send an e-mail reminding the individual to renew the lease or bring it back to the lab.

Uses Node.js and the following APIs: [Gmail API](https://developers.google.com/gmail/api/), [Airtable API](https://airtable.com/api)

## Installation

Requires Node.js >= 9.0.0 and npm >= 5.5.0 .

To install run:

On Debian systems (ubuntu) : `$ sudo apt-get install nodejs npm`

On Darwin (Mac OSX with Homebrew installed) : `$ brew install node`

Once installed run `node -v` and `npm -v` to see check if the packages are correctly installed on your machine.

Configure the file by following the steps in the Configuration section.

Then run:

```
$ cd reminderBot/
$ npm start
```

and the service will start up.

## Docker

The service can be fully run and managed on the Docker platform.
To run the service on a docker container, be sure to properly set-up and configure the service before continuing.
We will assume that everything has been configured like in the Configuration section.

```
$ cd reminderBot/
$ docker build . -t reminderbot
$ docker run -i reminderbot:latest
```
This will prompt you to authenticate the newly created container using your Google Account.
Once authenticated, the service will start. You can just stop the container by pressing `Ctrl + c` and then restarting it in detached mode via `docker start <container name>`.


## Configuration

Configuration will come once the service is finished
As this service is currently only made for one specific use, the modulation is pretty low (i.e. pretty annoying to adapt it to your use). A fully modulable version is in the works and should be much easier to use. 
Here are a few helpful notes to get started with this project:
-> Start by getting an API Key/ client secret on the [google developper console](https://console.developers.google.com/start/api?id=gmail). You can find detailed steps on how to get the API key [here](https://developers.google.com/gmail/api/quickstart/nodejs) Download the json file, rename it to `client_secret.json` and move it to the reminderbot folder.
-> Get your [Airtable API key](https://airtable.com/api) and put it in a file named AirtableAPIkey.key
-> Take note of your Airtable Base number/UUID and change the one thats on line 267 of app.js
-> Anything in the main function under line 267 is fully customizable and is where you do you. currently the function `overdue (base, records, callback)` is the only one being used.
-> customize your own functions 