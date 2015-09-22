/*jslint node: true */

'use strict';

var express = require('express'),
    serveStatic = require('serve-static'),
    app = express();

app.use(serveStatic(__dirname + '/web-client/build'));
app.use('/storage/', serveStatic(__dirname + '/storage'));
app.listen(80);

console.log("HTTP server listening localhost:80");

/*

sudo apt-get install libcap2-bin
sudo setcap cap_net_bind_service=+ep `readlink -f \`which node\``

*/
