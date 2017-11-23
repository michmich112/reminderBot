var date = require('date-and-time');
var fs = require('fs');
var async = require('async');

async.forever(function(next){
    fs.readFile('time.log','utf8', function read(err, data) {
        if (err) {
            console.log(err);
            next("[ERROR] There was an error trying to read from file ")
            return err;
        }
        //console.log(data);
        if(data == ''){
            fs.writeFile('time.log', date.format(new Date(), 'YYYY/MM/DD HH:mm'), function(err,data){
                if(err){
                    console.log(err);
                    next("[ERROR] There was an error writing to file ");
                    return err;
                }
                console.log('time empty, WroteTime');
                next();
            });
        }else{
            var past = date.parse(data,'YYYY/MM/DD HH:mm');
            var prime = date.addMinutes(past,1);
            var ayo = date.subtract(prime,new Date()).toMilliseconds();
            //console.log('prime '+prime);
            //console.log('ayo '+ayo);
            if(ayo <= 0){
                var now = new Date();
                //console.log('Ayyy its '+ date.format(now, 'YYYY/MM/DD HH:mm'));
                fs.writeFile('time.log', date.format(now, 'YYYY/MM/DD HH:mm'), function(err,data){
                    if(err){
                        console.log(err);
                        next("[ERROR] There was an error writing the new time");
                        return err;
                    }
                    console.log('Time changed');
                    next();
                });
            }else{
                next();
            }
        }
    });
},function(err){
    console.log('ERROR');
    console.error(err);
});