var Airtable = require('airtable');
var fs = require('fs');
var async = require('async');

var base = undefined;

//Authentication protocol
fs.readFile('AirtableAPIkey.key', function conf(err,key){
    Airtable.configure({
        endpointUrl: 'https://api.airtable.com',
        apiKey: key
    });
    //defines the airtable base you are going to use
    base = Airtable.base('appGh7ESCOFPw5h8R');
    //return only the data where OVERDUE is true
    base('Rental Sign Out').select({view:'Main View',filterByFormula:"{Due?}='⏰OVERDUE⏰'"}).eachPage(function (result){getMemberInfo(result,function (result){console.log(result);});});
    
})

//callbacks aren't working well for me so i'm going to try using promises instead 
function getMemberInfo(records,callback){
    var data = [];
    function test (data,recs,cal){
        recs.forEach(function(value){
            base('Members').find(value.get('Name'),function(err,result){
                if(err){console.log('ERRRRRRRORORORO');console.error(err); return err;}
                //console.log(result);
                data.push({Name:result.get('Name'), Email:result.get('Email'), Due: value.get('Due Date'), Objects:value.get('Equipment Rented')})
                console.log(data);
            })
            console.log(data);
        });
        console.log(data);
        cal(data);
    }
    test([],records,callback);
    //console.log(data);
    //callback(data);
}

function mainCallback(records){
    records.forEach(function(record) {
        if(record.get('Due?')=="⏰OVERDUE⏰"){
            try{
                console.log(record.get('Name'));
            }catch(err){
                console.error(err);
            }
        }
    });
}

