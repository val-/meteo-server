/*jslint node: true */

'use strict';

var net = require('net'),
    moment = require('moment'),
    jsonfile = require('jsonfile'),
    server = net.createServer(function (socket) {
      
        socket.setEncoding('utf8');

        socket.on('data', function (data) {
            
            var now = moment(),
                fileName = './storage/' + now.format('DD-MM-YYYY') + '.json',
                logObj = {records: []};

            data = data.split(' ');
            if (data.length >= 3) {

                data = {
                    u: now.unix(),
                    t: data[0],
                    p: data[1],
                    h: data[2]
                };

                try {
                    logObj = jsonfile.readFileSync(fileName);
                } catch (e) {}

                logObj.records.push(data);
                jsonfile.writeFileSync(fileName, logObj);

                console.log(now.format('DD-MM-YYYY HH:mm:ss'), ' TCP message: ', data);

            }
        });

    });

server.listen(8000, 'localhost');
console.log("TCP server listening localhost:8000");

