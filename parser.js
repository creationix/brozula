( // Module boilerplate to support browser globals, node.js and AMD.
  (typeof module !== "undefined" && function (m) { module.exports = m(); }) ||
  (typeof define === "function" && function (m) { define(m); }) ||
  (function (m) { window.brozula = window.brozula || {}; window.brozula.parse = m(); })
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
  ISLT: {ma: "var", md: "var", mt: "lt"},
  ISGE: {ma: "var", md: "var", mt: "lt"},
  ISLE: {ma: "var", md: "var", mt: "le"},
  ISGT: {ma: "var", md: "var", mt: "le"},
  ISEQV: {ma: "var", md: "var", mt: "eq"},
  ISNEV: {ma: "var", md: "var", mt: "eq"},
  ISEQS: {ma: "var", md: "str", mt: "eq"},
  ISNES: {ma: "var", md: "str", mt: "eq"},
  ISEQN: {ma: "var", md: "num", mt: "eq"},
  ISNEN: {ma: "var", md: "num", mt: "eq"},
  ISEQP: {ma: "var", md: "pri", mt: "eq"},
  ISNEP: {ma: "var", md: "pri", mt: "eq"},
  ISTC: {ma: "dst", md: "var"},
  ISFC: {ma: "dst", md: "var"},
  IST: {md: "var"},
  ISF: {md: "var"},
  MOV: {ma: "dst", md: "var"},
  NOT: {ma: "dst", md: "var"},
  UNM: {ma: "dst", md: "var", mt: "unm"},
  LEN: {ma: "dst", md: "var", mt: "len"},
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
  KSTR: {ma: "dst", md: "str"},
  KCDATA: {ma: "dst", md: "cdata"},
  KSHORT: {ma: "dst", md: "lits"},
  KNUM: {ma: "dst", md: "num"},
  KPRI: {ma: "dst", md: "pri"},
  KNIL: {ma: "base", md: "base"},
  UGET: {ma: "dst", md: "uv"},
  USETV: {ma: "uv", md: "var"},
  USETS: {ma: "uv", md: "str"},
  USETN: {ma: "uv", md: "num"},
  USETP: {ma: "uv", md: "pri"},
  UCLO: {ma: "rbase", md: "jump"},
  FNEW: {ma: "dst", md: "func", mt: "gc"},
  TNEW: {ma: "dst", md: "lit", mt: "gc"},
  TDUP: {ma: "dst", md: "tab", mt: "gc"},
  GGET: {ma: "dst", md: "str", mt: "index"},
  GSET: {ma: "var", md: "str", mt: "newindex"},
  TGETV: {ma: "dst", mb: "var", mc: "var", mt: "index"},
  TGETS: {ma: "dst", mb: "var", mc: "str", mt: "index"},
  TGETB: {ma: "dst", mb: "var", mc: "lit", mt: "index"},
  TSETV: {ma: "var", mb: "var", mc: "var", mt: "newindex"},
  TSETS: {ma: "var", mb: "var", mc: "str", mt: "newindex"},
  TSETB: {ma: "var", mb: "var", mc: "lit", mt: "newindex"},
  TSETM: {ma: "base", md: "num", mt: "newindex"},
  CALLM: {ma: "base", mb: "lit", mc: "lit", mt: "call"},
  CALL: {ma: "base", mb: "lit", mc: "lit", mt: "call"},
  CALLMT: {ma: "base", md: "lit", mt: "call"},
  CALLT: {ma: "base", md: "lit", mt: "call"},
  ITERC: {ma: "base", mb: "lit", mc: "lit", mt: "call"},
  ITERN: {ma: "base", mb: "lit", mc: "lit", mt: "call"},
  VARG: {ma: "base", mb: "lit", mc: "lit"},
  ISNEXT: {ma: "base", md: "jump"},
  RETM: {ma: "base", md: "lit"},
  RET: {ma: "rbase", md: "lit"},
  RET0: {ma: "rbase", md: "lit"},
  RET1: {ma: "rbase", md: "lit"},
  FORI: {ma: "base", md: "jump"},
  JFORI: {ma: "base", md: "jump"},
  FORL: {ma: "base", md: "jump"},
  IFORL: {ma: "base", md: "jump"},
  JFORL: {ma: "base", md: "lit"},
  ITERL: {ma: "base", md: "jump"},
  IITERL: {ma: "base", md: "jump"},
  JITERL: {ma: "base", md: "lit"},
  LOOP: {ma: "rbase", md: "jump"},
  ILOOP: {ma: "rbase", md: "jump"},
  JLOOP: {ma: "rbase", md: "lit"},
  JMP: {ma: "rbase", md: "jump"},
  FUNCF: {ma: "rbase"},
  IFUNCF: {ma: "rbase"},
  JFUNCF: {ma: "rbase", md: "lit"},
  FUNCV: {ma: "rbase"},
  IFUNCV: {ma: "rbase"},
  JFUNCV: {ma: "rbase", md: "lit"},
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
      return tab;
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
  var byte;
  do {
    byte = this.buffer[this.index++];
    value |= (byte & 0x7f) << shift;
    shift += 7;
  } while (byte >= 0x80);
  return value >>> 0;
};

function parse(buffer) {
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
  var protos = [];
  do {
    var len = parser.U();
    var protoBuffer = buffer.slice(parser.index, parser.index + len);
    protos.push(readproto(protoBuffer, protos.length - 1));
    parser.index += len;
  } while (buffer[parser.index]);

  // 0U and EOF
  if (parser.U() !== 0) throw new Error("Missing 0U at end of file");
  if (parser.index < buffer.length) throw new Error((length - parser.index) + " bytes leftover");

  return protos;

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

  function parseArg(type, val, i) {
    switch (type) {
      case "lit": return val >>> 0;
      case "lits": return val & 0x8000 ? val - 0x10000 : val;
      case "pri": return val === 0 ? null : val === 1 ? false : true;
      case "num": return constants[val];
      case "str": case "tab": case "func": case "cdata":
        return constants[constants.length - val - 1];
      case "uv": return uvdata[val];
      case "jump": return val - 0x8000;
      default: return val;
    }
  }

  function parseOpcode(word, i) {
    var opcode = opcodes[word & 0xff];
    var def = bcdef[opcode];
    var op = {
      op: opcode
    };
    if (def.ma) {
      op.a =parseArg(def.ma, (word >>> 8) & 0xff, i);
    }
    if (def.mb) {
      op.b = parseArg(def.mb, word >>> 24, i);
    }
    if (def.mc) {
      op.c = parseArg(def.mc, (word >>> 16) & 0xff, i);
    }
    if (def.md) {
      op.d = parseArg(def.md, word >>> 16, i);
    }
    return op;
  }

  return {
    flags: flags,
    numparams: numparams,
    framesize: framesize,
    bcins: bcins.map(parseOpcode)
  };
}

function readknum(parser) {
  var isnum = parser.buffer[parser.index] & 1;
  var lo = parser.U() >>> 1;
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


return parse;

});
