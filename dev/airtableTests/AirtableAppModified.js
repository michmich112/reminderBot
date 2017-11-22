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
        main(base,records,sendMessages);
    });
});

function main(base,records,callback){
    var people = [];
    records.forEach(function(record) {
        if(record.get('Due?')=="⏰OVERDUE⏰"){
            try{
                people.push({name:record.get('Name'),due:record.get('Due Date'),items:record.get('Equipment Rented')});
            }catch(err){
                console.error(err);
            }
        }
    });
    callback(base,people,makeMessage);
}

function sendMessages(base,data,callback){ //returns {to: string, message: string}
    //will need name,due_date, object(s) as parameters for a complete e-mail
    var all = [];
    for(var i=0;i<data.length;i++){
        var temp = {items:[]};
        temp.due = data.due;
        base('Members').find(data[i].name,(function(err, record){ //not making this modulable, making a custiom script
            if (err) { return err;}
            //console.log("in");
            temp.name = record.get("Name");
            temp.name = record.get("Email");
        }));
        for(var j=0;j<data[i].items.length;j++){
            base('Rental Inventory').find(data[i].items[j],function(err,record){
                if(err){return err;}
                temp.items.push(record.get('Name'));
            });
        }
        all.push(temp);
        //message = makeMessage(temp);
        //console.log(message);
    }
    callback(all,function(data){console.log(data);});
}

function makeMessage(data,callback){ //didnt need to create a function but makes this a bit more readable
    for(var j=0; j<data.length; j++){
        var items = "";
        for(var i=0;i<data[j].items.length; i++){
            items = items + " " + data[j].items[i];
        }
        mess = ("Hi " + data[j].name + ",\nThis is The Factory. The following item(s) you leased from us that were due on " + data[j].due + " are now overdue: " + items +  " :( \nplease return it or reply to this message if you want to continue using it.\nNote that due to limited stock we may ask you to bring it back regardless if other people wish to use it.\nBest,\nThe Factory Management Team");
        var ret = {to: data[j].email , message: mess}
        //console.log(ret);
        callback(ret);
    }
}
