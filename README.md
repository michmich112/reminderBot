# reminderBot
Automatically send e-mail based on info provided by an airtable base. In this code, if an item is *OVERDUE* send an e-mail reminding the individual to renew the lease or bring it back to the lab.
Uses Node.js and the following APIs: Gmail API, Airtable API

## instalation
Requires Node.js >= 0.10 and npm.
To install run:

### Debian (ubuntu)
`$ sudo apt-get install nodejs npm`

### Darwin (Mac OSX with Homebrew installed)
`$ brew install node`

Once installed run `node -v` (or `nodejs -v`) and `npm -v` to see check if the packages are correctly installed on your machine.
Then run:
```
$ cd reminderBot/
$ npm start
```
and the service will start up automatically