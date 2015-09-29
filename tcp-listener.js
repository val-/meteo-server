/*jslint node: true */

'use strict';

var net = require('net'),
    moment = require('moment'),
    jsonfile = require('jsonfile'),
    fs = require('fs'),
    touch = require('touch'),
    server = net.createServer(function (socket) {
      
        socket.setEncoding('utf8');

        socket.on('data', function (msg) {
            
            var now = moment(),
                fileName = './storage/' + now.format('DD-MM-YYYY') + '.json',
                logObj = {records: []},
                rec = msg.split(' ');

            if (rec.length >= 3) {

                rec = {
                    u: now.unix(),
                    t: rec[0],
                    p: rec[1],
                    h: rec[2]
                };

                if (fs.existsSync(fileName)) {
                    logObj = jsonfile.readFileSync(fileName);
                } else {
                    touch.sync(fileName);
                }
                logObj.records.push(rec);
                jsonfile.writeFileSync(fileName, logObj);

                console.log('\n' + now.format('DD-MM-YYYY HH:mm:ss'), ' TCP message: ', msg);

            }
        });

    });

server.listen(8000, 'localhost');
console.log("TCP server listening localhost:8000");

