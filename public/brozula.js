var xhr = new XMLHttpRequest();
xhr.open('GET', 'test.luac', true);
xhr.responseType = 'arraybuffer';

xhr.onload = function(e) {
  new Dump(this.response);
};

xhr.send();

var opcodes = ["ISLT", "ISGE", "ISLE", "ISGT", "ISEQV", "ISNEV", "ISEQS",
  "ISNES", "ISEQN", "ISNEN", "ISEQP", "ISNEP", "ISTC", "ISFC", "IST", "ISF",
  "MOV", "NOT", "UNM", "LEN", "ADDVN", "SUBVN", "MULVN", "DIVVN", "MODVN",
  "ADDNV", "SUBNV", "MULNV", "DIVNV", "MODNV", "ADDVV", "SUBVV", "MULVV",
  "DIVVV", "MODVV", "POW", "CAT", "KSTR", "KCDATA", "KSHORT", "KNUM", "KPRI",
  "KNIL", "UGET", "USETV", "USETS", "USETN", "USETP", "UCLO", "FNEW", "TNEW",
  "TDUP", "GGET", "GSET", "TGETV", "TGETS", "TGETB", "TSETV", "TSETS", "TSETB",
  "TSETM", "CALLM", "CALL", "CALLMT", "CALLT", "ITERC", "ITERN", "VARG",
  "ISNEXT", "RETM", "RET", "RET0", "RET1", "FORI", "JFORI", "FORL", "IFORL",
  "JFORL", "ITERL", "IITERL", "JITERL", "LOOP", "ILOOP", "JLOOP", "JMP",
  "FUNCF", "IFUNCF", "JFUNCF", "FUNCV", "IFUNCV", "JFUNCV", "FUNCC", "FUNCCW"];

var optypes = {
  ISLT: "AD", ISGE: "AD", ISLE: "AD", ISGT: "AD", ISEQV: "AD", ISNEV: "AD",
  ISEQS: "AD", ISNES: "AD", ISEQN: "AD", ISNEN: "AD", ISEQP: "AD", ISNEP: "AD",
  ISTC: "AD", ISFC: "AD", IST: "D", ISF: "D", MOV: "AD", NOT: "AD", UNM: "AD",
  LEN: "AD", ADDVN: "ABC", SUBVN: "ABC", MULVN: "ABC", DIVVN: "ABC",
  MODVN: "ABC", ADDNV: "ABC", SUBNV: "ABC", MULNV: "ABC", DIVNV: "ABC",
  MODNV: "ABC", ADDVV: "ABC", SUBVV: "ABC", MULVV: "ABC", DIVVV: "ABC",
  MODVV: "ABC", POW: "ABC", CAT: "ABC", KSTR: "AD", KCDATA: "AD", KSHORT: "AD",
  KNUM: "AD", KPRI: "AD", KNIL: "AD", UGET: "AD", USETV: "AD", USETS: "AD",
  USETN: "AD", USETP: "AD", UCLO: "AD", FNEW: "AD", TNEW: "AD", TDUP: "AD",
  GGET: "AD", GSET: "AD", TGETV: "ABC", TGETS: "ABC", TGETB: "ABC",
  TSETV: "ABC", TSETS: "ABC", TSETB: "ABC", TSETM: "AD", CALLM: "ABC",
  CALL: "ABC", CALLMT: "AD", CALLT: "AD", ITERC: "ABC", ITERN: "ABC",
  VARG: "ABC", ISNEXT: "AD", RETM: "AD", RET: "AD", RET0: "AD", RET1: "AD",
  FORI: "AD", JFORI: "AD", FORL: "AD", IFORL: "AD", JFORL: "AD", ITERL: "AD",
  IITERL: "AD", JITERL: "AD", LOOP: "AD", ILOOP: "AD", JLOOP: "AD", JMP: "AD",
  FUNCF: "A", IFUNCF: "A", JFUNCF: "AD", FUNCV: "A", IFUNCV: "A", JFUNCV: "AD",
  FUNCC: "A", FUNCCW: "A"
}

var opdecs = {
  ABC: function (stream, name) {
    return [name, stream.B(), stream.B(), stream.B()];
  },
  AD: function (stream, name) {
    return [name, stream.B(), stream.H()];
  },
  A: function (stream, name) {
    var data = [name, stream.B()];
    stream.index += 2;
    return data;
  },
  D: function (stream, name) {
    stream.index++;
    return [name, stream.H()];
  },
}

Object.keys(optypes).forEach(function (key) {
  optypes[key] = opdecs[optypes[key]];
});

/*
// Check keys match
Object.keys(optypes).forEach(function (key) {
  if (opcodes.indexOf(key) < 0) console.log(key, "extra");
});
opcodes.forEach(function (key) {
  if (opcodes.indexOf(key) < 0) console.log(key, "missing");
});
*/

var ktypes = ["CHILD", "TAB", "I64", "U64", "COMPLEX", "STR"];
var vtypes = ["NIL", "FALSE", "TRUE", "INT", "NUM", "STR"];

