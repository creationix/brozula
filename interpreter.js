( // Module boilerplate to support browser globals, node.js and AMD.
  (typeof module !== "undefined" && function (m) { module.exports = m(require('./runtime')); }) ||
  (typeof define === "function" && function (m) { define(["./runtime"], m); }) ||
  (function (m) { window.brozula = window.brozula || {}; window.brozula.interpret = m(window.brozula.runtime); })
)(function (runtime) {
"use strict";

function Closure(proto, parent) {
  this.flags = proto.flags;
  this.numparams = proto.numparams;
  this.framesize = proto.framesize;
  this.bcins = proto.bcins; // Program logic as bytecode instructions
  this.uvdata = proto.uvdata; // Upvalue searching data
  this.protoIndex = proto.index;
  this.parent = parent;
  this.multires = undefined;
}
Function.prototype.toString = function () { return require('util').inspect(this); };
Closure.prototype.execute = function (env, args) {
  this.pc = 0; // Program Counter
  this.env = env; // global environment
  this.slots = new Array(this.framesize); // vm registers
  for (var i = 0, l = this.numparams; i < l; i++) {
    this.slots[i] = args[i];
  }
  while (true) {
    var bc = this.bcins[this.pc++];
//    console.log("  " + this.slots.join("\n  "));
//    console.log(this.protoIndex + "-" + (this.pc-1), bc);
    var ret = this[bc.op].apply(this, bc.args);
    if (ret) return ret;
  }
};

Closure.prototype.toFunction = function (env) {
  var self = this;
  var fn = function () {
    return self.execute.call(self, env, arguments);
  };
  fn.index = this.protoIndex;
  return fn;
};

Closure.prototype.ISLT = function (a, d, mt) {
  if (!runtime[mt](this.slots[a], this.slots[d])) { this.pc++; }
};
Closure.prototype.ISGE = function (a, d, mt) {
  if (runtime[mt](this.slots[a], this.slots[d])) { this.pc++; }
};
Closure.prototype.ISLE = Closure.prototype.ISLT;
Closure.prototype.ISGT = Closure.prototype.ISGE;
Closure.prototype.ISEQV = Closure.prototype.ISLT;
Closure.prototype.ISNEV = Closure.prototype.ISGE;
Closure.prototype.ISEQS = function (a, d, mt) {
  if (!runtime[mt](this.slots[a], d)) { this.pc++; }
};
Closure.prototype.ISEQN = Closure.prototype.ISEQS;
Closure.prototype.ISEQP = Closure.prototype.ISEQS;
Closure.prototype.ISNES = function (a, d, mt) {
  if (runtime[mt](this.slots[a], d)) { this.pc++; }
};
Closure.prototype.ISNEN = Closure.prototype.ISNES;
Closure.prototype.ISNEP = Closure.prototype.ISNES;
Closure.prototype.ISTC = function (a, d) {
  if (runtime.falsy(this.slots[d])) { this.pc++; }
  else this.slots[a] = this.slots[d];
};
Closure.prototype.ISFC = function (a, d) {
  if (!runtime.falsy(this.slots[d])) { this.pc++; }
  else this.slots[a] = this.slots[d];
};
Closure.prototype.IST = function (d) {
  if (runtime.falsy(this.slots[d])) { this.pc++; }
};
Closure.prototype.ISF = function (d) {
  if (!runtime.falsy(this.slots[d])) { this.pc++; }
};
Closure.prototype.MOV = function (a, d) {
  this.slots[a] = this.slots[d];
};
Closure.prototype.NOT = function (a, d) {
  this.slots[a] = runtime.falsy(this.slots[d]);
};
Closure.prototype.UNM = function (a, d, mt) {
  this.slots[a] = runtime[mt](this.slots[d]);
};
Closure.prototype.LEN = Closure.prototype.UNM;
Closure.prototype.ADDVN = function (a, b, c, mt) {
  this.slots[a] = runtime[mt](this.slots[b], c);
};
Closure.prototype.SUBVN = Closure.prototype.ADDVN;
Closure.prototype.MULVN = Closure.prototype.ADDVN;
Closure.prototype.DIVVN = Closure.prototype.ADDVN;
Closure.prototype.MODVN = Closure.prototype.ADDVN;
Closure.prototype.ADDNV = function (a, b, c, mt) {
  this.slots[a] = runtime[mt](c, this.slots[b]);
};
Closure.prototype.SUBNV = Closure.prototype.ADDNV;
Closure.prototype.MULNV = Closure.prototype.ADDNV;
Closure.prototype.DIVNV = Closure.prototype.ADDNV;
Closure.prototype.MODNV = Closure.prototype.ADDNV;
Closure.prototype.ADDVV = function (a, b, c, mt) {
  this.slots[a] = runtime[mt](this.slots[b], this.slots[c]);
};
Closure.prototype.SUBVV = Closure.prototype.ADDVV;
Closure.prototype.MULVV = Closure.prototype.ADDVV;
Closure.prototype.DIVVV = Closure.prototype.ADDVV;
Closure.prototype.MODVV = Closure.prototype.ADDVV;
Closure.prototype.POW = Closure.prototype.ADDVV;
Closure.prototype.CAT = function (a, b, c, mt) {
  // TODO: test this manually
  for (var i = c - 1; i >= b; i--) {
    this.slots[i] = runtime[mt](this.slots[i], this.slots[i + 1]);
  }
  if (a !== b) {
    this.slots[a] = this.slots[b];
  }
};
Closure.prototype.KSTR = function (a, d) {
  this.slots[a] = d;
};
Closure.prototype.KCDATA = Closure.prototype.KSTR;
Closure.prototype.KSHORT = Closure.prototype.KSTR;
Closure.prototype.KNUM = Closure.prototype.KSTR;
Closure.prototype.KPRI = Closure.prototype.KSTR;
Closure.prototype.KNIL = function (a, d) {
  for (var i = a; i <= d; i++) {
    this.slots[i] = null;
  }
};

Closure.prototype.getUv = function (index) {
  var uv = this.uvdata[index];
//  console.log("getUv", this.protoIndex, index, uv);
  if (!uv.local) return this.parent.getUv(index);
  return this.parent.slots[uv.uv];
};

Closure.prototype.setUv = function (index, value) {
  var uv = this.uvdata[index];
//  console.log("setUv", this.protoIndex, index, uv, value);
  if (!uv.local) return this.parent.setUv(index, value);
  if (uv.immutable) throw new Error("Cannot set immutable upvalue");
  this.parent.slots[uv.uv] = value;
};

Closure.prototype.UGET = function (a, d) {
  this.slots[a] = this.getUv(d);
};
Closure.prototype.USETV = function (a, d) {
  this.setUv(a, this.slots[d]);
};
Closure.prototype.USETN = function (a, d) {
  this.setUv(a, d);
};
Closure.prototype.USETP = Closure.prototype.USETN;
Closure.prototype.USETS = Closure.prototype.USETN;
Closure.prototype.UCLO = function (a, d) {
//  throw new Error("TODO: Implement UCLO");
};
Closure.prototype.FNEW = function (a, d, mt) {
  var closure = new Closure(d, this);
  this.slots[a] = closure.toFunction(this.env);
};
Closure.prototype.TNEW = function (a, d, mt) {
  // TODO: call mt when collected
  var narr = d & 0x7ff;
  var nhash = d >>> 11;
  this.slots[a] = (!narr || nhash) ? {} : new Array(narr);
};
Closure.prototype.TDUP = function (a, d, mt) {
  // TODO: call mt when collected
  if (Array.isArray(d)) {
    this.slots[a] = d.slice(0);
    return;
  }
  var keys = Object.keys(d);
  var dup = {};
  for (var i = 0, l = keys.length; i < l; i++) {
    var key = keys[i];
    dup[key] = d[key];
  }
  this.slots[a] = dup;
};
Closure.prototype.GGET = function (a, d, mt) {
  this.slots[a] = runtime[mt](this.env, d);
};
Closure.prototype.GSET = function (a, d, mt) {
  runtime[mt](this.env, d, this.slots[a]);
};
Closure.prototype.TGETV = Closure.prototype.ADDVV;
Closure.prototype.TGETS = Closure.prototype.ADDVN;
Closure.prototype.TGETB = Closure.prototype.ADDVN;
Closure.prototype.TSETV = function (a, b, c, mt) {
  runtime[mt](this.slots[b], this.slots[c], this.slots[a]);
};
Closure.prototype.TSETS = function (a, b, c, mt) {
  runtime[mt](this.slots[b], c, this.slots[a]);
};
Closure.prototype.TSETB = Closure.prototype.TSETS;
Closure.prototype.TSETM = function (a, d, mt) {
  var buffer = new Buffer(8); // Get the lower 32 bits from the number
  buffer.writeDoubleLE(d, 0);
  d = buffer.readUInt32LE(0);
  var tab = this.slots[a - 1];
  for (var i = 0, l = this.multires.length; i < l; i++) {
    tab[d + i] = this.multires[i];
  }
  this.multires = undefined;
};

// Call helper
Closure.prototype.call = function(a, b, fn, args) {
  if (b === 0) { // multires return
    this.multires = runtime.call(fn, args);
  }
  else if (b === 1) {
    this.slots[a] = runtime.call(fn, args)[0];
  }
  else {
    var result = runtime.call(fn, args);
    for (var i = 0; i < b - 1; i++) {
      this.slots[a + i] = result[i];
    }
  }
};
Closure.prototype.CALLM = function (a, b, c, mt) {
  if (c > 0) { // extras
    this.call(a, b, this.slots[a], this.slots.slice(a + 1, a + c + 1).concat(this.multires));
  }
  else {
    this.call(a, b, this.slots[a], this.multires);
  }
};
Closure.prototype.CALL = function (a, b, c, mt) {
  this.call(a, b, this.slots[a], this.slots.slice(a + 1, a + c));
};
Closure.prototype.CALLMT = function (a, d, mt) {
  if (d > 0) { // extras
    return runtime[mt](this.slots[a], this.slots.slice(a + 1, a + d + 1).concat(this.multires));
  }
  return runtime[mt](this.slots[a], this.multires);
};
Closure.prototype.CALLT = function (a, d, mt) {
  return runtime[mt](this.slots[a], this.slots.slice(a + 1, a + d));
};
Closure.prototype.ITERC = function (a, b, c, mt) {
  this.slots[a] = this.slots[a - 3];
  this.slots[a + 1] = this.slots[a - 2];
  this.slots[a + 2] = this.slots[a - 1];
  this.call(a, b, this.slots[a], [this.slots[a - 2], this.slots[a - 1]]);
};
Closure.prototype.ITERN = function (a, b, c, mt) {
  this.slots[a] = this.slots[a - 3];
  this.slots[a + 1] = this.slots[a - 2];
  this.slots[a + 2] = this.slots[a - 1];
  this.call(a, b, this.env.next, [this.slots[a - 2], this.slots[a - 1]]);
};
Closure.prototype.VARG = function (a, b, c) {
  throw new Error("TODO: Implement VARG");
};
Closure.prototype.ISNEXT = function (a, d) {
  if (this.slots[a - 3] === this.env.next && runtime.type(this.slots[a - 2]) === "table" && this.slots[a - 1] === null) {
    this.pc += d;
  }
  else {
    throw new Error("Implement ISNEXT failure");
  }
};
Closure.prototype.RETM = function (a, d) {
  var ret;
  if (d > 0) {
    ret = this.slots.slice(a, a + d + 1).concat(this.multires);
  }
  else {
    ret = this.multires;
  }
  return ret;
};
Closure.prototype.RET = function (a, d) {
  return this.slots.slice(a, a + d);
};
Closure.prototype.RET0 = function (a, d) {
  return [];
};
Closure.prototype.RET1 = function (a, d) {
  return [this.slots[a]];
};
Closure.prototype.FORI = function (a, d) {
  this.slots[a + 3] = this.slots[a];
  this.cmp = this.slots[a] < this.slots[a + 1];
};
Closure.prototype.FORL = function (a, d) {
  this.slots[a + 3] += this.slots[a + 2];
  if (this.cmp ? (this.slots[a + 3] <= this.slots[a + 1]) : (this.slots[a + 3] >= this.slots[a + 1])) {
    this.pc += d;
  }
  else {
    this.cmp = undefined;
  }
};
Closure.prototype.ITERL = function (a, d) {
  if (!runtime.falsy(this.slots[a])) {
    this.slots[a - 1] = this.slots[a];
    this.pc += d;
  }
};
Closure.prototype.LOOP = function (a, d) {};
Closure.prototype.JMP = function (a, d) {
  this.pc += d;
};
Closure.prototype.FUNCF = function (a) {
  throw new Error("TODO: Implement FUNCF");
};
Closure.prototype.FUNCV = function (a) {
  throw new Error("TODO: Implement FUNCV");
};
Closure.prototype.FUNCC = function (a) {
  throw new Error("TODO: Implement FUNCC");
};
Closure.prototype.FUNCCW = function (a) {
  throw new Error("TODO: Implement FUNCCW");
};

return {
  Closure: Closure
};

});
