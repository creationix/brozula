var bcdef = require('./opcodes').bcdef;
var readDump = require('../lib/readdump');
var readProto = require('../lib/readproto');
var inspect = require('util').inspect;

// Opcodes that consume a jump
var conditionals = {ISLT: true, ISGE: true, ISLE: true, ISGT: true, ISEQV: true,
  ISNEV: true, ISEQS: true, ISNES: true, ISEQN: true, ISNEN: true, ISEQP: true,
  ISNEP: true, ISTC: true, ISFC: true, IST: true, ISF: true};

var ident = /^[a-z_$][a-z0-9_$]*$/i;
var reserved = { "break": true, "case": true, "catch": true, "continue": true,
  "debugger": true, "default": true, "delete": true, "do": true, "else": true,
  "finally": true, "for": true, "function": true, "if": true, "in": true,
  "instanceof": true, "new": true, "return": true, "switch": true, "this": true,
  "throw": true, "try": true, "typeof": true, "var": true, "void": true,
  "while": true, "with  ": true };
// Helper that tells us if a string is a valid javascript identifier
function isIdent(name) {
  return !reserved[name] && ident.test(name);
}

// Takes a bytecode dump buffer and parses and return a function to run.
module.exports = function (buffer) {
  var protos = readDump(buffer).map(readProto);
  var code = [];

  protos.forEach(function (proto, protoIndex) {

    console.error(inspect(proto, false, 3, true));

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
    line += ") {";
    code.push(line);

    // Reserve the stack
    var line = "  var $, $$, ";
    for (var i = proto.numparams; i < proto.framesize; i++) {
      if (i > proto.numparams) line += ", ";
      line += slot(i);
    }
    line += ";";
    code.push(line);

    var state = {};

    if (needBlock) {
      code.push("  var state = " + stateLabel(0) + ";");
      code.push("  for(;;) {");
      code.push("    loop: switch(state) {");
      state.indent = "      ";
      targets[0] = true;
    }
    else {
      state.indent = "  ";
    }

    // Compile the opcodes
    for (var i = 0, l = proto.bcins.length; i < l; i++) {
      var bc = proto.bcins[i];
      if (targets[i]) {
        code.push("    case " + stateLabel(i) + ":");
      }

      console.error(inspect(bc, false, 3, true));
      var line = state.indent + opcodes[bc.op].apply(state, bc.args);
      if (conditionals[bc.op]) {
        var next = proto.bcins[++i];
        console.error(inspect(next, false, 3, true));
        line += " { " + opcodes[next.op].apply(state, next.args) + " }"
      }
      console.error(line);
      code.push(line);
    }
    if (needBlock) {
      code.push("    }\n  }");
    }

    code.push("}\n");
  });

  code.push("return " + pr(protos.length - 1) + ".apply(newState(), arguments);");

  return code.join("\n");

};

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

