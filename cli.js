#!/usr/bin/env node
var brozula = require('../brozula');
var nopt = require("nopt");

// Compile a lua script to javascript source string
function compile(path, callback) {
  if (/\.luax/.test(path)) {
    // Load already compiled bytecode
    loadBytecode();
  }
  if (/\.lua$/.test(path)) {
    // Compile lua to memory using luajit in child process
    loadLua();
  }
  function loadBytecode() {
    var readFile = require('fs').readFile;
    readFile(path, function (err, buffer) {
      if (err) return callback(err);
      generate(buffer);
    });
  }
  function loadLua() {
    var spawn = require("child_process").spawn;
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
      generate(Buffer.concat(out, len));
    }
  }
  function generate(buffer) {
    var program;
    try {
      program = brozula.compile(buffer);
    }
    catch (err) {
      return callback(err);
    }
    callback(null, program);
  }
}

function uglify(orig_code) {
  var jsp = require("uglify-js").parser;
  var pro = require("uglify-js").uglify;
  var ast = jsp.parse(orig_code); // parse code and get the initial AST
  ast = pro.ast_mangle(ast); // get a new AST with mangled names
  ast = pro.ast_squeeze(ast); // get an AST with compression optimizations
  return pro.gen_code(ast); // compressed code here
}
var options = nopt({
  "execute": Boolean,
  "print": Boolean,
  "uglify": Boolean,
  "beautify": Boolean
}, {
  "x": ["--execute"],
  "p": ["--print"],
  "u": ["--uglify"],
  "b": ["--beautify"]
});

// Default to running if not specified
if (options.execute === undefined && !options.print) {
  options.execute = true;
}

var filename = options.argv.remain[0];

if (!filename) {
  console.error([
    "Usage: brozula [OPTION...] program.lua[x]",
    "Brozula compiles lua files to bytecode and then executes them using a JS VM",
    "",
    "Examples:",
    "  brozula myprogram.lua",
    "  brozula --print myprogram.lua",
    "  brozula -pb myprogram.luax",
    "",
    " Main operation mode:",
    "",
    "  -p, --print            Print the generated javascript",
    "  -x, --execute          Execute the generated javascript",
    "                         (This is the default behavior)",
    "",
    " Operation modifiers:",
    "",
    "  -u, --uglify           Compress the generated javascript using uglify-js",
    "  -b, --beautify         Beautify the generated javascript using uglify-js",
    ""
  ].join("\n"));
  process.exit(-1);
}

var pathResolve = require("path").resolve;

filename = pathResolve(process.cwd(), filename);
compile(filename, function (err, program) {
  if (err) throw err;
  program = "(function () {\n\n" + program + "\n\n}());";
  if (options.uglify) {
    var UglifyJS = require("uglify-js");
    var toplevel_ast = UglifyJS.parse(program);
    toplevel_ast.figure_out_scope();
    var compressor = UglifyJS.Compressor({});
    var compressed_ast = toplevel_ast.transform(compressor);
    compressed_ast.figure_out_scope();
    compressed_ast.compute_char_frequency();
    compressed_ast.mangle_names();
    program = compressed_ast.print_to_string({});
  }
  if (options.beautify) {
    var UglifyJS = require("uglify-js");
    var toplevel_ast = UglifyJS.parse(program);
    toplevel_ast.figure_out_scope();
    program = toplevel_ast.print_to_string({
      beautify: true,
      indent_level: 2
    });
  }
  if (options.print) console.log(program);
  if (options.execute) {
    eval(program);
  }
});
