( // Module boilerplate to support browser globals, node.js and AMD.
  (typeof module !== "undefined" && function (m) { module.exports = m(); }) ||
  (typeof define === "function" && function (m) { define(m); }) ||
  (function (m) { window.brozula = window.brozula || {}; window.brozula.runtime = m(); })
)(function () {

// Metatmethods
function lt(op1, op2) {
  // TODO: check metamethods
  return op1 < op2;
}
function le(op1, op2) {
  // TODO: check metamethods
  return op1 <= op2;
}
function eq(op1, op2) {
  // TODO: check metamethods
  return op1 === op2;
}
function unm(op) {
  var o = tonumber(op);
  if (typeof o === "number") return -o;
  var h = getmetamethod(op, "__unm");
  if (h) return h(op);
  throw "attempt to perform arithmetic on a " + type(op) + " value";
}
function len(val) {
  // TODO: check metamethods
  if (Array.isArray(val)) return val.length;
  if (typeof val === "string") return val.length;
  if (typeof val === "object") return 0;
  throw new Error("attempt to get length of " + type(val) + " value");
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
  // TODO: check metamethods
  return "" + op1 + op2;
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
  tab.__meta__ = meta;
}

function getmetatable(tab) {
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