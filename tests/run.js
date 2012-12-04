var spawn = require("child_process").spawn;
var readdir = require('fs').readdir;
var pathJoin = require('path').join;
var inspect = require('util').inspect;
var runproto = require('../lib/runproto');
var newstate = require('fs').readFileSync(__dirname + "/../lib/newstate.js", "utf8");

function compile(path, callback) {
  var child = spawn("luajit", ["-b", path, "-"]);
  var out = [];
  var len = 0;
  var err = "";
  var count = 3;
  child.stderr.setEncoding("utf8");
  child.stdout.on("data", function (chunk) {
    out.push(chunk);
    len += chunk.length;
  });
  child.stderr.on("data", function (chunk) {
    err += chunk;
    throw new Error(chunk);
  });
  child.stdout.on("end", check);
  child.stderr.on("end", check);
  child.on("exit", check);
  function check() {
    if (--count) return;
    callback(null, Buffer.concat(out, len));
  }
}

function testdir(path, callback) {
  readdir(path, function (err, files) {
    files = files.filter(function (file) {
      return /\.lua$/.test(file);
    });
    var index = 0;
    (function next(err) {
      if (err) return callback(err);
      var name = files[index++];
      if (!name) process.exit();
      var fullPath = pathJoin(path, name);
      compile(fullPath, function (err, buffer) {
        if (err) return callback(err);
        var program = runproto(buffer);
        console.log(program);
        var fn = new Function(newstate + program);
        var result = fn();
        console.log(result);
        next();
      });
    }());
  });
}

testdir(__dirname + "/active", function (err) {
  if (err) throw err;
});