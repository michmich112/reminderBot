var Airtable = require('airtable');
var fs = require('fs');

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
    base('Rental Sign Out').select({view:'Main View',filterByFormula:"{Due?}='⏰OVERDUE⏰'"}).eachPage(function (result){getMemberInfo(result).then(console.log,console.error);});
    
})


function getMemberInfo(records){
    return new Promise(function (resolve, reject){
        Members(records,function (err, data){
            if(err){ return reject(err);}
            resolve(data);
        })
    })
}

//callbacks aren't working well for me so i'm going to try using promises instead 
function Members(recs,callback){
    var data = [] ;
    lambda(recs,data,callback);
}

function lambda(recs,data,cb){
    for(var i=0;i<recs.length;i++){
        //Pb is this boi 
        var value = recs[i];
        var b = base('Members');
        var a = value.get('Name');
        console.log(b);



        b.find(a,function(err,result){
            if(err){console.log('ERRRRRRRORORORO');console.error(err); return err;}
            data.push({Name:result.get('Name'), Email:result.get('Email'), Due: value.get('Due Date'), Objects:value.get('Equipment Rented')})
            console.log(data);
        })



        console.log('in');
    }
    console.log(data);
    cb(data);
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

