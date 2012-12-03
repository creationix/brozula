var Parser = require('./parser');
var Table = require('./table');

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
  console.log("HEAD", parser.dump());

  // bcinsW* uvdataH* kgc* knum*
  var bcins = new Array(numbc);
  for (var i = 0; i < numbc; i++) {
    bcins[i] = parser.W();
    console.log("bcins", parser.dump());
  }
  var uvdata = new Array(numuv);
  for (var i = 0; i < numuv; i++) {
    uvdata[i] = parser.H();
    console.log("uvdata", parser.dump());
  }
  var kgc = new Array(numkgc);
  for (var i = 0; i < numkgc; i++) {
    var kgctype = parser.U();
    kgc[i] = kgcdecs[kgctypes[kgctype] || "STR"](parser, kgctype);
    console.log("kgc", parser.dump());
  }

  var knum = new Array(numkn);
  for (var i = 0; i < numkn; i++) {
    knum[i] = readknum(parser);
    console.log("knum", parser.dump());
  }

  if (parser.index !== buffer.length) throw new Error((buffer.length - parser.index) + " bytes leftover");

  return {
    flags: flags,
    numparams: numparams,
    framesize: framesize,
    bcins: bcins,
    uvdata: uvdata,
    kgc: kgc,
    knum: knum
  };
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
    var tab = new Table(narray, nhash);
    for (var i = 0; i < narray; i++) {
      tab.array[i] = readktabk(parser);
    }
    for (var i = 0; i < nhash; i++) {
      tab.keys[i] = readktabk(parser);
      tab.values[i] = readktabk(parser);
    }
    return tab;
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
