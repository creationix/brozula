( // Module boilerplate to support browser globals, node.js and AMD.
  (typeof module !== "undefined" && function (m) { module.exports = m(); }) ||
  (typeof define === "function" && function (m) { define(m); }) ||
  (function (m) { window.brozula = window.brozila || {}; window.brozula.runtime = m(); })
)(function () {

function falsy(val) {
  return val === false || val === null;
}

function length(val) {
 if (Array.isArray(val)) return val.length;
 if (typeof val === "string") return val.length;
 if (typeof val === "object") return 0;
 error("attempt to get length of " + type(val) + " value");
}

function lt(op1, op2) {
  // TODO: check metamethods
  return op1 < op2;
}

function le(op1, op2) {
  // TODO: check metamethods and fall through to lt
  return op1 <= op2;
}

function ge(op1, op2) {
  return !lt(op1, op2);
}

function patternToRegExp(pattern, flags) {
  // TODO: translate lua escapes to js escapes.
  pattern = pattern.replace(/%(.)/g, "\\$1");
  return new RegExp(pattern, flags);
}

function match(s, pattern, init) {
  if (init) throw new Error("TODO: Implement match init offset");
  var regexp = patternToRegExp(pattern);
  var m = s.match(regexp);
  if (!m) return [];
  if (m.length > 1) {
    return Array.prototype.slice.call(m, 1);
  }
  return [m[0]];
}

function gmatch(s, pattern) {
  var regexp = patternToRegExp(pattern, "g");
  return function () {
    var m = regexp.exec(s);
    if (!m) return [];
    if (m.length > 1) {
      return Array.prototype.slice.call(m, 1);
    }
    return [m[0]];
  };
}

function sub(s, i, j) {
  var start, length;
  if (i < 0) i = s.length - i;
  start = i - 1;
  if (typeof j === "number") {
    if (j < 0) j = s.length - j;
    length = j - i + 1;
  }
  return [s.substr(start, length)];
}

var string = {
  match: match,
  gmatch: gmatch,
  sub: sub
};

function concat(tab, joiner) {
  if (!(tab && typeof tab === "object")) throw "table expected";
  if (!Array.isArray(tab)) return [""];
  return [tab.join(joiner)];
}

function insert(tab, value) {
  if (!(tab && typeof tab === "object")) throw "table expected";
  if (!Array.isArray(tab)) throw "TODO: Implement insert on non-array tables";
  tab.push(value);
  return [];
}

var table = {
  concat: concat,
  insert: insert
};

function thisCheck(tab, value) {
  if (typeof value === "function") {
    return value.bind(tab);
  }
  return value;
}

function index(tab, key) {
  if (tab === null) throw "attempt to index a nil value";
  if (typeof tab === "string") {
    return thisCheck(tab, string[key]);
  }
  if (key in tab) {
    return thisCheck(tab, tab[key]);
  }
  if (tab.hasOwnProperty("__metatable")) {
    var metamethod = tab.__metatable.__index;
    if (metamethod) {
      if (typeof metamethod === "function") {
        return thisCheck(tab, metamethod(tab, key));
      }
      if (metamethod.hasOwnProperty(key)) {
        return thisCheck(tab, metamethod[key]);
      }
    }
  }
  return null;
}

function call(tab, args) {
  var tabType = rawType(tab);
  if (tabType === "function") {
    var ret = tab.apply(null, args);
    if (ret === undefined) return [];
    if (Array.isArray(ret)) return ret;
    return [ret];
  }
  if (tab === null) throw "attempt to call a " + tabType + " value";
}

function newindex(tab, key, value) {
  if (tab === null) throw "attempt to index a nil value";
  if (tab.hasOwnProperty(key)) {
    return tab[key] = value;
  }
  if (tab.hasOwnProperty("__metatable")) {
    var metamethod = tab.__metatable.__newindex;
    if (metamethod) {
      return metamethod(tab, key, value);
    }
  }
  tab[key] = value;
}

function rawType(val) {
  if (val === null) return "nil";
  if (typeof val === "object") return "table";
  return typeof val;
}

function type(val) {
  return [rawType(val)];
}


function setmetatable(tab, meta) {
  Object.defineProperty(tab, "__metatable", {value:meta});
  return [tab];
}

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

function pairs(tab) {
  return [next, tab, null];
}

function inext(tab, key) {
  var newKey;
  if (Array.isArray(tab) && tab.length && typeof key === "number" &&
      tab.hasOwnProperty(newKey = key + 1)) {
    return [newKey, tab[newKey]];
  }
  return [];
}

function ipairs(tab) {
  return [inext, tab, 0];
}

function print() {
  console.log(Array.prototype.join.call(arguments, "\t"));
}

function assert(expr, message) {
  if (expr) return arguments;
  error(message);
}

function error(message) {
  throw message;
}

function func() {
  return eval("(new Function (" + Array.prototype.map.call(arguments, function (arg) {
    return JSON.stringify(arg);
  }).join(",") + "))");
}

return {
  table: table,
  type: type,
  setmetatable: setmetatable,
  print: print,
  assert: assert,
  error: error,
  next: next,
  pairs: pairs,
  ipairs: ipairs,
  eval: eval,
  func: func
};

});