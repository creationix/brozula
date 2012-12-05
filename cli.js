#!/usr/bin/env node
var spawn = require("child_process").spawn;
var readdir = require('fs').readdir;
var brozula = require('../brozula');

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

compile(process.argv[2], function (err, buffer) {
  var program = brozula.compile(buffer);
  var fn = new Function("require", program);
  fn(require);
});
