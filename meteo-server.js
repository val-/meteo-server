#! /usr/bin/env node
// use 'npm link' to add command

console.log('Meteo server started!');

require('./tcp-listener.js');
require('./http-listener.js');

