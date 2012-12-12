( // Module boilerplate to support browser globals, node.js and AMD.
  (typeof module !== "undefined" && function (m) { module.exports = m(require('./runtime')); }) ||
  (typeof define === "function" && function (m) { define(["./runtime"], m); }) ||
  (function (m) { window.brozula = window.brozula || {}; window.brozula.globals = m(window.brozula.runtime); })
)(function (runtime) {

var falsy = runtime.falsy;
var type = runtime.type;
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

function patternToRegExp(pattern, flags) {
  // TODO: translate lua escapes to js escapes.
  pattern = pattern.replace(/%(.)/g, "\\$1");
  return new RegExp(pattern, flags);
}

var _G = {
  _VERSION: "Lua 5.1",
  assert: function (expr, message) {
    if (falsy(expr)) throw message;
    return slice.call(arguments);
  },
  bit: {},
  collectgarbage: function () { throw new Error("TODO: Implement collectgarbage"); },
  coroutine: {},
  debug: {},
  error: function (message) {
    throw message;
  },
  gcinfo: function () { throw new Error("TODO: Implement gcinfo"); },
  getfenv: function () { throw new Error("TODO: Implement getfenv"); },
  getmetatable: function (tab) {
    return [runtime.getmetatable(tab)];
  },
  io: {},
  ipairs: function (tab) {
    return [inext, tab, 0];
  },
  jit: {},
  math: {},
  module: function () { throw new Error("TODO: Implement module"); },
  newproxy: function () { throw new Error("TODO: Implement newproxy"); },
  next: next,
  os: {},
  package: {},
  pairs: function (tab) {
    return [next, tab, null];
  },
  pcall: function () { throw new Error("TODO: Implement pcall"); },
  print: function () {
    console.log(Array.prototype.join.call(arguments, "\t"));
    return [];
  },
  rawequal: function () { throw new Error("TODO: Implement rawequal"); },
  rawget: function (tab, key) {
    return [runtime.rawget(tab, key)];
  },
  rawset: function (tab, key, val) {
    runtime.rawset(tab, key, val);
    return [];
  },
  require: function () { throw new Error("TODO: Implement rawset"); },
  select: function () { throw new Error("TODO: Implement select"); },
  setfenv: function () { throw new Error("TODO: Implement setfenv"); },
  setmetatable: function (tab, meta) {
    runtime.setmetatable(tab, meta);
    return [tab];
  },
  string: {
    match: function (s, pattern, init) {
      if (init) throw new Error("TODO: Implement match init offset");
      var regexp = patternToRegExp(pattern);
      var m = s.match(regexp);
      if (!m) return [];
      if (m.length > 1) {
        return Array.prototype.slice.call(m, 1);
      }
      return [m[0]];
    },
    gmatch: function (s, pattern) {
      var regexp = patternToRegExp(pattern, "g");
      return function () {
        var m = regexp.exec(s);
        if (!m) return [];
        if (m.length > 1) {
          return Array.prototype.slice.call(m, 1);
        }
        return [m[0]];
      };
    },
    sub: function (s, i, j) {
      var start, length;
      if (i < 0) i = s.length - i;
      start = i - 1;
      if (typeof j === "number") {
        if (j < 0) j = s.length - j;
        length = j - i + 1;
      }
      return [s.substr(start, length)];
    }
  },
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
      console.log("BEFORE", tab);
      tab.sort(function (a, b) {
        return cmp(a, b)[0] ? 1 : -1;
      });
      console.log("AFTER", tab);
      return [];
    }
  },
  tonumber: function (val, base) {
    return [runtime.tonumber(val, base)];
  },
  tostring: function (val) {
    return [runtime.tostring(val)];
  },
  type: function (val) {
    return [type(val)];
  },
  unpack: function (tab) {
    return tab;
  },
  xpcall: function () { throw new Error("TODO: Implement xpcall"); }
};
_G._G = _G;

return _G;

});