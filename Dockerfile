FROM node:9
MAINTAINER michmich112

ENV NODE ENV=development
WORKDIR /usr/local/src

COPY package.json /usr/local/src/package.json
RUN npm install

COPY AirtableApp.js /usr/local/src/AirtableApp.js
COPY AirtableAPIkey.key /usr/local/src/AirtableAPIkey.key

RUN npm --version

EXPOSE 3000
CMD [ "npm", "start"]