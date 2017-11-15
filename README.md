# reminderBot [![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0) [![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/dwyl/esta/issues)

Automatically send e-mail based on info provided by an airtable base. In this code, if an item is *OVERDUE* send an e-mail reminding the individual to renew the lease or bring it back to the lab.

Uses Node.js and the following APIs: Gmail API [![npm version](https://badge.fury.io/js/googleapis.svg)](https://badge.fury.io/js/googleapis), Airtable API [![npm version](https://badge.fury.io/js/airtable.svg)](https://badge.fury.io/js/airtable)

## Installation

Requires Node.js >= 0.10.0 and npm [![npm version](https://badge.fury.io/js/npm.svg)](https://badge.fury.io/js/npm).

To install run:

### On Debian systems (ubuntu)
`$ sudo apt-get install nodejs npm`

### On Darwin (Mac OSX with Homebrew installed)
`$ brew install node`

Once installed run `node -v` and `npm -v` to see check if the packages are correctly installed on your machine.

Then run:

```
$ cd reminderBot/
$ npm start
```

and the service will start up automatically

## Configuration

Configuration will come once the service is finished