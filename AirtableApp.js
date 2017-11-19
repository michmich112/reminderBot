var Airtable = require('airtable');
var fs = require('fs');
var base = undefined;
fs.readFile('AirtableAPIkey.key', function conf(err,key){
    Airtable.configure({
        endpointUrl: 'https://api.airtable.com',
        apiKey: key
    });
    base = Airtable.base('appGh7ESCOFPw5h8R');
    
    base('Rental Sign Out').select({
        // Selecting the first 3 records in Main View:
        //maxRecords: 3,
        view: "Main View"
    }).eachPage(function page(records){
        test1(base,records,sendMessages);
    });
});

function test1(base,records,callback){
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
    //console.log(people);
    callback(base,people);
}

function sendMessages(base,names){ //returns {to: string, message: string}
    //will need name,due_date, object(s) as parameters for a complete e-mail
    //console.log('hi');
    names.forEach(function(value){
        console.log(value);
        var person = base('Members').find(value.Name,(function(err, record){
            if (err) { console.error(err)}
            //console.log("in");
            value.Name = record.get('Name');
            value.Email = record.get('Email');
            make(base,value);
    }));});
}

function getObjects(base,data){
    for(var i=0;i<data.Objects.length;i++){
        //need to make sure that the callback is executed first
    }
}

function make(base,data){
    var partA = "Hi " + data.Name + "this is The Factory. The Following item(s) that you have rented are now overdue: ";
    var partB = " (due on " + data.Due + " ). Please return it or reply to this message if you want to continue using it.\nNote that due to limited stock we may ask you to bring it back regardless if other people wish to use it.\nBest,\nThe Factory Management Team";
    //console.log(partA);
    //console.log(data.Object);
    construct(partA,partB,data.Object);
}

function construct(partA,partB,objs){
    if(objs.length == 0){
        console.log(partA + partB);
    }else{
        //console.log(objs.shift());
        base('Rental Inventory').find(objs.shift(),function(err, object){
            //console.log(obj);
            construct(partA+", "+object.get('Name'),partB,objs);
        })
    }
}

function makeMessage(data){ //didnt need to create a function but makes this a bit more readable
    mess = ("Hi " + data.name + ",\nThis is The Factory. The item you leased from us is now overdue :( please return it or reply to this message if you want to continue using it.\nNote that due to limited stock we may ask you to bring it back regardless if other people wish to use it.\nBest,\nThe Factory Management Team");
    return {to: data.email , message: mess};
}
