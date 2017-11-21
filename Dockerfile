FROM node:9
MAINTAINER michmich112

ENV NODE ENV=development
WORKDIR /usr/local/src

COPY package.json /usr/local/src/package.json
RUN npm install

COPY app.js /usr/local/src/app.js
COPY authenticate.js /usr/local/src/authenticate.js
COPY AirtableAPIkey.key /usr/local/src/AirtableAPIkey.key
COPY client_secret.json /usr/local/src/client_secret.json

RUN npm --version

EXPOSE 3000
CMD [ "npm", "start"]