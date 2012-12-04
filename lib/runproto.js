var bcdef = require('./opcodes').bcdef;
var readDump = require('../lib/readdump');
var readProto = require('../lib/readproto');
var Table = require('./table');
var inspect = require('util').inspect;

// Takes a bytecode dump buffer and parses and return a function to run.
module.exports = function (buffer) {
  var protos = readDump(buffer).map(readProto);
  var code = [];

  protos.forEach(function (proto, protoIndex) {

    console.error(inspect(proto, false, 3, true));

    // Form the function header
    var line = "\nfunction " + pr(protoIndex) + "(";
    for (var i = 0; i < proto.numparams; i++) {
      if (i) line += ", ";
      line += param(i);
    }
    line += ") {";
    code.push(line);

    // Reserve the stack
    if (proto.framesize) {
      var line = "  var $, $$, ";
      for (var i = 0; i < proto.framesize; i++) {
        if (i) line += ", ";
        line += slot(i);
      }
      line += ";";
      code.push(line);
    }

    var state = {
      indent: "  "
    };

    // Compile the opcodes
    proto.bcins.forEach(function (bc, bcIndex) {
      console.error(inspect(bc, false, 3, true));
      code.push(state.indent + opcodes[bc.op].apply(state, bc.args));
    });

    if (protoIndex < protos.length - 1) {
      code.push("},");
    }
    else {
      code.push("}\n");
    }
  });

  code.push("return " + pr(protos.length - 1) + ".apply(newState(), arguments);");

  return code.join("\n");

};

// Generate a variable name for a stack slot
function slot(i) {
  return "$" + i.toString(36);
}
function param(i) {
  return "_" + i.toString(36);
}
function pr(i) {
  return "fn" + i.toString(36);
}

