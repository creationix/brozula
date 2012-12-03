var readDump = require('./lib/readdump');
var readProto = require('./lib/readproto');
var readFileSync = require('fs').readFileSync;
var inspect = require('util').inspect;

var protos = readDump(readFileSync("test.luac")).map(readProto);
console.log(inspect(protos, false, 4, true));