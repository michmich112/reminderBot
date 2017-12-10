var fs = require('fs');

fs.readFile('test.json', function (err, result){
 var data = JSON.parse(result);
 console.log(Object.keys(data.Airtable_Data));
})