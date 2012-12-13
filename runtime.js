( // Module boilerplate to support browser globals, node.js and AMD.
  (typeof module !== "undefined" && function (m) { module.exports = m(); }) ||
  (typeof define === "function" && function (m) { define(m); }) ||
  (function (m) { window.brozula = window.brozula || {}; window.brozula.runtime = m(); })
)(function () {

function Table() {
  this.array = [];
  this.keys = [];
  this.values = [];
  this.hash = {};
}
Table.prototype.remove = function (key) {
  var t = typeof key;
  if (t === "number") {
    delete this.array[key];
    return;
  }
  if (t === "string") {
    delete this.hash[key];
  }
  var index = this.keys.indexOf(key);
  if (index >= 0) {
    this.values.splice(index, 1);
    this.keys.splice(index, 1);
  }
};
Table.prototype.haskey = function (key) {
  var t = typeof key;
  if (t === "number" && key >= 0 && (key >>> 0 === key)) return this.array[key] !== undefined;
  if (t === "string") return this.hash[key] !== undefined;
  return this.keys.indexOf(key) >= 0;
};
Table.prototype.set = function(key, value) {
  if (value === undefined || value === null) {
    return this.remove(key);
  }
  var t = typeof key;
  if (t === "number" && key >= 0 && (key >>> 0 === key)) return this.array[key] = value;
  if (t === "string") return this.hash[key] = value;
  var index = this.keys.indexOf(key);
  if (index >= 0) {
    this.values[index] = value;
  }
  else {
    this.keys.push(key);
    this.values.push(value);
  }
};
Table.prototype.get = function (key) {
  var t = typeof key;
  var v;
  if (t === "number") v = this.array[key];
  else if (t === "string") v = this.hash[key];
  else {
    var index = this.keys.indexOf(key);
    if (index >= 0) v = this.values[index];
  }
  return v === undefined ? null : v;
};
Table.prototype.inext = function (key) {
  if (typeof key === "number") {
    for (var i = key + 1, l = this.array.length; i < l; i++) {
      var v = this.array[i];
      if (v !== undefined) return [i, v];
    }
  }
  return [];
};
Table.prototype.next = function (key) {
  // iterate over numbers first
  var isNil = key === null || key === undefined;
  var v;
  if (isNil || (typeof key === "number" && (key >>> 0) === key && key >= 0)) {
    if (isNil) key = -1;
    for (var i = key + 1, l = this.array.length; i < l; i++) {
      v = this.array[i];
      if (v !== undefined) return [i, v];
    }
    v = this.keys[0];
    if (v !== undefined) {
      return [v, this.values[0]];
    }
    key = null;
  }
  var index = this.keys.indexOf(key) + 1;
  if (index) {
    if (index < this.keys.length) {
      return [this.keys[index], this.values[index]];
    }
    key = null;
  }
  var keys = Object.keys(this.hash);
  if (keys.length && key === null) {
    key = keys[0];
    return [key, this.hash[key]];
  }
  else {
    index = keys.indexOf(key) + 1;
    if (index) {
      if (index < keys.length) {
        key = keys[index];
        return [key, this.hash[key]];
      }
    }
  }
  return [];
};
Table.prototype.len = function () {
  return this.array.length - 1;
};
Table.clone = function (tab) {
  var clone = new Table();
  if (Array.isArray(tab)) {
    clone.array = tab;
    return clone;
  }
  if (!(tab instanceof Table)) {
    clone.hash = tab;
    return clone;
  }
  throw new Error("TODO: Implement Table.clone");
};

var patternClasses = {
  "%a": "A-Za-z", "%A": "^A-Za-z", "%p": "\x21-\x2f\x3a-\x40\x5b-\x60\x7b-\x7e",
  "%P": "^\x21-\x2f\x3a-\x40\x5b-\x60\x7b-\x7e", "%s": "\x09-\x0d\x20",
  "%S": "^\x09-\x0d\x20", "%u": "A-Z", "%U": "^A-Z", "%d": "0-9", "%D": "^0-9",
  "%w": "0-9A-Za-z", "%W": "^0-9A-Za-z", "%x": "0-9A-Fa-f", "%X": "^0-9A-Fa-f",
  "%z": "\x00", "%Z": "^\x00", "%l": "a-z", "%L": "^a-z", "%c": "\x00-\x1f\x7f",
  "%C": "^\x00-\x1f\x7f"
};

function patternToRegExp(pattern, flags) {
  pattern = pattern.replace(/%./g, function (match) {
    var cls = patternClasses[match];
    if (cls) return cls;
    return match.substr(1);
  }).replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t");
  return new RegExp(pattern, flags);
}

var string = {
  byte: function () {
    throw new Error("TODO: implement string.byte");
  },
  char: function () {
    throw new Error("TODO: implement string.char");
  },
  dump: function () {
    throw new Error("TODO: implement string.dump");
  },
  find: function (s, pattern, init, plain) {
    if (init === null || init === undefined) init = 1;
    if (plain) {
      var start = s.indexOf(pattern, init - 1);
      if (start >= 0) {
        return [start + 1, start + pattern.length];
      }
      return [null];
    }
    if (init > 1) s = s.substr(init - 1);
    var match = s.match(patternToRegExp(pattern));
    if (match) {
      return [match.index + init, match.index + init - 1 + match[0].length];
    }
    return [null];
  },
  format: function () {
    throw new Error("TODO: implement string.format");
  },
  gfind: function () {
    throw new Error("TODO: implement string.gfind");
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
  gsub: function (s, pattern, repl, n) {
    // TODO: Implement everything
    var regexp = patternToRegExp(pattern, "g");
    s = s.replace(regexp, repl);
    return [s];
  },
  len: function () {
    throw new Error("TODO: implement string.len");
  },
  lower: function () {
    throw new Error("TODO: implement string.lower");
  },
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
  rep: function (s, n) {
    var str = "";
    for (var i = 0; i < n; i++) {
      str += s;
    }
    return str;
  },
  reverse: function () {
    throw new Error("TODO: implement string.reverse");
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
  },
  upper: function () {
    throw new Error("TODO: implement string.upper");
  }
};

var stringmeta = {__index: string};

// Metatmethods
function lt(op1, op2) {
  var t1 = type(op1), t2 = type(op2);
  if (t1 === t2) {
    if (t1 === "number" || t1 === "string") return op1 < op2;
    var h = getcomphandler(op1, op2, "__lt");
    if (h) return h(op1, op2)[0];
  }
  throw "attempt to compare " + t1 + " with " + t2;
}
function le(op1, op2) {
  var t1 = type(op1), t2 = type(op2);
  if (t1 === t2) {
    if (t1 === "number" || t1 === "string") return op1 <= op2;
    var h = getcomphandler(op1, op2, "__le");
    if (h) return h(op1, op2)[0];
    h = getcomphandler(op1, op2, "__lt");
    if (h) return !(h(op2, op1)[0]);
  }
  throw "attempt to compare " + t1 + " with " + t2;
}
function eq(op1, op2) {
  var t1 = type(op1), t2 = type(op2);
  if (op1 === op2) return true;
  if (t1 !== t2) return false;
  var h = getcomphandler(op1, op2, "__eq");
  if (h) return h(op1, op2)[0];
  return false;
}
function unm(op) {
  var o = tonumber(op);
  if (typeof o === "number") return -o;
  var h = getmetamethod(op, "__unm");
  if (h) return h(op)[0];
  throw "attempt to perform arithmetic on a " + type(op) + " value";
}
function len(op) {
  var t = type(op);
  if (t === "string") {
    return op.length;
  }
  var h = getmetamethod(op, "__len");
  if (h) {
    return h(op)[0];
  }
  if (t === "table") {
    if (op instanceof Table) return op.len();
    if (Array.isArray(op)) return op.length - 1;
    return 0;
  }
  throw new Error("attempt to get length of " + t + " value");
}

function add(op1, op2) {
  var o1 = tonumber(op1), o2 = tonumber(op2);
  if (typeof o1 === "number" && typeof o2 === "number") {
    return o1 + o2;
  }
  var h = getbinhandler(op1, op2, "__add");
  if (h) {
    return h(op1, op2)[0];
  }
  throw "attempt to perform arithmetic on a " + type(op1) + " value";
}
function sub(op1, op2) {
  var o1 = tonumber(op1), o2 = tonumber(op2);
  if (typeof o1 === "number" && typeof o2 === "number") {
    return o1 - o2;
  }
  var h = getbinhandler(op1, op2, "__sub");
  if (h) return h(op1, op2)[0];
  throw "attempt to perform arithmetic on a " + type(op1) + " value";
}
function mul(op1, op2) {
  var o1 = tonumber(op1), o2 = tonumber(op2);
  if (typeof o1 === "number" && typeof o2 === "number") {
    return o1 * o2;
  }
  var h = getbinhandler(op1, op2, "__mul");
  if (h) return h(op1, op2)[0];
  throw "attempt to perform arithmetic on a " + type(op1) + " value";
}
function div(op1, op2) {
  var o1 = tonumber(op1), o2 = tonumber(op2);
  if (typeof o1 === "number" && typeof o2 === "number") {
    return o1 / o2;
  }
  var h = getbinhandler(op1, op2, "__div");
  if (h) return h(op1, op2)[0];
  throw "attempt to perform arithmetic on a " + type(op1) + " value";
}
function mod(op1, op2) {
  var o1 = tonumber(op1), o2 = tonumber(op2);
  if (typeof o1 === "number" && typeof o2 === "number") {
    return o1 % o2;
  }
  var h = getbinhandler(op1, op2, "__mod");
  if (h) return h(op1, op2)[0];
  throw "attempt to perform arithmetic on a " + type(op1) + " value";
}
function pow(op1, op2) {
  var o1 = tonumber(op1), o2 = tonumber(op2);
  if (typeof o1 === "number" && typeof o2 === "number") {
    return Math.pow(o1, o2);
  }
  var h = getbinhandler(op1, op2, "__pow");
  if (h) return h(op1, op2)[0];
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
    return h(op1, op2)[0];
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
    var v = rawget(table, key);
    if (v !== null) return v;
    h = getmetamethod(table, "__index");
    if (!h) return null;
  }
  else {
    h = getmetamethod(table, "__index");
    if (!h) throw "attempt to index a " + t + " value";
  }
  if (typeof h === "function") {
    return h(table, key)[0];
  }
  return index(h, key);
}
function newindex(table, key, val) {
  var t, h;
  t = type(table);
  if (t === "table") {
    if (haskey(table, key)) { rawset(table, key, val); return; }
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
  if (tab instanceof Table) return tab.get(key);
  return tab[key];
}

function haskey(tab, key) {
  if (tab instanceof Table) return tab.haskey(key);
  return tab[key] !== undefined;
}

function rawset(tab, key, val) {
  if (tab instanceof Table) return tab.set(key, val);
  tab[key] = val;
}

function setmetatable(tab, meta) {
  var t = type(tab);
  if (t !== "table") throw "table expected, got " + t;
  Object.defineProperty(tab, "__meta__", {value: meta});
}

function getmetatable(tab) {
  var t = type(tab);
  if (t === "string") return stringmeta;
  if (t !== "table") return null;
  return tab.__meta__ || null;
}

var nextID = 1;
function getpointer(tab) {
  if (typeof tab === "function" && tab.name) {
    return tab.name;
  }
  var id = tab.__id__;
  if (id === undefined) {
    id = (nextID++).toString(16);
    id = "0x" + "00000000".substr(id.length) + id;
    Object.defineProperty(tab, "__id__", {value: id});
  }
  return id;
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

function tostring(val) {
  var h = getmetamethod(val, "__tostring");
  if (h) return h(val)[0];
  var t = type(val);
  if (t === "table") return "table: " + getpointer(val);
  if (t === "function") return "function: " + getpointer(val);
  if (t === "nil") return "nil";
  return "" + val;
}

function getmetamethod(tab, event) {
  var meta = getmetatable(tab);
  if (meta) {
    var method = rawget(meta, event);
    if (method !== null) return method;
  }
  return null;
}

function getcomphandler(op1, op2, event) {
  var mm1 = getmetamethod(op1, event);
  var mm2 = getmetamethod(op2, event);
  if (mm1 === mm2) return mm1;
  return null;
}

function getbinhandler(op1, op2, event) {
  var h = getmetamethod(op1, event);
  if (h) return h;
  h = getmetamethod(op2, event);
  if (h) return h;
  return null;
}

function next(tab, key) {
  if (tab instanceof Table) return tab.next(key);
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
  if (tab instanceof Table) return tab.inext(key);
  var newKey;
  if (Array.isArray(tab) && tab.length && typeof key === "number" &&
      tab[newKey = key + 1] !== undefined) {
    return [newKey, tab[newKey]];
  }
  return [];
}


return {
  lt: lt, le: le, eq: eq, unm: unm, len: len, add: add, sub: sub, mul: mul,
  div: div, mod: mod, pow: pow, concat: concat, gc: gc, index: index,
  newindex: newindex, call: call, falsy: falsy, type: type,
  setmetatable: setmetatable, getmetatable: getmetatable, rawget: rawget,
  rawset: rawset, tonumber: tonumber, tostring: tostring, string: string,
  Table: Table, next: next, inext: inext
};

});