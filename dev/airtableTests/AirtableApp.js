var Airtable = require('airtable');
var fs = require('fs');

//if needed base can be global and would mean that you wouldn't need to pass it as an argument everytime
//var base = undefined;

fs.readFile('AirtableAPIkey.key', function conf(err,key){ //create a file AirtableAPIkey.key
    Airtable.configure({
        endpointUrl: 'https://api.airtable.com',
        apiKey: key
    });
    base = Airtable.base('appGh7ESCOFPw5h8R'); //this is the base ID of your airtable Base
    
    base('Rental Sign Out').select({
        view: "Main View"
    }).eachPage(function page(records){
        overdue(base,records,sendMessages);
    });
});

function overdue(base,records,callback){
    var people = [];
    records.forEach(function(record) {
        if(record.get('Due?')=="⏰OVERDUE⏰"){
            try{
                people.push({Name:record.get('Name'),Due: record.get('Due Date'),Object: record.get('Equipment Rented')});
            }catch(err){
                console.error(err);
            }
        }
    });
    callback(base,people);
}

function sendMessages(base,names){ //Constructs and sends the message
    names.forEach(function(value){
        console.log(value);
        var person = base('Members').find(value.Name,(function(err, record){
            if (err) { console.error(err)}
            //console.log("in");
            value.Name = record.get('Name');
            value.Email = record.get('Email');
            constructMessage(base,value);
        }));
    });
}

function constructMessage(base,data){ //construct the message
    var partA = "Hi " + data.Name + ",\nThis is The Factory. The Following item(s) that you have rented are now overdue: ";
    var partB = " (due on " + data.Due + " ). Please return it or reply to this message if you want to continue using it.\nNote that due to limited stock we may ask you to bring it back regardless if other people wish to use it.\nBest,\nThe Factory Management Team";
    addObjects(partA,partB,data.Object);
}

function addObjects(partA,partB,objs){ //adding the Equipment rented to the e-mail
    if(objs.length == 0){
        var message = partA + partB;
        console.log(message); //Change this to do what you want with the message
    }else{
        base('Rental Inventory').find(objs.shift(),function(err, object){
            //just to have nice commas
            if(obj.length == 0){
                addObjects(partA+" "+object.get('Name')+",",partB,objs);
            }else{
                addObjects(partA+" "+object.get('Name')+",",partB,objs);
            }
        })
    }
}

