( // Module boilerplate to support browser globals, node.js and AMD.
  (typeof module !== "undefined" && function (m) { module.exports = m(require('./runtime')); }) ||
  (typeof define === "function" && function (m) { define(["./runtime"], m); }) ||
  (function (m) { window.brozula = window.brozula || {}; window.brozula.globals = m(window.brozula.runtime); })
)(function (runtime) {

var falsy = runtime.falsy;
var slice = Array.prototype.slice;
var next = runtime.next;
var inext = runtime.inext;

var file = {
  close: function () { throw new Error("TODO: Implement io.file.close"); },
  flush: function () { throw new Error("TODO: Implement io.file.flush"); },
  lines: function () { throw new Error("TODO: Implement io.file.lines"); },
  read: function () { throw new Error("TODO: Implement io.file.read"); },
  seek: function () { throw new Error("TODO: Implement io.file.seek"); },
  setvbuf: function () { throw new Error("TODO: Implement io.file.setvbuf"); },
  write: function () { throw new Error("TODO: Implement io.file.write"); }
};

var _G = {
  _VERSION: "Lua 5.1",
  assert: function assert(expr, message) {
    if (falsy(expr)) throw message;
    return slice.call(arguments);
  },
  bit: {},
  collectgarbage: function collectgarbage() { throw new Error("TODO: Implement collectgarbage"); },
  coroutine: {
    create: function () { throw new Error("TODO: Implement coroutine.create"); },
    resume: function () { throw new Error("TODO: Implement coroutine.resume"); },
    running: function () { throw new Error("TODO: Implement coroutine.running"); },
    status: function () { throw new Error("TODO: Implement coroutine.status"); },
    wrap: function () { throw new Error("TODO: Implement coroutine.wrap"); },
    yield: function () { throw new Error("TODO: Implement coroutine.yield"); }
  },
  debug: {},
  error: function error(message) {
    throw message;
  },
  gcinfo: function gcinfo() { throw new Error("TODO: Implement gcinfo"); },
  getfenv: function getfenv() { throw new Error("TODO: Implement getfenv"); },
  getmetatable: function getmetatable(tab) {
    return [runtime.getmetatable(tab)];
  },
  io: {
    input: function () { throw new Error("TODO: Implement io.input"); },
    tmpfile: function () { throw new Error("TODO: Implement io.tmpfile"); },
    read: function () { throw new Error("TODO: Implement io.read"); },
    output: function () { throw new Error("TODO: Implement io.output"); },
    open: function () { throw new Error("TODO: Implement io.open"); },
    close: function () { throw new Error("TODO: Implement io.close"); },
    write: function () { throw new Error("TODO: Implement io.write"); },
    popen: function () { throw new Error("TODO: Implement io.popen"); },
    flush: function () { throw new Error("TODO: Implement io.flush"); },
    type: function () { throw new Error("TODO: Implement io.type"); },
    lines: function () { throw new Error("TODO: Implement io.lines"); },
    stdin: file,
    stdout: file,
    stderr: file
  },
  ipairs: function ipairs(tab) {
    return [inext, tab, 0];
  },
  jit: {},
  math: {
    abs:   function (x) { return [Math.abs(x)]; },
    acos:  function (x) { return [Math.acos(x)]; },
    asin:  function (x) { return [Math.asin(x)]; },
    atan:  function (x) { return [Math.atan(x)]; },
    atan2: function (x,y) { return [Math.atan2(x,y)]; },
    ceil:  function (x) { return [Math.ceil(x)]; },
    cos:   function (x) { return [Math.cos(x)]; },
    cosh:  function (x) { return [ ( Math.exp(x)+Math.exp(-x) ) / 2.0 ]; },
    deg:   function (x) { return [x/(Math.PI/180)]; },
    exp:   function (x) { return [Math.exp(x)]; },
    floor: function (x) { return [Math.floor(x)]; },
    fmod:  function () { throw new Error("TODO: Implement math.fmod"); },
    frexp: function () { throw new Error("TODO: Implement math.frexp"); },
    huge:  Infinity,
    ldexp: function () { throw new Error("TODO: Implement math.ldexp"); },
    log:   function (x,b) {
      return [ (typeof b === 'undefined' ) ?
        Math.log(x) :
        Math.log(x) / Math.log(x)
      ];
    },
    log10: function (x) { // This is deprecated in Lua 5.2
      return [ Math.log ( x ) / Math.LN10 ];
    },
    max: function (max) {
      for ( var i = 1; i < arguments.length; i++ ) {
        max = Math.max ( max , arguments[i] );
      }
      return [max];
    },
    min: function (min) {
      for ( var i = 1; i < arguments.length; i++ ) {
        min = Math.min ( min , arguments[i] );
      }
      return [min];
    },
    modf: function () { throw new Error("TODO: Implement math.modf"); },
    pi: Math.PI,
    pow: function (x) { return [Math.pow(x)]; },
    rad: function (x) { return [x*(Math.PI/180)]; },
    random: function (a,b) {
      var r = Math.random(x);
      switch ( arguments.length ) {
        case 0:
          return [rnd];
        case 1: /* only upper limit */
          if (1>a) { throw new Error("interval is empty"); }
          return [Math.floor(r*a)+1];
        case 2: /* lowe and upper limits */
          if (a>b) { throw new Error("interval is empty"); }
          return [Math.floor(r*(b-a+1))+1];
        default:
          throw new Error("wrong number of arguments");
      }
    },
    randomseed: function () { throw new Error("TODO: Implement math.randomseed"); },
    sin:  function (x) { return [Math.sin(x)]; },
    sinh: function (x) { return [ ( Math.exp(x)-Math.exp(-x) ) / 2.0 ]; },
    sqrt: function (x) { return [Math.sqrt(x)]; },
    tan:  function (x) { return [Math.tan(x)]; },
    tanh: function (x) {
      var ex = Math.exp(x);
      var ey = Math.exp(-x);
      return [ ( ex-ey ) / ( ex + ey ) ];
    }
  },
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
    concat: function (tab, joiner, i , j) {
      if (!(tab && typeof tab === "object")) throw "table expected";
      var slice = tab.array;
      if (arguments.length >= 3 ) {
        slice = slice.slice(i, ((typeof j === "undefined")? slice.length : j) );
      }
      return [slice.join(joiner)];
    },
    insert: function (tab) {
      if (!(tab && typeof tab === "object")) throw "table expected";
      var pos, val;
      if (arguments.length <= 2) {
        pos = tab.array.length+1;
        val = arguments[1];
      } else {
        pos = arguments[1];
        val = arguments[2];
      }
      tab.array.splice( pos, 0, val );
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
  xpcall: function xpcall() { throw new Error("TODO: Implement xpcall"); },
  inspect: function (val) {
    console.log(require('util').inspect(val, false, 10, true));
    return [];
  }
};
_G._G = _G;

return _G;

});