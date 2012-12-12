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
function index(tab, key) {
  // TODO: check metamethods
  if (tab.hasOwnProperty(key)) return tab[key];
  return null;
}
function newindex(tab, key, val) {
  // TODO: check metamethods
  tab[key] = val;
}
function call(tab, args) {
  // TODO: check metamethods
  return tab.apply(null, args);
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

return {
  lt: lt, le: le, eq: eq, unm: unm, len: len, add: add, sub: sub, mul: mul,
  div: div, mod: mod, pow: pow, concat: concat, gc: gc, index: index,
  newindex: newindex, call: call, falsy: falsy, type: type
};

});