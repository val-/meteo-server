var net = require('net');


var server = net.createServer(function (socket) {
    
    socket.setEncoding('utf8');
    
    socket.on('data', function(data) {
        console.log(data);
    });

});

server.listen(8000, "localhost");

console.log("TCP server listening localhost:8000");
