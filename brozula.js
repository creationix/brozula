( // Module boilerplate to support browser globals, node.js and AMD.
  (typeof module !== "undefined" && function (m) { module.exports = m(); }) ||
  (typeof define === "function" && function (m) { define("brozula", m); }) ||
  (function (m) { window.brozula = m(); })
)(function () {
"use strict";

// For mapping enum integer values to opcode names
var opcodes = [
  "ISLT", "ISGE", "ISLE", "ISGT", "ISEQV", "ISNEV", "ISEQS", "ISNES", "ISEQN",
  "ISNEN", "ISEQP", "ISNEP", "ISTC", "ISFC", "IST", "ISF", "MOV", "NOT", "UNM",
  "LEN", "ADDVN", "SUBVN", "MULVN", "DIVVN", "MODVN", "ADDNV", "SUBNV", "MULNV",
  "DIVNV", "MODNV", "ADDVV", "SUBVV", "MULVV", "DIVVV", "MODVV", "POW", "CAT",
  "KSTR", "KCDATA", "KSHORT", "KNUM", "KPRI", "KNIL", "UGET", "USETV", "USETS",
  "USETN", "USETP", "UCLO", "FNEW", "TNEW", "TDUP", "GGET", "GSET", "TGETV",
  "TGETS", "TGETB", "TSETV", "TSETS", "TSETB", "TSETM", "CALLM", "CALL",
  "CALLMT", "CALLT", "ITERC", "ITERN", "VARG", "ISNEXT", "RETM", "RET", "RET0",
  "RET1", "FORI", "JFORI", "FORL", "IFORL", "JFORL", "ITERL", "IITERL",
  "JITERL", "LOOP", "ILOOP", "JLOOP", "JMP", "FUNCF", "IFUNCF", "JFUNCF",
  "FUNCV", "IFUNCV", "JFUNCV", "FUNCC", "FUNCCW"
];

// For mapping opcode names to parse instructions
var bcdef = {
  ISLT: {ma: "var", mc: "var", mt: "lt"},
  ISGE: {ma: "var", mc: "var", mt: "lt"},
  ISLE: {ma: "var", mc: "var", mt: "le"},
  ISGT: {ma: "var", mc: "var", mt: "le"},
  ISEQV: {ma: "var", mc: "var", mt: "eq"},
  ISNEV: {ma: "var", mc: "var", mt: "eq"},
  ISEQS: {ma: "var", mc: "str", mt: "eq"},
  ISNES: {ma: "var", mc: "str", mt: "eq"},
  ISEQN: {ma: "var", mc: "num", mt: "eq"},
  ISNEN: {ma: "var", mc: "num", mt: "eq"},
  ISEQP: {ma: "var", mc: "pri", mt: "eq"},
  ISNEP: {ma: "var", mc: "pri", mt: "eq"},
  ISTC: {ma: "dst", mc: "var"},
  ISFC: {ma: "dst", mc: "var"},
  IST: {mc: "var"},
  ISF: {mc: "var"},
  MOV: {ma: "dst", mc: "var"},
  NOT: {ma: "dst", mc: "var"},
  UNM: {ma: "dst", mc: "var", mt: "unm"},
  LEN: {ma: "dst", mc: "var", mt: "len"},
  ADDVN: {ma: "dst", mb: "var", mc: "num", mt: "add"},
  SUBVN: {ma: "dst", mb: "var", mc: "num", mt: "sub"},
  MULVN: {ma: "dst", mb: "var", mc: "num", mt: "mul"},
  DIVVN: {ma: "dst", mb: "var", mc: "num", mt: "div"},
  MODVN: {ma: "dst", mb: "var", mc: "num", mt: "mod"},
  ADDNV: {ma: "dst", mb: "var", mc: "num", mt: "add"},
  SUBNV: {ma: "dst", mb: "var", mc: "num", mt: "sub"},
  MULNV: {ma: "dst", mb: "var", mc: "num", mt: "mul"},
  DIVNV: {ma: "dst", mb: "var", mc: "num", mt: "div"},
  MODNV: {ma: "dst", mb: "var", mc: "num", mt: "mod"},
  ADDVV: {ma: "dst", mb: "var", mc: "var", mt: "add"},
  SUBVV: {ma: "dst", mb: "var", mc: "var", mt: "sub"},
  MULVV: {ma: "dst", mb: "var", mc: "var", mt: "mul"},
  DIVVV: {ma: "dst", mb: "var", mc: "var", mt: "div"},
  MODVV: {ma: "dst", mb: "var", mc: "var", mt: "mod"},
  POW: {ma: "dst", mb: "var", mc: "var", mt: "pow"},
  CAT: {ma: "dst", mb: "rbase", mc: "rbase", mt: "concat"},
  KSTR: {ma: "dst", mc: "str"},
  KCDATA: {ma: "dst", mc: "cdata"},
  KSHORT: {ma: "dst", mc: "lits"},
  KNUM: {ma: "dst", mc: "num"},
  KPRI: {ma: "dst", mc: "pri"},
  KNIL: {ma: "base", mc: "base"},
  UGET: {ma: "dst", mc: "uv"},
  USETV: {ma: "uv", mc: "var"},
  USETS: {ma: "uv", mc: "str"},
  USETN: {ma: "uv", mc: "num"},
  USETP: {ma: "uv", mc: "pri"},
  UCLO: {ma: "rbase", mc: "jump"},
  FNEW: {ma: "dst", mc: "func", mt: "gc"},
  TNEW: {ma: "dst", mc: "lit", mt: "gc"},
  TDUP: {ma: "dst", mc: "tab", mt: "gc"},
  GGET: {ma: "dst", mc: "str", mt: "index"},
  GSET: {ma: "var", mc: "str", mt: "newindex"},
  TGETV: {ma: "dst", mb: "var", mc: "var", mt: "index"},
  TGETS: {ma: "dst", mb: "var", mc: "str", mt: "index"},
  TGETB: {ma: "dst", mb: "var", mc: "lit", mt: "index"},
  TSETV: {ma: "var", mb: "var", mc: "var", mt: "newindex"},
  TSETS: {ma: "var", mb: "var", mc: "str", mt: "newindex"},
  TSETB: {ma: "var", mb: "var", mc: "lit", mt: "newindex"},
  TSETM: {ma: "base", mc: "num", mt: "newindex"},
  CALLM: {ma: "base", mb: "lit", mc: "lit", mt: "call"},
  CALL: {ma: "base", mb: "lit", mc: "lit", mt: "call"},
  CALLMT: {ma: "base", mc: "lit", mt: "call"},
  CALLT: {ma: "base", mc: "lit", mt: "call"},
  ITERC: {ma: "base", mb: "lit", mc: "lit", mt: "call"},
  ITERN: {ma: "base", mb: "lit", mc: "lit", mt: "call"},
  VARG: {ma: "base", mb: "lit", mc: "lit"},
  ISNEXT: {ma: "base", mc: "jump"},
  RETM: {ma: "base", mc: "lit"},
  RET: {ma: "rbase", mc: "lit"},
  RET0: {ma: "rbase", mc: "lit"},
  RET1: {ma: "rbase", mc: "lit"},
  FORI: {ma: "base", mc: "jump"},
  JFORI: {ma: "base", mc: "jump"},
  FORL: {ma: "base", mc: "jump"},
  IFORL: {ma: "base", mc: "jump"},
  JFORL: {ma: "base", mc: "lit"},
  ITERL: {ma: "base", mc: "jump"},
  IITERL: {ma: "base", mc: "jump"},
  JITERL: {ma: "base", mc: "lit"},
  LOOP: {ma: "rbase", mc: "jump"},
  ILOOP: {ma: "rbase", mc: "jump"},
  JLOOP: {ma: "rbase", mc: "lit"},
  JMP: {ma: "rbase", mc: "jump"},
  FUNCF: {ma: "rbase"},
  IFUNCF: {ma: "rbase"},
  JFUNCF: {ma: "rbase", mc: "lit"},
  FUNCV: {ma: "rbase"},
  IFUNCV: {ma: "rbase"},
  JFUNCV: {ma: "rbase", mc: "lit"},
  FUNCC: {ma: "rbase"},
  FUNCCW: {ma: "rbase"}
};

var kgctypes = ["CHILD", "TAB", "I64", "U64", "COMPLEX", "STR"];
var ktabtypes = ["NIL", "FALSE", "TRUE", "INT", "NUM", "STR"];
var kgcdecs = {
  TAB: function (parser) {
    var narray = parser.U();
    var nhash = parser.U();
    if (narray) {
      if (nhash) {
        throw new Error("TODO: implement mixed tables");
      }
      var tab = new Array(narray);
      for (var i = 0; i < narray; i++) {
        tab[i] = readktabk(parser);
      }
      return tab;
    }
    if (nhash) {
      var tab = {};
      for (var i = 0; i < nhash; i++) {
        var key = readktabk(parser);
        if (typeof key !== "string") throw new Error("TODO: Implement non-string keys");
        tab[key] = readktabk(parser);
      }
      return tab
    }
    return {};
  },
  I64: function (parser) {
    throw new Error("TODO: Implement I64 kgc decoder");
  },
  U64: function (parser) {
    throw new Error("TODO: Implement U64 kgc decoder");
  },
  COMPLEX: function (parser) {
    throw new Error("TODO: Implement COMPLEX kgc decoder");
  },
  STR: function (parser, len) {
    len -= 5; // Offset for STR enum
    var value = parser.buffer.slice(parser.index, parser.index + len).toString();
    parser.index += len;
    return value;
  }
};
var ktabdecs = {
  NIL: function (parser) {
    return null;
  },
  FALSE: function (parser) {
    return false;
  },
  TRUE: function (parser) {
    return true;
  },
  INT: function (parser) {
    return parser.U();
  },
  NUM: readknum,
  STR: kgcdecs.STR
};
// Opcodes that consume a jump
var conditionals = {ISLT: true, ISGE: true, ISLE: true, ISGT: true, ISEQV: true,
  ISNEV: true, ISEQS: true, ISNES: true, ISEQN: true, ISNEN: true, ISEQP: true,
  ISNEP: true, ISTC: true, ISFC: true, IST: true, ISF: true};

// Used to consume bytes from a bytecode stream
function Parser(buffer) {
  this.buffer = buffer;
  this.index = 0;
  this.mark = 0;
}
Parser.prototype.B = function () {
  return this.buffer[this.index++];
};
// Consume 16 bit value from stream and move pointer
Parser.prototype.H = function () {
  var value = this.buffer.readUInt16LE(this.index);
  this.index += 2;
  return value;
};
// Consume 32 bit value from stream and move pointer
Parser.prototype.W = function () {
  var value = this.buffer.readUInt32LE(this.index);
  this.index += 4;
  return value;
};
// Decode ULEB128 from the stream
// http://en.wikipedia.org/wiki/LEB128
Parser.prototype.U = function () {
  var value = 0;
  var shift = 0;
  do {
    var byte = this.buffer[this.index++];
    value |= (byte & 0x7f) << shift;
    shift += 7;
  } while (byte >= 0x80);
  return value >>> 0;
};

function readdump(buffer) {
  var parser = new Parser(buffer);

  // header = ESC 'L' 'J' versionB flagsU [namelenU nameB*]
  if (parser.B() !== 0x1b) throw new Error("Expected ESC in first byte");
  if (parser.B() !== 0x4c) throw new Error("Expected L in second byte");
  if (parser.B() !== 0x4a) throw new Error("Expected J in third byte");
  if (parser.B() !== 1) throw new Error("Only version 1 supported");
  var flags = parser.U();
  if (flags & 1) throw new Error("Big endian encoding not supported yet");
  if (!(flags & 2)) throw new Error("Non stripped bytecode not supported yet");
  if (flags & 4) throw new Error("FFI bytecode not supported");

  // proto+
  var protoBuffers = [];
  do {
    var len = parser.U();
    protoBuffers.push(buffer.slice(parser.index, parser.index + len));
    parser.index += len;
  } while (buffer[parser.index])

  // 0U and EOF
  if (parser.U() !== 0) throw new Error("Missing 0U at end of file");
  if (parser.index < buffer.length) throw new Error((length - parser.index) + " bytes leftover");

  return protoBuffers;

}

function readproto(buffer, protoIndex) {
  var parser = new Parser(buffer);

  // flagsB numparamsB framesizeB numuvB numkgcU numknU numbcU [debuglenU [firstlineU numlineU]]
  var flags = parser.B();
  var numparams = parser.B();
  var framesize = parser.B();
  var numuv = parser.B();
  var numkgc = parser.U();
  var numkn = parser.U();
  var numbc = parser.U();

  // bcinsW* uvdataH* kgc* knum*
  var bcins = new Array(numbc);
  for (var i = 0; i < numbc; i++) {
    bcins[i] = parser.W();
  }
  var uvdata = new Array(numuv);
  for (var i = 0; i < numuv; i++) {
    uvdata[i] = parser.H();
  }
  var constants = new Array(numkgc + numkn);
  var childc = protoIndex;
  for (var i = 0; i < numkgc; i++) {
    var kgctype = parser.U();
    var type = kgctypes[kgctype] || "STR";
    if (type === "CHILD") {
      constants[i + numkn] = --childc;
    }
    else {
      constants[i + numkn] = kgcdecs[type](parser, kgctype);
    }
  }
  for (var i = 0; i < numkn; i++) {
    constants[i] = readknum(parser);
  }

  // Make sure we consumed all the bytes properly
  if (parser.index !== buffer.length) throw new Error((buffer.length - parser.index) + " bytes leftover");

  var data = {
    flags: flags,
    numparams: numparams,
    framesize: framesize,
    bcins: bcins.map(parseOpcode),
    constants: constants
  };

  function parseArg(type, val, i) {
    switch (type) {
      case "lit": return val >>> 0;
      case "lits": return val;
      case "pri": return val === 0 ? null : val === 1 ? false : true;
      case "num": return constants[val];
      case "str":
      case "tab":
      case "func":
      case "cdata":
        return constants[constants.length - val - 1];
      case "uv": return uvdata[val];
      case "jump":
        return ((val & 0x80) ? val - 0x100: val) + i + 1;
      default:
        return val;
    }
  }

  function parseOpcode(word, i) {
    var opcode = opcodes[word & 0xff];
    var def = bcdef[opcode];
    var op = {
      op: opcode,
      args: []
    };
    var args = op.args;
    if (def.ma) {
      args.push(parseArg(def.ma, (word >> 8) & 0xff, i));
    }
    if (def.mb) {
      args.push(parseArg(def.mb, word >> 24, i));
    }
    if (def.mc) {
      args.push(parseArg(def.mc, (word >> 16) & 0xff, i));
    }
    if (def.md) {
      args.push(parseArg(def.mc, word >> 16, i));
    }
    return op;
  }

  return data;
};

function readknum(parser) {
  var isnum = parser.buffer[parser.index] & 1;
  var lo = parser.U() >> 1;
  if (isnum) {
    var buf = new Buffer(8);
    buf.writeUInt32LE(lo >>> 0, 0);
    buf.writeUInt32LE(parser.U(), 4);
    var num = buf.readDoubleLE(0);
    return num;
  }
  return lo;
}

// Read a constant table key or value
function readktabk(parser) {
  var ktabtype = parser.U();
  return ktabdecs[ktabtypes[ktabtype] || "STR"](parser, ktabtype);
}

var builtins = (function () {
  function falsy(val) {
    return val === false || val === null;
  }

  function length(val) {
   if (Array.isArray(val)) return val.length;
   if (typeof val === "string") return val.length;
   if (typeof val === "object") return 0;
   throw new Error("attempt to get length of " + type(val) + " value");
  }

  function type(val) {
    if (val === null) return ["nil"];
    if (typeof val === "object") return ["table"];
    return [typeof val];
  }

  function arr(val) {
    if (Array.isArray(val)) return val;
    if (val === undefined) return [];
    return [val];
  }

  function setmetatable(tab, meta) {
    Object.defineProperty(tab, "__metatable", {value:meta});
    return [tab];
  }

  function index(tab, key) {
    if (tab.hasOwnProperty(key)) {
      return tab[key];
    }
    if (tab.hasOwnProperty("__metatable")) {
      var metamethod = tab.__metatable.__index;
      if (metamethod) {
        if (typeof metamethod === "function") {
          return metamethod(tab, key);
        }
        if (metamethod.hasOwnProperty(key)) {
          return metamethod[key];
        }
      }
    }
    return null;
  }

  function newindex(tab, key, value) {
    if (tab.hasOwnProperty(key)) {
      return tab[key] = value;
    }
    if (tab.hasOwnProperty("__metatable")) {
      var metamethod = tab.__metatable.__newindex;
      if (metamethod) {
        return metamethod(tab, key, value);
      }
    }
    tab[key] = value;
  }

var builtins = {
  type: type,
  setmetatable: setmetatable,
  print: console.log.bind(console)
};
}).toString();
builtins = builtins.substr(14, builtins.length - 15);

// Generate a variable name for a stack slot
function slot(i) {
  return "$" + i.toString(36);
}
function pr(i) {
  return "fn" + i.toString(36);
}
function stateLabel(i) {
  return '"' + i.toString(36) + '"';
}

function compile(buffer, skipBuiltins) {
  var protos = readdump(buffer).map(readproto);
  var code = [];
  if (!skipBuiltins) {
    code.push(builtins);
  }

  protos.forEach(function (proto, protoIndex) {

//    console.error(proto);

    // Scan for the blocks by looking for jump targets
    var targets = {};
    var needBlock = false;
    for (var i = 0, l = proto.bcins.length; i < l; i++) {
      var bc = proto.bcins[i];
      var def = bcdef[bc.op];
      Object.keys(def).forEach(function (key, j) {
        if (def[key] !== "jump") return;
        targets[bc.args[j]] = true;
        needBlock = true;
      });
    }

    // Form the function header
    var line = "function " + pr(protoIndex) + "(";
    for (var i = 0; i < proto.numparams; i++) {
      if (i) line += ", ";
      line += slot(i);
    }
    line += "){";
    code.push(line);

    // Reserve a slow for the var line
    var varIndex = code.length;
    code.push(null);
    // Reserve the stack

    var state = {
     need$: false,
     need$$: false
    };

    if (needBlock) {
      code.push("var state=" + stateLabel(0) + ";");
      code.push("for(;;){");
      code.push("switch(state){");
      targets[0] = true;
    }

    // Compile the opcodes
    for (var i = 0, l = proto.bcins.length; i < l; i++) {
      var bc = proto.bcins[i];
      if (targets[i]) {
        code.push("case " + stateLabel(i) + ":");
      }

//      console.error(bc);
      var line = generators[bc.op].apply(state, bc.args);
      if (conditionals[bc.op]) {
        var next = proto.bcins[++i];
        line += "{" + generators[next.op].apply(state, next.args) + "}"
      }
//      console.error(line);
      code.push(line);
    }
    if (needBlock) {
      code.push("}}");
    }

    var vars = [];
    if (state.need$) vars.push("$");
    if (state.need$$) vars.push("$$");
    for (var i = proto.numparams; i < proto.framesize; i++) {
      vars.push(slot(i));
    }
    if (vars.length) {
      code[varIndex] = "var " + vars.join(",") + ";";
    }
    else {
      code[varIndex] = "";
    }


    code.push("}");
  });

  code.push("return " + pr(protos.length - 1) + ".apply(builtins, arguments);");

  return code.join("\n");

}

var generators = {
  ISLT: function (a, d) {
    return "if(" + slot(a) + "<" + slot(d) + ")";
  },
  ISGE: function (a, d) {
    return "if(" + slot(a) + ">" + slot(d) + ")";
  },
  ISLE: function (a, d) {
    return "if(" + slot(a) + "<=" + slot(d) + ")";
  },
  ISGT: function (a, d) {
    return "if(" + slot(a) + ">=" + slot(d) + ")";
  },
  ISEQV: function (a, d) {
    return "if(" + slot(a) + "===" + slot(d) + ")";
  },
  ISNEV: function (a, d) {
    return "if(" + slot(a) + "!==" + slot(d) + ")";
  },
  ISEQS: function (a, d) {
    return "if(" + slot(a) + "===" + JSON.stringify(d) + ")";
  },
  ISNES: function (a, d) {
    return "if(" + slot(a) + "!==" + JSON.stringify(d) + ")";
  },
  ISEQN: function (a, d) {
    return "if(" + slot(a) + "===" + d + ")";
  },
  ISNEN: function (a, d) {
    return "if(" + slot(a) + "!==" + d + ")";
  },
  ISEQP: function (a, d) {
    return "if(" + slot(a) + "===" + JSON.stringify(d) + ")";
  },
  ISNEP: function (a, d) {
    return "if(" + slot(a) + "!==" + JSON.stringify(d) + ")";
  },
  ISTC: function (a, d) {
    throw new Error("TODO: Implement me");
  },
  ISFC: function (a, d) {
    throw new Error("TODO: Implement me");
  },
  IST: function (d) {
    return "if(!falsy(" + slot(d) + "))";
  },
  ISF: function (d) {
    return "if(falsy(" + slot(d) + "))";
  },
  MOV: function (a, d) {
    return slot(a) + "=" + slot(d) + ";";
  },
  NOT: function (a, d) {
    return slot(a) + "=falsy(" + slot(d) + ");";
  },
  UNM: function (a, d) {
    return slot(a) + "=-" + slot(d) + ";";
  },
  LEN: function (a, d) {
    return slot(a) + "=length(" + slot(d) + ");";
  },
  ADDVN: function (a, b, c) {
    return slot(a) + "=" + slot(b) + "+" + c + ";";
  },
  SUBVN: function (a, b, c) {
    return slot(a) + "=" + slot(b) + "-" + c + ";";
  },
  MULVN: function (a, b, c) {
    return slot(a) + "=" + slot(b) + "*" + c + ";";
  },
  DIVVN: function (a, b, c) {
    return slot(a) + "=" + slot(b) + "/" + c + ";";
  },
  MODVN: function (a, b, c) {
    return slot(a) + "=" + slot(b) + "%" + c + ";";
  },
  ADDNV: function (a, b, c) {
    return slot(a) + "=" + slot(c) + "+" + b + ";";
  },
  SUBNV: function (a, b, c) {
    return slot(a) + "=" + slot(c) + "-" + b + ";";
  },
  MULNV: function (a, b, c) {
    return slot(a) + "=" + slot(c) + "*" + b + ";";
  },
  DIVNV: function (a, b, c) {
    return slot(a) + "=" + slot(c) + "/" + b + ";";
  },
  MODNV: function (a, b, c) {
    return slot(a) + "=" + slot(c) + "%" + b + ";";
  },
  ADDVV: function (a, b, c) {
    return slot(a) + "=" + slot(b) + "+" + slot(c) + ";";
  },
  SUBVV: function (a, b, c) {
    return slot(a) + "=" + slot(b) + "-" + slot(c) + ";";
  },
  MULVV: function (a, b, c) {
    return slot(a) + "=" + slot(b) + "*" + slot(c) + ";";
  },
  DIVVV: function (a, b, c) {
    return slot(a) + "=" + slot(b) + "/" + slot(c) + ";";
  },
  MODVV: function (a, b, c) {
    return slot(a) + "=" + slot(b) + "%" + slot(c) + ";";
  },
  POW: function (a, b, c) {
    return slot(a) + "=Math.pow(" + slot(b) + "," + slot(c) + ");";
  },
  CAT: function (a, b, c) {
    var line = slot(a) + "=''";
    for (var i = b; i <= c; i++) {
      line += "+" + slot(i);
    }
    return line + ";";
  },
  KSTR: function (a, d) {
    return slot(a) + "=" + JSON.stringify(d) + ";";
  },
  KCDATA: function (a, d) {
    throw new Error("TODO: Implement me");
  },
  KSHORT: function (a, d) {
    return slot(a) + "=" + d + ";";
  },
  KNUM: function (a, d) {
    return slot(a) + "=" + d + ";";
  },
  KPRI: function (a, d) {
    return slot(a) + "=" + JSON.stringify(d) + ";";
  },
  KNIL: function (a, d) {
    var line = "";
    while (a <= d) {
      line += slot(a) + "=null;";
    }
    return line;
  },
  UGET: function () {
    throw new Error("TODO: Implement me");
  },
  USETV: function () {
    throw new Error("TODO: Implement me");
  },
  USETS: function () {
    throw new Error("TODO: Implement me");
  },
  USETN: function () {
    throw new Error("TODO: Implement me");
  },
  USETP: function () {
    throw new Error("TODO: Implement me");
  },
  UCLO: function () {
    throw new Error("TODO: Implement me");
  },
  FNEW: function (a, d) {
    return slot(a) + "=" + pr(d) + ".bind(this);";
  },
  TNEW: function (a, d) {
    var arrayn = d & 0x7ff;
    var hashn = d >>> 11;
    if (!arrayn || hashn) return slot(a) + "={};";
    return slot(a) + "=new Array(" + arrayn + ");";
  },
  TDUP: function (a, d) {
    // TODO: handle more table types properly
    return slot(a) + "=" + JSON.stringify(d) + ";";
  },
  GGET: function (a, d) {
    return slot(a) + "=index(this," + JSON.stringify(d) + ");";
  },
  GSET: function (a, d) {
    return "newindex(this," + slot(a) + "," + JSON.stringify(d) + ");";
  },
  TGETV: function (a, b, c) {
    return slot(a) + "=index(" + slot(b) + "," + slot(c) + ");";
  },
  TGETS: function (a, b, c) {
    return slot(a) + "=index(" + slot(b) + "," + JSON.stringify(c) + ");";
  },
  TGETB: function (a, b, c) {
    return slot(a) + "=index(" + slot(b) + "," + c + ");";
  },
  TSETV: function (a, b, c) {
    return "newindex(" + slot(b) + "," + slot(c) + "," + slot(a) + ");";
  },
  TSETS: function (a, b, c) {
    return "newindex(" + slot(b) + "," + JSON.stringify(c) + "," + slot(a) + ");";
  },
  TSETB: function (a, b, c) {
    return "newindex(" + slot(b) + "," + c + "," + slot(a) + ");";
  },
  TSETM: function () {
    throw new Error("TODO: Implement me");
  },
  CALLM: function (a, b, c) {
    var line;
    if (b > 1) {
      line = "$=arr(";
      this.need$ = true;
    }
    else if (b == 0) {
      line = "$$=arr(";
      this.need$$ = true;
    }
    else { line = ""; }
    if (c) {
      line += slot(a) + ".apply(null,[";
      for (var i = a + 1; i <= a + c; i++) {
        if (i > a + 1) line += ",";
        line += slot(i);
      }
      line += "].concat($$)";
    }
    else {
      line += slot(a) + ".apply(null,$$";
    }
    if (b === 1) {
      line += ");";
    }
    else {
      line += "));";
    }
    if (b) {
      line += "$$=undefined;";
    }
    if (b > 1) {
      for (var i = 0; i < b - 1; i++) {
        line += slot(a + i) + "=$[" + i + "];";
      }
      line += "$=undefined;";
    }
    return line;
  },
  CALL: function (a, b, c) {
    var line;
    if (b > 1) {
      line = "$=arr(";
      this.need$ = true;
    }
    else if (b == 0) {
      line = "$$=arr(";
      this.need$$ = true;
    }
    else { line = ""; }
    line += slot(a) + "(";
    for (var i = a + 1; i < a + c; i++) {
      if (i > a + 1) line += ",";
      line += slot(i);
    }
    if (b === 1) {
      line += ");";
    }
    else {
      line += "));";
    }
    if (b > 1) {
      for (var i = 0; i < b - 1; i++) {
        line += slot(a + i) + "=$[" + i + "];";
      }
      line += "$=undefined;";
    }
    return line;
  },
  CALLMT: function () {
    throw new Error("TODO: Implement me");
  },
  CALLT: function () {
    throw new Error("TODO: Implement me");
  },
  ITERC: function () {
    throw new Error("TODO: Implement me");
  },
  ITERN: function () {
    throw new Error("TODO: Implement me");
  },
  VARG: function () {
    throw new Error("TODO: Implement me");
  },
  ISNEXT: function () {
    throw new Error("TODO: Implement me");
  },
  RETM: function () {
    throw new Error("TODO: Implement me");
  },
  RET: function () {
    throw new Error("TODO: Implement me");
  },
  RET0: function () {
    return "return[];";
  },
  RET1: function (a) {
    return "return[" + slot(a) + "];"
  },
  FORI: function () {
    throw new Error("TODO: Implement me");
  },
  JFORI: function () {
    throw new Error("TODO: Implement me");
  },
  FORL: function () {
    throw new Error("TODO: Implement me");
  },
  IFORL: function () {
    throw new Error("TODO: Implement me");
  },
  JFORL: function () {
    throw new Error("TODO: Implement me");
  },
  ITERL: function () {
    throw new Error("TODO: Implement me");
  },
  IITERL: function () {
    throw new Error("TODO: Implement me");
  },
  JITERL: function () {
    throw new Error("TODO: Implement me");
  },
  LOOP: function () {
    return "";
  },
  ILOOP: function () {
    throw new Error("TODO: Implement me");
  },
  JLOOP: function () {
    throw new Error("TODO: Implement me");
  },
  JMP: function (a, d) {
    return "state=" + stateLabel(d) + ";break;";
  },
  FUNCF: function () {
    throw new Error("TODO: Implement me");
  },
  IFUNCF: function () {
    throw new Error("TODO: Implement me");
  },
  JFUNCF: function () {
    throw new Error("TODO: Implement me");
  },
  FUNCV: function () {
    throw new Error("TODO: Implement me");
  },
  IFUNCV: function () {
    throw new Error("TODO: Implement me");
  },
  JFUNCV: function () {
    throw new Error("TODO: Implement me");
  },
  FUNCC: function () {
    throw new Error("TODO: Implement me");
  },
  FUNCCW: function () {
    throw new Error("TODO: Implement me");
  }
};

return {
  readdump: readdump,
  readproto: readproto,
  builtins: builtins,
  compile: compile,
  generators: generators
};

});
