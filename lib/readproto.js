var Parser = require('./parser');

var opcodes = require('./opcodes').opcodes;
var bcdef = require('./opcodes').bcdef;
var kgctypes = ["CHILD", "TAB", "I64", "U64", "COMPLEX", "STR"];
var ktabtypes = ["NIL", "FALSE", "TRUE", "INT", "NUM", "STR"];

module.exports = function (buffer) {
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
  for (var i = 0; i < numkgc; i++) {
    var kgctype = parser.U();
    constants[i + numkn] = kgcdecs[kgctypes[kgctype] || "STR"](parser, kgctype);
  }
  var knum = new Array(numkn);
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
//      case "func":
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
    if (def.mt) {
//      args.push(def.mt);
    }
    return op;
  }

  return data;
};

function Child() {}

var kgcdecs = {
  CHILD: function (parser) {
    // TODO: figure this out.  It appears to be zero bytes long whatever it is.
    return new Child();
  },
  TAB: function (parser) {
    var narray = parser.U();
    var nhash = parser.U();
    var table;
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