var opcodes = {
  ISLT: function (a, d) {
    return "if (" + slot(a) + " < " + slot(d) + ")";
  },
  ISGE: function (a, d) {
    return "if (" + slot(a) + " > " + slot(d) + ")";
  },
  ISLE: function (a, d) {
    return "if (" + slot(a) + " <= " + slot(d) + ")";
  },
  ISGT: function (a, d) {
    return "if (" + slot(a) + " >= " + slot(d) + ")";
  },
  ISEQV: function (a, d) {
    return "if (" + slot(a) + " === " + slot(d) + ")";
  },
  ISNEV: function (a, d) {
    return "if (" + slot(a) + " !== " + slot(d) + ")";
  },
  ISEQS: function (a, d) {
    return "if (" + slot(a) + " === " + JSON.stringify(d) + ")";
  },
  ISNES: function (a, d) {
    return "if (" + slot(a) + " !== " + JSON.stringify(d) + ")";
  },
  ISEQN: function (a, d) {
    return "if (" + slot(a) + " === " + d + ")";
  },
  ISNEN: function (a, d) {
    return "if (" + slot(a) + " !== " + d + ")";
  },
  ISEQP: function (a, d) {
    return "if (" + slot(a) + " === " + JSON.stringify(d) + ")";
  },
  ISNEP: function (a, d) {
    return "if (" + slot(a) + " !== " + JSON.stringify(d) + ")";
  },
  ISTC: function (a, d) {
    throw new Error("TODO: Implement me");
  },
  ISFC: function (a, d) {
    throw new Error("TODO: Implement me");
  },
  IST: function (d) {
    return "if (!falsy(" + slot(d) + "))";
  },
  ISF: function (d) {
    return "if (falsy(" + slot(d) + "))";
  },
  MOV: function (a, d) {
    return slot(a) + " = " + slot(d) + ";";
  },
  NOT: function (a, d) {
    return slot(a) + " = falsy(" + slot(d) + ");";
  },
  UNM: function (a, d) {
    return slot(a) + " = -" + slot(d) + ";";
  },
  LEN: function (a, d) {
    return slot(a) + " = length(" + slot(d) + ");";
  },
  ADDVN: function (a, b, c) {
    return slot(a) + " = " + slot(b) + " + " + c + ";";
  },
  SUBVN: function (a, b, c) {
    return slot(a) + " = " + slot(b) + " - " + c + ";";
  },
  MULVN: function (a, b, c) {
    return slot(a) + " = " + slot(b) + " * " + c + ";";
  },
  DIVVN: function (a, b, c) {
    return slot(a) + " = " + slot(b) + " / " + c + ";";
  },
  MODVN: function (a, b, c) {
    return slot(a) + " = " + slot(b) + " % " + c + ";";
  },
  ADDNV: function (a, b, c) {
    return slot(a) + " = " + slot(c) + " + " + b + ";";
  },
  SUBNV: function (a, b, c) {
    return slot(a) + " = " + slot(c) + " - " + b + ";";
  },
  MULNV: function (a, b, c) {
    return slot(a) + " = " + slot(c) + " * " + b + ";";
  },
  DIVNV: function (a, b, c) {
    return slot(a) + " = " + slot(c) + " / " + b + ";";
  },
  MODNV: function (a, b, c) {
    return slot(a) + " = " + slot(c) + " % " + b + ";";
  },
  ADDVV: function (a, b, c) {
    return slot(a) + " = " + slot(b) + " + " + slot(c) + ";";
  },
  SUBVV: function (a, b, c) {
    return slot(a) + " = " + slot(b) + " - " + slot(c) + ";";
  },
  MULVV: function (a, b, c) {
    return slot(a) + " = " + slot(b) + " * " + slot(c) + ";";
  },
  DIVVV: function (a, b, c) {
    return slot(a) + " = " + slot(b) + " / " + slot(c) + ";";
  },
  MODVV: function (a, b, c) {
    return slot(a) + " = " + slot(b) + " % " + slot(c) + ";";
  },
  POW: function (a, b, c) {
    return slot(a) + " = Math.pow(" + slot(b) + ", " + slot(c) + ");";
  },
  CAT: function (a, b, c) {
    var line = slot(a) + " = ''";
    for (var i = b; i <= c; i++) {
      line += " + " + slot(i);
    }
    return line + ";";
  },
  KSTR: function (a, d) {
    return slot(a) + " = " + JSON.stringify(d) + ";";
  },
  KCDATA: function (a, d) {
    throw new Error("TODO: Implement me");
  },
  KSHORT: function (a, d) {
    return slot(a) + " = " + d + ";";
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
    return slot(a) + " = " + pr(d) + ".bind(this);";
  },
  TNEW: function (a, d) {
    var arrayn = d & 0x7ff;
    var hashn = d >>> 11;
    if (!arrayn || hashn) return slot(a) + " = {};";
    return slot(a) + " = new Array(" + arrayn + ");";
  },
  TDUP: function (a, d) {
    // TODO: handle more table types properly
    return slot(a) + " = " + JSON.stringify(d) + ";";
  },
  GGET: function (a, d) {
    if (isIdent(d))
      return slot(a) + " = this." + d + " || null;";
    else
      return slot(a) + " = this[" + JSON.stringify(d) + "] || null;";
  },
  GSET: function (a, d) {
    if (isIdent(d))
      return "this." + d + " = " + slot(a) + ";";
    else
      return "this[" + JSON.stringfy(d) + "] = " + slot(a) + ";";
  },
  TGETV: function (a, b, c) {
    return slot(a) + " = " + slot(b) + "[" + slot(c) + "] || null;";
  },
  TGETS: function (a, b, c) {
    if (isIdent(c))
      return slot(a) + " = " + slot(b) + "." + c + " || null;";
    else
      return slot(a) + " = " + slot(b) + "[" + JSON.stringify(c) + "] || null;";
  },
  TGETB: function (a, b, c) {
    return slot(a) + " = " + slot(b) + "[" + c + "] || null;";
  },
  TSETV: function (a, b, c) {
    return slot(b) + "[" + slot(c) + "] = " + slot(a) + ";";
  },
  TSETS: function (a, b, c) {
    if (isIdent(c))
      return slot(b) + "." + c + " = " + slot(a) + ";";
    else
      return slot(b) + "[" + JSON.stringify(c) + "] = " + slot(a) + ";";
  },
  TSETB: function (a, b, c) {
    return slot(b) + "[" + c + "] = " + slot(a) + ";";
  },
  TSETM: function () {
    throw new Error("TODO: Implement me");
  },
  CALLM: function (a, b, c) {
    var line;
    if (b > 1) { line = "$ = arr("; }
    else if (b == 0) { line = "$$ = arr("; }
    else { line = ""; }
    if (c) {
      line += slot(a) + ".apply(null, [";
      for (var i = a + 1; i <= a + c; i++) {
        if (i > a + 1) line += ", ";
        line += slot(i);
      }
      line += "].concat($$)";
    }
    else {
      line += slot(a) + ".apply(null, $$";
    }
    if (b === 1) {
      line += ");";
    }
    else {
      line += "));";
    }
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
    if (b > 1) { line = "$ = arr("; }
    else if (b == 0) { line = "$$ = arr("; }
    else { line = ""; }
    line += slot(a) + "(";
    for (var i = a + 1; i < a + c; i++) {
      if (i > a + 1) line += ", ";
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
    return "// LOOP";
  },
  ILOOP: function () {
    throw new Error("TODO: Implement me");
  },
  JLOOP: function () {
    throw new Error("TODO: Implement me");
  },
  JMP: function (a, d) {
    return "state = " + stateLabel(d) + "; break loop;";
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
