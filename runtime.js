( // Module boilerplate to support browser globals, node.js and AMD.
  (typeof module !== "undefined" && function (m) { module.exports = m(); }) ||
  (typeof define === "function" && function (m) { define(m); }) ||
  (function (m) { window.brozula = window.brozula || {}; window.brozula.runtime = m(); })
)(function () {

// Metatmethods
function lt(op1, op2) {
  var t1 = type(op1), t2 = type(op2);
  if (t1 === t2) {
    if (t1 === "number" || t1 === "string") return op1 < op2;
    var h = getcomphandler(op1, op2, "__lt");
    if (h) return h(op1, op2);
  }
  throw "attempt to compare " + t1 + " with " + t2;
}
function le(op1, op2) {
  var t1 = type(op1), t2 = type(op2);
  if (t1 === t2) {
    if (t1 === "number" || t1 === "string") return op1 <= op2;
    var h = getcomphandler(op1, op2, "__le");
    if (h) return h(op1, op2);
    h = getcomphandler(op1, op2, "__lt");
    if (h) return !h(op2, op1);
  }
  throw "attempt to compare " + t1 + " with " + t2;
}
function eq(op1, op2) {
  var t1 = type(op1), t2 = type(op2);
  if (op1 === op2) return true;
  if (t1 !== t2) return false;
  var h = getcomphandler(op1, op2, "__eq");
  if (h) return h(op1, op2);
  return false;
}
function unm(op) {
  var o = tonumber(op);
  if (typeof o === "number") return -o;
  var h = getmetamethod(op, "__unm");
  if (h) return h(op);
  throw "attempt to perform arithmetic on a " + type(op) + " value";
}
function len(op) {
  var t = type(op);
  if (t === "string") {
    return op.length;
  }
  if (t === "table") {
    if (Array.isArray(op)) return op.length;
    return 0;
  }
  var h = getmetamethod(op, "__len");
  if (h) {
    return h(op);
  }
  throw new Error("attempt to get length of " + t + " value");
}

function add(op1, op2) {
  var o1 = tonumber(op1), o2 = tonumber(op2);
  if (typeof o1 === "number" && typeof o2 === "number") {
    return o1 + o2;
  }
  var h = getbinhandler(op1, op2, "__add");
  if (h) return h(op1, op2);
  throw "attempt to perform arithmetic on a " + type(op1) + " value";
}
function sub(op1, op2) {
  var o1 = tonumber(op1), o2 = tonumber(op2);
  if (typeof o1 === "number" && typeof o2 === "number") {
    return o1 - o2;
  }
  var h = getbinhandler(op1, op2, "__sub");
  if (h) return h(op1, op2);
  throw "attempt to perform arithmetic on a " + type(op1) + " value";
}
function mul(op1, op2) {
  var o1 = tonumber(op1), o2 = tonumber(op2);
  if (typeof o1 === "number" && typeof o2 === "number") {
    return o1 * o2;
  }
  var h = getbinhandler(op1, op2, "__mul");
  if (h) return h(op1, op2);
  throw "attempt to perform arithmetic on a " + type(op1) + " value";
}
function div(op1, op2) {
  var o1 = tonumber(op1), o2 = tonumber(op2);
  if (typeof o1 === "number" && typeof o2 === "number") {
    return o1 / o2;
  }
  var h = getbinhandler(op1, op2, "__div");
  if (h) return h(op1, op2);
  throw "attempt to perform arithmetic on a " + type(op1) + " value";
}
function mod(op1, op2) {
  var o1 = tonumber(op1), o2 = tonumber(op2);
  if (typeof o1 === "number" && typeof o2 === "number") {
    return o1 % o2;
  }
  var h = getbinhandler(op1, op2, "__mod");
  if (h) return h(op1, op2);
  throw "attempt to perform arithmetic on a " + type(op1) + " value";
}
function pow(op1, op2) {
  var o1 = tonumber(op1), o2 = tonumber(op2);
  if (typeof o1 === "number" && typeof o2 === "number") {
    return Math.pow(o1, o2);
  }
  var h = getbinhandler(op1, op2, "__pow");
  if (h) return h(op1, op2);
  throw "attempt to perform arithmetic on a " + type(op1) + " value";
}
function concat(op1, op2) {
  var t1 = typeof op1;
  var t2 = typeof op2;
  if ((t1 === "string" || t1 === "number") && (t2 === "string" || t2 === "number")) {
    return "" + op1 + op2;
  }
  var h = getbinhandler(op1, op2, "__concat");
  if (h) {
    return h(op1, op2);
  }
  throw "attempt to concatenate a " + type(op1) + " value";
}
function gc(tab) {
  // TODO: check metamethods
}
function index(table, key) {
  var t, h;
  t = type(table);
  if (t === "table") {
    if (table[key] !== undefined) return rawget(table, key);
    h = getmetamethod(table, "__index");
    if (!h) return null;
  }
  else {
    meta = getmetatable(table);
    h = getmetamethod(table, "__index");
    if (!h) throw "attempt to index a " + t + " value";
  }
  if (typeof h === "function") {
    return h(table, key);
  }
  return index(h, key);
}
function newindex(table, key, val) {
  var t, h;
  t = type(table);
  if (t === "table") {
    if (table[key] !== undefined) { rawset(table, key, val); return; }
    h = getmetamethod(table, "__newindex");
    if (!h) { rawset(table, key, val); return; }
  }
  else {
    h = getmetamethod(table, "__newindex");
    if (!h) throw "attempt to index a " + t + " value";
  }
  if (typeof h === "function") {
    h(table, key, val);
  }
  else {
    newindex(h, key, val);
  }
}
function call(func, args) {
  if (typeof func === "function") {
    return func.apply(null, args);
  }
  var h = getmetamethod(func, "__call");
  if (h) {
    return h.apply(null, [func].concat(args));
  }
  throw "attempt to call a " + type(func) + " value";
}

// Helpers
function falsy(val) {
  return val === false || val === null || val === undefined;
}
function type(val) {
  if (val === null || val === undefined) return "nil";
  if (typeof val === "object") return "table";
  return typeof val;
}

function rawget(tab, key) {
  if (typeof key === (Array.isArray(tab) ? "number" : "string")) {
    var val = tab[key];
    return (val === undefined) ? null : val;
  }
  throw new Error("TODO: Implement fancy table get");
}

function rawset(tab, key, val) {
  if (typeof key === (Array.isArray(tab) ? "number" : "string")) {
    tab[key] = val;
    return;
  }
  throw new Error("TODO: Implement fancy table set");
}

function setmetatable(tab, meta) {
  var t = type(tab);
  if (t !== "table") throw "table expected, got " + t;
  tab.__meta__ = meta;
}

function getmetatable(tab) {
  if (type(tab) !== "table") return null;
  return tab.__meta__ || null;
}

function tonumber(val, base) {
  var t = typeof val;
  if (base === undefined || base === null) base = 10;
  base = Math.floor(base);
  if (base < 2 || base > 36) throw "base out of range";
  if (t === "number") return val;
  if (t === "string") {
    var num;
    if (base === 10) num = parseFloat(val, 10);
    else num = parseInt(val, base);
    if (!isNaN(num)) return num;
  }
  return null;
}

function getmetamethod(tab, event) {
  var meta = getmetatable(tab);
  if (meta && meta[event] !== undefined) return meta[event];
  return null;
}

function getcomphandler(op1, op2, event) {
  var mm1 = getmetamethod(op1, event);
  var mm2 = getmetamethod(op2, event);
  if (mm1 === mm2) return mm1;
  return null;
}

function getbinhandler(op1, op2, event) {
  var meta = getmetatable(op1);
  if (meta && meta[event] !== undefined) return meta[event];
  meta = getmetatable(op2);
  if (meta && meta[event] !== undefined) return meta[event];
  return null;
}

return {
  lt: lt, le: le, eq: eq, unm: unm, len: len, add: add, sub: sub, mul: mul,
  div: div, mod: mod, pow: pow, concat: concat, gc: gc, index: index,
  newindex: newindex, call: call, falsy: falsy, type: type,
  setmetatable: setmetatable, getmetatable: getmetatable, rawget: rawget,
  rawset: rawset, tonumber: tonumber
};

});