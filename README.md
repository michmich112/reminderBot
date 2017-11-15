# reminderBot
[![npm version](https://badge.fury.io/js/npm.svg)](https://badge.fury.io/js/npm) 
Automatically send e-mail based on info provided by an airtable base. In this code, if an item is *OVERDUE* send an e-mail reminding the individual to renew the lease or bring it back to the lab.
Uses Node.js and the following APIs: Gmail API [![npm version](https://badge.fury.io/js/googleapis.svg)](https://badge.fury.io/js/googleapis), Airtable API [![npm version](https://badge.fury.io/js/airtable.svg)](https://badge.fury.io/js/airtable)

## Installation
Requires Node.js >= 0.10 and npm.
To install run:

### On Debian systems (ubuntu)
`$ sudo apt-get install nodejs npm`

### On Darwin (Mac OSX with Homebrew installed)
`$ brew install node`

Once installed run `node -v` (or `nodejs -v`) and `npm -v` to see check if the packages are correctly installed on your machine.
Then run:
```
$ cd reminderBot/
$ npm start
```
and the service will start up automatically

## Configuration
Configuration will come once the service is finished