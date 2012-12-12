#!/usr/bin/env node
var parse = require('./parser');
var Closure = require('./interpreter').Closure;
var globals = require('./globals');
var nopt = require("nopt");
var execFile = require("child_process").execFile;
var readFile = require('fs').readFile;
var statFile = require('fs').stat;
var pathResolve = require("path").resolve;
var pathJoin = require("path").join;
var dirname = require('path').dirname;
var basename = require('path').basename;

// Compile lua files to luajit on the fly with a locking queue for concurrent
// requests.
var queues = {};
function luaToBytecode(path, callback) {
  if (path in queues) {
    return queues[path].push(callback);
  }
  var queue = queues[path] = [callback];
  function callbacks(err, newpath) {
    delete queues[path];
    queue.forEach(function (callback) {
      callback(err, newpath);
    });
  }
  var newpath = pathJoin(dirname(path), "." + basename(path) + "x");
  statFile(path, function (err, stat) {
    if (err) return callbacks(err);
    statFile(newpath, function (err, stat2) {
      if (err && err.code !== "ENOENT") {
        return callbacks(err);
      }
      if (stat2 && stat2.mtime >= stat.mtime) {
        return callbacks(null, newpath);
      }
      execFile("luajit", ["-b", path, newpath], function (err, stdout, stderr) {
        if (err) return callbacks(err);
        if (stderr) return callbacks(stderr);
        callbacks(null, newpath);
      });
    });
  });
}

// Compile a lua script to javascript source string
function compile(path, callback) {
  if (/\.luax/.test(path)) {
    // Load already compiled bytecode
    loadBytecode(path);
  }
  if (/\.lua$/.test(path)) {
    luaToBytecode(path, function (err, newpath) {
      if (err) return callback(err);
      loadBytecode(newpath);
    });
  }
  function loadBytecode(path) {
    readFile(path, function (err, buffer) {
      if (err) return callback(err);
      generate(buffer);
    });
  }
  function generate(buffer) {
    var program;
    try {
      program = parse(buffer);
    }
    catch (err) {
      return callback(err);
    }
    callback(null, program);
  }
}

var options = nopt({
  "serve": Number,
  "execute": Boolean,
  "print": Boolean,
  "uglify": Boolean,
  "beautify": Boolean,
  "lines": Boolean
}, {
  "x": ["--execute"],
  "p": ["--print"],
  "u": ["--uglify"],
  "b": ["--beautify"],
  "l": ["--lines"]
});

if (options.serve) {
  if (options.serve === 1) options.serve = 8080;
  var urlParse = require('url').parse;
  var base = process.cwd();
  var send = require('send');
  console.log("BASE", base);
  var server = require('http').createServer(function (req, res) {
    var url = urlParse(req.url);
    if (url.pathname === "/parser.js") {
      return send(req, pathJoin(__dirname, "/parser.js")).pipe(res);
    }
    if (url.pathname === "/interpreter.js") {
      return send(req, pathJoin(__dirname, "/interpreter.js")).pipe(res);
    }
    if (url.pathname === "/runtime.js") {
      return send(req, pathJoin(__dirname, "/runtime.js")).pipe(res);
    }
    if (url.pathname === "/globals.js") {
      return send(req, pathJoin(__dirname, "/globals.js")).pipe(res);
    }
    if (url.pathname === "/browser-buffer.js") {
      return send(req, pathJoin(__dirname, "/browser-buffer.js")).pipe(res);
    }
    var path = pathJoin(base, url.pathname);
    if (path[path.length - 1] === "/") {
      path += "index.html";
    }
    console.log(req.method, path);
    if (/\.luax$/.test(path)) {
      luaToBytecode(path.substr(0, path.length - 1), function (err, path) {
        if (err) {
          if (err.code === "ENOENT") {
            res.statusCode = 404;
            return res.end();
          }
          res.statusCode = 500;
          return res.end(err.stack);
        }
        console.log("sending", path, "for", req.url);
        send(req, path)
          .hidden(true)
          .pipe(res);
      });
      return;
    }
    send(req, url.pathname)
      .root(base)
      .pipe(res);
  });
  server.listen(options.serve, function () {
    console.log("Serving server listening at", server.address());
  });
}
else {

  // Default to running if not specified
  if (options.execute === undefined && !options.print) {
    options.execute = true;
  }

  var filename = options.argv.remain[0];

  if (!filename) {
    console.error([
      "Usage: brozula [OPTION...] program.lua[x]",
      "Brozula compiles lua files to bytecode and then executes them using a JS VM",
      "The lua -> luax (luajit bytecode) step is done by using luajit",
      "",
      "Examples:",
      "  brozula myprogram.lua",
      "  brozula --print myprogram.lua",
      "  brozula -pb myprogram.luax",
      "",
      " Main operation mode:",
      "",
      "  -x, --execute          Execute the generated javascript",
      "                         (This is the default behavior)",
      "  -p, --print            Print the generated javascript",
      "  --serve port           Serve the current folder over HTTP auto-compiling",
      "                         any lua scripts requested",
      "",
      " Operation modifiers:",
      "",
      "  -u, --uglify           Compress the generated javascript using uglify-js",
      "  -b, --beautify         Beautify the generated javascript using uglify-js",
      "  -l, --lines            Show line numbers when printing",
      ""
    ].join("\n"));
    process.exit(-1);
  }


  filename = pathResolve(process.cwd(), filename);
  compile(filename, function (err, protos) {
    if (err) throw err;
    if (options.print) {
      console.log(require('util').inspect(protos, false, 3 + (options.beautify ? 2 : 0), true) + "\n");
    }
    if (options.execute) {
      (new Closure(protos[protos.length - 1])).toFunction(globals)();
    }
//    program = "(function () {\n\n" + program + "\n\n}());";
//    if (options.uglify) {
//      var UglifyJS = require("uglify-js");
//      var toplevel_ast = UglifyJS.parse(program);
//      toplevel_ast.figure_out_scope();
//      var compressor = UglifyJS.Compressor({});
//      var compressed_ast = toplevel_ast.transform(compressor);
//      compressed_ast.figure_out_scope();
//      compressed_ast.compute_char_frequency();
//      compressed_ast.mangle_names();
//      program = compressed_ast.print_to_string({});
//    }
//    if (options.beautify) {
//      var UglifyJS = require("uglify-js");
//      var toplevel_ast = UglifyJS.parse(program);
//      toplevel_ast.figure_out_scope();
//      program = toplevel_ast.print_to_string({
//        beautify: true,
//        indent_level: 2
//      });
//    }
//    if (options.print) {
//      if (options.lines) {
//        var lines = program.split("\n");
//        var digits = Math.ceil(Math.log(lines.length) / Math.LN10);
//        var padding = "";
//        for (var i = 0; i < digits; i++) {
//          padding += "0";
//        }
//        console.log(lines.map(function (line, i) {
//          var num = (i + 1) + "";
//          return "\033[34m" + padding.substr(num.length) + num + "\033[0m " + line;
//        }).join("\n"));
//      }
//      else {
//        console.log(program);
//      }
//    }
//    if (options.execute) {
//      eval(program);
//    }
  });
}