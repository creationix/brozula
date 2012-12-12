( // Module boilerplate to support browser globals, node.js and AMD.
  (typeof module !== "undefined" && function (m) { module.exports = m(require('./runtime')); }) ||
  (typeof define === "function" && function (m) { define(["./runtime"], m); }) ||
  (function (m) { window.brozula = window.brozula || {}; window.brozula.globals = m(window.brozula.runtime); })
)(function (runtime) {

var falsy = runtime.falsy;
var slice = Array.prototype.slice;

function next(tab, key) {
  var isNull = key === undefined || key === null;
  if (Array.isArray(tab)) {
    if (isNull) key = 0;
    return inext(tab, key);
  }
  var keys = Object.keys(tab);
  var newKey;
  if (isNull) {
    newKey = keys[0];
    return [newKey, tab[newKey]];
  }
  var index = keys.indexOf(key) + 1;
  if (index) {
    newKey = keys[index];
    return [newKey, tab[newKey]];
  }
  return [];
}

function inext(tab, key) {
  var newKey;
  if (Array.isArray(tab) && tab.length && typeof key === "number" &&
      tab[newKey = key + 1] !== undefined) {
    return [newKey, tab[newKey]];
  }
  return [];
}

var _G = {
  _VERSION: "Lua 5.1",
  assert: function assert(expr, message) {
    if (falsy(expr)) throw message;
    return slice.call(arguments);
  },
  bit: {},
  collectgarbage: function collectgarbage() { throw new Error("TODO: Implement collectgarbage"); },
  coroutine: {},
  debug: {},
  error: function error(message) {
    throw message;
  },
  gcinfo: function gcinfo() { throw new Error("TODO: Implement gcinfo"); },
  getfenv: function getfenv() { throw new Error("TODO: Implement getfenv"); },
  getmetatable: function getmetatable(tab) {
    return [runtime.getmetatable(tab)];
  },
  io: {},
  ipairs: function ipairs(tab) {
    return [inext, tab, 0];
  },
  jit: {},
  math: {},
  module: function module() { throw new Error("TODO: Implement module"); },
  newproxy: function newproxy() { throw new Error("TODO: Implement newproxy"); },
  next: next,
  os: {},
  package: {},
  pairs: function pairs(tab) {
    return [next, tab, null];
  },
  pcall: function pcall() { throw new Error("TODO: Implement pcall"); },
  print: function print() {
    console.log(Array.prototype.map.call(arguments, runtime.tostring).join("\t"));
    return [];
  },
  rawequal: function rawequal() { throw new Error("TODO: Implement rawequal"); },
  rawget: function rawget(tab, key) {
    return [runtime.rawget(tab, key)];
  },
  rawset: function rawset(tab, key, val) {
    runtime.rawset(tab, key, val);
    return [];
  },
  require: function require() { throw new Error("TODO: Implement require"); },
  select: function select(index) {
    if (typeof index === "number") {
      return Array.prototype.slice.call(arguments, index);
    }
    if (index === "#") {
      return arguments.length - 1;
    }
  },
  setfenv: function setfenv() { throw new Error("TODO: Implement setfenv"); },
  setmetatable: function setmetatable(tab, meta) {
    runtime.setmetatable(tab, meta);
    return [tab];
  },
  string: runtime.string,
  table: {
    concat: function (tab, joiner) {
      if (!(tab && typeof tab === "object")) throw "table expected";
      if (!Array.isArray(tab)) return [""];
      return [tab.join(joiner)];
    },
    insert: function (tab, value) {
      if (!(tab && typeof tab === "object")) throw "table expected";
      if (!Array.isArray(tab)) throw "TODO: Implement insert on non-array tables";
      tab.push(value);
      return [];
    },
    sort: function (tab, cmp) {
      cmp = cmp || lt;
      tab.sort(function (a, b) {
        return cmp(a, b)[0] ? 1 : -1;
      });
      return [];
    }
  },
  tonumber: function tonumber(val, base) {
    return [runtime.tonumber(val, base)];
  },
  tostring: function tostring(val) {
    return [runtime.tostring(val)];
  },
  type: function type(val) {
    return [runtime.type(val)];
  },
  unpack: function unpack(tab) {
    return tab;
  },
  xpcall: function xpcall() { throw new Error("TODO: Implement xpcall"); }
};
_G._G = _G;

return _G;

});