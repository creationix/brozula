( // Module boilerplate to support browser globals, node.js and AMD.
  (typeof module !== "undefined" && function (m) { module.exports = m(); }) ||
  (typeof define === "function" && function (m) { define(m); }) ||
  (function (m) { window.brozula = window.brozula || {}; window.brozula.compile = m(); })
)(function () {
"use strict";

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

function compile(protos, skipBuiltins) {
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
      framesize: proto.framesize,
      need$: false,
      needthis: false
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
    return 'throw new Error("TODO: Implement ISTC");';
  },
  ISFC: function (a, d) {
    return 'throw new Error("TODO: Implement ISFC");';
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
    return 'throw new Error("TODO: Implement KCDATA");';
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
    for (var i = a; i <= d; i++) {
      line += slot(i) + "=null;";
    }
    return line;
  },
  UGET: function (a, d) {
    var local = d & 0x8000;
    var immutable = d & 0x4000;
    d = d & 0x3fff;
    if (local) {
      return slot(a) + "=this.__proto__.closure[" + d + "]";
    }
    return 'new Error("TODO: Implement UGET with non-local");';
  },
  USETV: function () {
    return 'throw new Error("TODO: Implement USETV");';
  },
  USETS: function () {
    return 'throw new Error("TODO: Implement USETS");';
  },
  USETN: function () {
    return 'throw new Error("TODO: Implement USETN");';
  },
  USETP: function () {
    return 'throw new Error("TODO: Implement USETP");';
  },
  UCLO: function (a, d) {
    var items = [];
    for (var i = a; i < this.framesize; i++) {
      items.push(slot(i));
    }
    return "this.closure = [" + items.join(",") + "];state=" + stateLabel(d) + ";break;";
  },
  FNEW: function (a, d) {
    return slot(a) + "=" + pr(d) + ".bind(Object.create(this));";
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
  TSETM: function (a, d) {
    var b = new Buffer(8);
    b.writeDoubleLE(d, 0);
    d = b.readUInt32LE(0);
    return '$.forEach(function(v,i){' + slot(a-1) + '[i+' + d + '];});' +
           '$=undefined;';
  },
  CALLM: function (a, b, c) {
    var args;
    if (c) {
      args = [];
      for (var i = a + 1; i <= a + c; i++) {
        args.push(slot(i));
      }
      args = "[" + args.join(",") + "].concat($)";
    }
    else {
      args = "$";
    }
    this.needthis = true;
    var fn = "call(" + slot(a) + "," + args + ")";
    if (b === 0) { // multires
      this.need$ = true;
      return "$=" + fn + ";";
    }
    if (b === 1) { // No return values
      return fn + ";";
    }
    if (b === 2) { // one return value
      return slot(a) + "=" + fn + "[0] || null;";
    }
    this.need$ = true;
    var line = "$=" + fn + ";";
    for (var i = 0; i < b - 1; i++) {
      line += slot(a + i) + "=$[" + i + "];";
    }
    line += "$=undefined;";
    return line;
  },
  CALL: function (a, b, c) {
    var args = [];
    for (var i = a + 1; i < a + c; i++) {
      args.push(slot(i));
    }
    args = "[" + args.join(",") + "]";
    this.needthis = true;
    var fn = "call(" + slot(a) + "," + args + ")";
    if (b === 0) { // multires
      this.need$ = true;
      return "$=" + fn + ";";
    }
    if (b === 1) { // No return values
      return fn + ";";
    }
    if (b === 2) { // one return value
      return slot(a) + "=" + fn + "[0] || null;";
    }
    this.need$ = true;
    var line = "$=" + fn + ";";
    for (var i = 0; i < b - 1; i++) {
      line += slot(a + i) + "=$[" + i + "];";
    }
    line += "$=undefined;";
    return line;
  },
  CALLMT: function (a) {
    this.needthis = true;
    return "return call(" + slot(a) + ",$);";
  },
  CALLT: function (a, d) {
    var args = [];
    for (var i = a + 1; i < a + d; i++) {
      args.push(slot(i));
    }
    args = "[" + args.join(",") + "]";
    this.needthis = true;
    return "return call(" + slot(a) + "," + args + ");";
  },
  ITERC: function (a, b, c) {
    var line =
      slot(a) + "=" + slot(a - 3) + ";" +
      slot(a + 1) + "=" + slot(a - 2) + ";" +
      slot(a + 2) + "=" + slot(a - 1) + ";";
    this.needthis = true;
    var fn = "call(" + slot(a) + ",[" + slot(a + 1) + "," + slot(a + 2) + "])";
    if (b === 0) { // multires
      this.need$ = true;
      return line + "$=" + fn + ";";
    }
    if (b === 1) { // No return values
      return line + fn + ";";
    }
    if (b === 2) { // one return value
      return line + slot(a) + "=" + fn + "[0] || null;";
    }
    this.need$ = true;
    line += "$=" + fn + ";";
    for (var i = 0; i <= b - 2; i++) {
      line += slot(a + i) + "=$[" + i + "];";
    }
    line += "$=undefined;";
    return line;
  },
  ITERN: function (a, b, c) {
    var line =
      slot(a) + "=" + slot(a - 3) + ";" +
      slot(a + 1) + "=" + slot(a - 2) + ";" +
      slot(a + 2) + "=" + slot(a - 1) + ";";
    var fn = "next(" + slot(a - 2) + "," + slot(a - 1) + ")";
    if (b === 0) { // multires
      this.need$ = true;
      return line + "$=" + fn + ";";
    }
    if (b === 1) { // No return values
      return line + fn + ";";
    }
    if (b === 2) { // one return value
      return line + slot(a) + "=" + fn + "[0] || null;";
    }
    this.need$ = true;
    line += "$=" + fn + ";";
    for (var i = 0; i < b - 1; i++) {
      line += slot(a + i) + "=$[" + i + "];";
    }
    line += "$=undefined;";
    return line;
  },
  VARG: function () {
    return 'throw new Error("TODO: Implement VARG");';
  },
  ISNEXT: function (a, d) {
    return 'if('+ slot(a - 3) + '===next&&rawType(' + slot(a - 2) + ')==="table"&&' + slot(a - 1) + '===null)' +
             '{state=' + stateLabel(d) + ';break;}' +
           'else{throw"TODO: Implement ISNEXT failure";}';
  },
  RETM: function () {
    return 'throw new Error("TODO: Implement RETM");';
  },
  RET: function () {
    return 'throw new Error("TODO: Implement RET");';
  },
  RET0: function () {
    return "return[];";
  },
  RET1: function (a) {
    return "return[" + slot(a) + "];"
  },
  FORI: function (a, d) {
    return slot(a + 3) + "=" + slot(a) + ";" +
      "var cmp=" + slot(a) + "<" + slot(a+1) + "?le:ge;";
  },
  JFORI: function () {
    return 'throw new Error("TODO: Implement JFORI");';
  },
  FORL: function (a, d) {
    return slot(a + 3) + "+=" + slot(a + 2) + ";" +
      "if(cmp(" + slot(a + 3) + "," + slot(a + 1) + ")){" +
      "state=" + stateLabel(d) + ";break;}" +
      "else{cmp=undefined;}"
  },
  IFORL: function (a, d) {
    return 'throw new Error("TODO: Implement IFORL");';
  },
  JFORL: function () {
    return 'throw new Error("TODO: Implement JFORL");';
  },
  ITERL: function (a, d) {
    return "if (" + slot(a) + "){" + slot(a-1) + "=" + slot(a) + ";state=" + stateLabel(d) + ";break;}";
  },
  IITERL: function () {
    return 'throw new Error("TODO: Implement IITERL");';
  },
  JITERL: function () {
    return 'throw new Error("TODO: Implement JITERL");';
  },
  LOOP: function () {
    return ""; // tracing noop
  },
  ILOOP: function () {
    return 'throw new Error("TODO: Implement ILOOP");';
  },
  JLOOP: function () {
    return 'throw new Error("TODO: Implement JLOOP");';
  },
  JMP: function (a, d) {
    return "state=" + stateLabel(d) + ";break;";
  },
  FUNCF: function () {
    return 'throw new Error("TODO: Implement FUNCF");';
  },
  IFUNCF: function () {
    return 'throw new Error("TODO: Implement IFUNCF");';
  },
  JFUNCF: function () {
    return 'throw new Error("TODO: Implement JFUNCF");';
  },
  FUNCV: function () {
    return 'throw new Error("TODO: Implement FUNCV");';
  },
  IFUNCV: function () {
    return 'throw new Error("TODO: Implement IFUNCV");';
  },
  JFUNCV: function () {
    return 'throw new Error("TODO: Implement JFUNCV");';
  },
  FUNCC: function () {
    return 'throw new Error("TODO: Implement FUNCC");';
  },
  FUNCCW: function () {
    return 'throw new Error("TODO: Implement FUNCCW");';
  }
};

return compile;

});