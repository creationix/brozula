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
function unm(val) {
  // TODO: check metamethods
  return -val;
}
function len(val) {
  // TODO: check metamethods
  if (Array.isArray(val)) return val.length;
  if (typeof val === "string") return val.length;
  if (typeof val === "object") return 0;
  throw new Error("attempt to get length of " + type(val) + " value");
}
function add(op1, op2) {
  // TODO: check metamethods
  return op1 + op2;
}
function sub(op1, op2) {
  // TODO: check metamethods
  return op1 - op2;
}
function mul(op1, op2) {
  // TODO: check metamethods
  return op1 * op2;
}
function div(op1, op2) {
  // TODO: check metamethods
  return op1 / op2;
}
function mod(op1, op2) {
  // TODO: check metamethods
  return op1 % op2;
}
function pow(op1, op2) {
  // TODO: check metamethods
  return Math.pow(op1, op2);
}
function concat(op1, op2) {
  // TODO: check metamethods
  return "" + op1 + op2;
}
function gc(tab) {
  // TODO: check metamethods
}
function index(table, key) {
  var t, h, meta;
  t = type(table);
  if (t === "table") {
    if (table.hasOwnProperty(key)) return rawget(table, key);
    meta = getmetatable(table);
    if (meta && meta.hasOwnProperty("__index")) h = meta.__index;
    else return null;
  }
  else {
    meta = getmetatable(table);
    if (meta && meta.hasOwnProperty("__index")) h = meta.__index;
    else throw "attempt to index a " + t + " value";
  }
  if (typeof h === "function") {
    return h(table, key);
  }
  return index(h, key);
}
function newindex(table, key, val) {
  var t, h, meta;
  t = type(table);
  if (t === "table") {
    if (table.hasOwnProperty(key)) { rawset(table, key, val); return; }
    meta = getmetatable(table);
    if (meta && meta.hasOwnProperty("__newindex")) h = meta.__newindex;
    else { rawset(table, key, val); return; }
  }
  else {
    meta = getmetatable(table);
    if (meta && meta.hasOwnProperty("__newindex")) h = meta.__newindex;
    else throw "attempt to index a " + t + " value";
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
  var meta = getmetatable(func);
  if (meta && meta.hasOwnProperty("__call")) {
    return meta.__call.apply(null, [func].concat(args));
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
  if (Array.isArray(tab) && typeof key === "number") {
    key--;
    if (tab.hasOwnProperty(key)) {
      return tab[key];
    }
    return null;
  }
  if (typeof key === "string") {
    if (tab.hasOwnProperty(key)) {
      return tab[key];
    }
    return null;
  }
  throw new Error("TODO: Implement fancy table get");
}

function rawset(tab, key, val) {
  if (Array.isArray(tab) && typeof key === "number") {
    key--;
    tab[key] = val;
    return;
  }
  if (typeof key === "string") {
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

return {
  lt: lt, le: le, eq: eq, unm: unm, len: len, add: add, sub: sub, mul: mul,
  div: div, mod: mod, pow: pow, concat: concat, gc: gc, index: index,
  newindex: newindex, call: call, falsy: falsy, type: type,
  setmetatable: setmetatable, getmetatable: getmetatable, rawget: rawget,
  rawset: rawset
};

});