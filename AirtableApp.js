var Airtable = require('airtable');
var fs = require('fs');

fs.readFile('AirtableAPIkey.key', function conf(err,key){
    Airtable.configure({
        endpointUrl: 'https://api.airtable.com',
        apiKey: key
    });
    var base = Airtable.base('appGh7ESCOFPw5h8R');
    
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
                people.push(record.get('Name'));
            }catch(err){
                console.error(err);
            }
        }
    });
    callback(base,people);
}

function sendMessages(base,names){ //returns {to: string, message: string}
    //will need name,due_date, object(s) as parameters for a complete e-mail
    names.forEach(function(value){
        var person = base('Members').find(value,(function(err, record){
            if (err) { return err;}
            //console.log("in");
            message = makeMessage({
                name: record.get("Name"),
                email: record.get("Email")
            });
            console.log(message);
    }));});
}

function makeMessage(data){ //didnt need to create a function but makes this a bit more readable
    mess = ("Hi " + data.name + ",\nThis is The Factory. The item you leased from us is now overdue :( please return it or reply to this message if you want to continue using it.\nNote that due to limited stock we may ask you to bring it back regardless if other people wish to use it.\nBest,\nThe Factory Management Team");
    return {to: data.email , message: mess};
}