var opcodes = {
  ISLT: function () {
    throw new Error("TODO: Implement me");
  },
  ISGE: function () {
    throw new Error("TODO: Implement me");
  },
  ISLE: function () {
    throw new Error("TODO: Implement me");
  },
  ISGT: function () {
    throw new Error("TODO: Implement me");
  },
  ISEQV: function () {
    throw new Error("TODO: Implement me");
  },
  ISNEV: function () {
    throw new Error("TODO: Implement me");
  },
  ISEQS: function () {
    throw new Error("TODO: Implement me");
  },
  ISNES: function () {
    throw new Error("TODO: Implement me");
  },
  ISEQN: function () {
    throw new Error("TODO: Implement me");
  },
  ISNEN: function () {
    throw new Error("TODO: Implement me");
  },
  ISEQP: function () {
    throw new Error("TODO: Implement me");
  },
  ISNEP: function () {
    throw new Error("TODO: Implement me");
  },
  ISTC: function () {
    throw new Error("TODO: Implement me");
  },
  ISFC: function () {
    throw new Error("TODO: Implement me");
  },
  IST: function () {
    throw new Error("TODO: Implement me");
  },
  ISF: function () {
    throw new Error("TODO: Implement me");
  },
  MOV: function () {
    throw new Error("TODO: Implement me");
  },
  NOT: function () {
    throw new Error("TODO: Implement me");
  },
  UNM: function () {
    throw new Error("TODO: Implement me");
  },
  LEN: function () {
    throw new Error("TODO: Implement me");
  },
  ADDVN: function () {
    throw new Error("TODO: Implement me");
  },
  SUBVN: function () {
    throw new Error("TODO: Implement me");
  },
  MULVN: function () {
    throw new Error("TODO: Implement me");
  },
  DIVVN: function () {
    throw new Error("TODO: Implement me");
  },
  MODVN: function () {
    throw new Error("TODO: Implement me");
  },
  ADDNV: function () {
    throw new Error("TODO: Implement me");
  },
  SUBNV: function () {
    throw new Error("TODO: Implement me");
  },
  MULNV: function () {
    throw new Error("TODO: Implement me");
  },
  DIVNV: function () {
    throw new Error("TODO: Implement me");
  },
  MODNV: function () {
    throw new Error("TODO: Implement me");
  },
  ADDVV: function (a, b, c) {
    return slot(a) + " = " + slot(b) + " + " + slot(c) + ";";
  },
  SUBVV: function () {
    throw new Error("TODO: Implement me");
  },
  MULVV: function () {
    throw new Error("TODO: Implement me");
  },
  DIVVV: function () {
    throw new Error("TODO: Implement me");
  },
  MODVV: function () {
    throw new Error("TODO: Implement me");
  },
  POW: function () {
    throw new Error("TODO: Implement me");
  },
  CAT: function () {
    throw new Error("TODO: Implement me");
  },
  KSTR: function (a, d) {
    return slot(a) + " = " + JSON.stringify(d) + ";";
  },
  KCDATA: function (a, d) {
    throw new Error("TODO: Implement me");
  },
  KSHORT: function (a, d) {
    return slot(a) + " = 0x" + d.toString(16) + ";";
  },
  KNUM: function (a, d) {
    return slot(a) + " = " + d + ";";
  },
  KPRI: function (a, d) {
    return slot(a) + " = " + JSON.stringify(d) + ";";
  },
  KNIL: function (a, d) {
    var line = "";
    while (a <= d) {
      line += slot(a) + " = null;";
      if (a < d) line += "\n" + this.indent;
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

    throw new Error("TODO: Implement me");
  },
  TNEW: function (a, d) {
    return slot(a) + " = new Table(" + (d & 0x7ff) + ", " + Math.pow(2, d >>> 11) + ");";
  },
  TDUP: function () {
    throw new Error("TODO: Implement me");
  },
  GGET: function (a, d) {
    return slot(a) + " = this[" + JSON.stringify(d) + "];";
  },
  GSET: function () {
    throw new Error("TODO: Implement me");
  },
  TGETV: function () {
    throw new Error("TODO: Implement me");
  },
  TGETS: function () {
    throw new Error("TODO: Implement me");
  },
  TGETB: function () {
    throw new Error("TODO: Implement me");
  },
  TSETV: function () {
    throw new Error("TODO: Implement me");
  },
  TSETS: function () {
    throw new Error("TODO: Implement me");
  },
  TSETB: function () {
    throw new Error("TODO: Implement me");
  },
  TSETM: function () {
    throw new Error("TODO: Implement me");
  },
  CALLM: function (a, b, c) {
    var line;
    if (b > 1) { line = "$ = "; }
    else if (b == 0) { line = "$$ = "; }
    else { line = ""; }
    line += slot(a) + ".apply(null, [";
    if (c) {
      for (var i = a + 1; i <= a + c; i++) {
        if (i > a + 1) line += ", ";
        line += slot(i);
      }
      line += "].concat($$)";
    }
    else {
      line += slot(a) + "$$";
    }
    line += ");";
    if (b) {
      line += "\n" + this.indent + "$$ = undefined;";
    }

    if (b > 1) {
      for (var i = 0; i < b - 1; i++) {
        line += "\n" + this.indent + slot(a + i) + " = $[" + i + "];";
      }
      line += "\n" + this.indent + "$ = undefined;";
    }
    return line;
  },
  CALL: function (a, b, c) {
    var line;
    if (b > 1) { line = "$ = "; }
    else if (b == 0) { line = "$$ = "; }
    else { line = ""; }
    line += slot(a) + "(";
    for (var i = a + 1; i < a + c; i++) {
      if (i > a + 1) line += ", ";
      line += slot(i);
    }
    line += ");";
    if (b > 1) {
      for (var i = 0; i < b - 1; i++) {
        line += "\n" + this.indent + slot(a + i) + " = $[" + i + "];";
      }
      line += "\n" + this.indent + "$ = undefined;";
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
    return "return [];";
  },
  RET1: function (a) {
    return "return [" + slot(a) + "];"
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
    throw new Error("TODO: Implement me");
  },
  ILOOP: function () {
    throw new Error("TODO: Implement me");
  },
  JLOOP: function () {
    throw new Error("TODO: Implement me");
  },
  JMP: function () {
    throw new Error("TODO: Implement me");
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