function Dump(buffer) {
  this.index = 0;
  this.buffer = buffer;
  this.view = new Uint8Array(buffer);
  this.header();
  while (this.view[this.index]) {
    var pdata = this.proto();
    console.log("pdata", pdata, pdata.ops);
  }
  if (this.U() !== 0) throw new Error("Missing 0U at end of file");
  if (this.index !== this.buffer.byteLength) throw new Error("Length mismatch");
}

// Consume 8 bit value from stream and move pointer
Dump.prototype.B = function () {
  return this.view[this.index++];
};

// Consume 16 bit value from stream and move pointer
Dump.prototype.H = function () {
  return this.view[this.index++] +
        (this.view[this.index++] << 8);
};

// Consume 32 bit value from stream and move pointer
Dump.prototype.W = function () {
  return this.view[this.index++] +
        (this.view[this.index++] << 8) +
        (this.view[this.index++] << 16) +
        (this.view[this.index++] << 24);
};

// Decode ULEB128 from the stream
// http://en.wikipedia.org/wiki/LEB128
Dump.prototype.U = function () {
  var value = 0;
  var shift = 0;
  do {
    var byte = this.view[this.index++];
    value |= (byte & 0x7f) << shift;
    shift += 7;
  } while (byte >= 0x80);
  return value;
};

// ESC 'L' 'J' versionB flagsU [namelenU nameB*]
Dump.prototype.header = function () {
  if (this.B() !== 0x1b) throw new Error("Expected ESC in first byte");
  if (this.B() !== 0x4c) throw new Error("Expected L in second byte");
  if (this.B() !== 0x4a) throw new Error("Expected J in third byte");
  var version = this.B();
  if (version !== 1) throw new Error("Only version 1 supported");
  var flags = this.U();
  if (flags & 1) throw new Error("Big endian encoding not supported yet");
  if (!(flags & 2)) throw new Error("Non stripped bytecode not supported yet");
  if (flags & 4) throw new Error("FFI bytecode not supported");
  return this;
}

// lengthU pdata
Dump.prototype.proto = function () {
  var length = this.U();
  var pdata = new PData(this.buffer, this.index, length);
  this.index += length;
  return pdata;
};



function PData(buffer, offset, length) {
  this.index = 0;
  this.buffer = buffer;
  this.offset = offset;
  this.view = new Uint8Array(buffer, offset, length);
  this.phead();

  // Parse the opcode instructions
  var base = this.index;
  this.ops = new Array(this.numbc);
  for (var i = 0; i < this.numbc; i++) {
    this.index = base + i * 4;
    var opcode = opcodes[this.B()];
    this.ops[i] = optypes[opcode](this, opcode);
  }
  this.index = base + i * 4;

  this.uvs = new Array(this.numuv);
  for (var i = 0; i < this.numuv; i++) {
    this.uvs[i] = this.H();
  }

  this.kgcs = new Array(this.numkgc);
  for (var i = 0; i < this.numkgc; i++) {
    this.kgcs[i] = this.kgc();
  }

  this.knums = new Array(this.numkn);
  for (var i = 0; i < this.numkn; i++) {
    this.knums[i] = this.U();
  }

  // Make sure we parsed it all
  if (this.index !== length) throw new Error((length - this.index) + " unparsed bytes in pdata block");
}

PData.prototype.B = Dump.prototype.B;
PData.prototype.H = Dump.prototype.H;
PData.prototype.W = Dump.prototype.W;
PData.prototype.U = Dump.prototype.U;

// flagsB numparamsB framesizeB numuvB numkgcU numknU numbcU [debuglenU [firstlineU numlineU]]
PData.prototype.phead = function () {
  this.flags = this.B();
  this.numparams = this.B();
  this.framesize = this.B();
  this.numuv = this.B();
  this.numkgc = this.U();
  this.numkn = this.U();
  this.numbc = this.U();
};

// kgctypeU { ktab | (loU hiU) | (rloU rhiU iloU ihiU) | strB* }
PData.prototype.kgc = function () {
  var typeIndex =this.U()
  var type = ktypes[typeIndex] || "STR";
  if (type === "STR") {
      var len = typeIndex - 5;
      var string = new Uint8Array(this.buffer, this.offset + this.index, len);
      this.index += len;
      return string;
  }
  if (type === "TAB") {
    return this.ktab();
  }
  throw new Error("TODO: Implement " + type + " type.");
};

// ktab   = narrayU nhashU karray* khash
PData.prototype.ktab = function () {
  var narray = this.U();
  var nhash = this.U();
  var array = new Array(narray);
  var keys = new Array(nhash);
  var values = new Array(nhash);
  for (var i = 0; i < narray; i++) {
    array[i] = this.ktabk()
  }
  for (var i = 0; i < nhash; i++) {
    keys[i] = this.ktabk();
    values[i] = this.ktabk();
  }
  console.log("TAB", [array, keys, values]);
  return [array, keys, values];
};

PData.prototype.ktabk = function () {
  var typeIndex = this.U();
  var type = vtypes[typeIndex] || "STR";
  if (type === "STR") {
      var len = typeIndex - 5;
      var string = new Uint8Array(this.buffer, this.offset + this.index, len);
      this.index += len;
      return string;
  }
  if (type === "NIL") return null;
  if (type === "FALSE") return false;
  if (type === "TRUE") return true;
  if (type === "INT") return this.U();
  throw new Error("TODO: Implement ktabk for " + type);
};