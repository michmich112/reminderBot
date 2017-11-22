var Airtable = require('airtable');
var fs = require('fs');

//Authenticates the connection to the API
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
            var tmp = {};
            try{
                getData(base,[{id:record.get('Name'),basename:'Members', requests:['Name', 'Email']},{id:record.get('Equipment Rented'),basename:'Rental Inventory',requests:['Name']}],function (result){
                    console.log(result);
                    var tmp = Object.keys(result);
                    for(var i=0; i<tmp.length;i++){
                        var tmp2 = result.tmp[i];
                        for(var j=0;j<temp2.length;j++){
                            console.log(tmp[i] + " " + tmp2[j]);
                        }
                    }
                });
                tmp.Due = record.get('Due Date');
            }catch(err){
                console.error(err);
            }
        }
    });
    callback(base,people);
}

function sendMessages(base,data){ //returns {to: string, message: string}
    //will need name,due_date, object(s) as parameters for a complete e-mail
    data.forEach(function(value){
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

function debug(data){
    console.log(data);
}

//general functions that accesses base: basename and returns a list of dicts of data where key = column name , value = data
//base = Airtable.base(<base_id>)
//data = [{id: "..",basename: "...",requests:[...]},{id="..",basename: "...", requests:[...]}] this enables us to gather a complete data from different bases and use one callback for the whole data
//callback gets run with the superAccumulator dictionary: {basename: {cellid:{data}}} -> use Object.keys(dict) to get a list of keys
function getData(base,data,callback){
    var superacc = {}
    for (var j=0; j<data.length; j++){ //iterates through the dictionaries
        if(data[j].id.isArray){
            for(var k=0; k<data[j].id.length; k++){
                base(data[j].basename).find(data[j].id[k],function(err, record){ //sets the base
                    if(err) {console.error(err); return err;}
                    else{
                        try{
                            var acc = {};
                            for (var i=0; i<data[j].requests.length; i++){ //iterates through the requests
                                acc[data[j].requests[i]] = record.get(data[j].requests[i]);
                            }
                        }catch(error){
                            console.error(error); return error;
                        }
                    }
                    superacc.data[j].basename[data[j].id[k]] = acc;
                });
            }
        }else{
            base(data[j].basename).find(data[j].id,function(err, record){ //sets the base
                if(err) {console.error(err); return err;}
                else{
                    try{
                        var acc = {};
                        for (var i=0; i<data[j].requests.length; i++){ //iterates through the requests
                            acc[data[j].requests[i]] = record.get(data[j].requests[i]);
                        }
                    }catch(error){
                        console.error(error); return error;
                    }
                }
                superacc.data[j].basename[data[j].id] = acc;
            });
        }
        //superacc[data[j].basename] = acc;
    }
    callback(superacc);
}


function makeMessage(data){ //didnt need to create a function but makes this a bit more readable
    mess = ("Hi " + data.name + ",\nThis is The Factory. The item you leased from us is now overdue :( please return it or reply to this message if you want to continue using it.\nNote that due to limited stock we may ask you to bring it back regardless if other people wish to use it.\nBest,\nThe Factory Management Team");
    return {to: data.email , message: mess};
}
