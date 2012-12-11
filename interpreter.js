( // Module boilerplate to support browser globals, node.js and AMD.
  (typeof module !== "undefined" && function (m) { module.exports = m(); }) ||
  (typeof define === "function" && function (m) { define(m); }) ||
  (function (m) { window.brozula = window.brozula || {}; window.brozula.interpret = m(); })
)(function () {
"use strict";

function arrCopy(array, data, offset, length) {
  for (var i = 0; i < length; i++) {
    array[offset + i] = data[i];
  }
}

function clone(original) {
  var copy = {};
  var keys = Object.keys(original);
  for (var i = 0, l = keys.length; i < l; i++) {
    var key = keys[i];
    copy[key] = original[key];
  }
  return copy;
}

function falsy(val) {
  return val === null || val === false || val === undefined;
}

function type(val) {
  if (val === null) return "nil";
  if (typeof val === "object") return "table";
  return typeof val;
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


function interpret(protos, protoIndex, env) { return function () {
  var pc = 0;
  var proto = protos[protoIndex];
  var bcins = proto.bcins;
  var slots = new Array(proto.framesize);
  arrCopy(slots, arguments, 0, proto.numparams);

//  console.log(bcins);

  var cmp, bc;
  for(;;) {
    bc = bcins[pc++];
    console.log(pc - 1, bc);
    switch(bc.op) {

      case "FORI":
        slots[bc.a + 3] = slots[bc.a];
        cmp = slots[bc.a] < slots[bc.a + 1] ? le : ge;
        continue;

      case "FORL":
        slots[bc.a + 3] += slots[bc.a + 2];
        if (cmp(slots[bc.a + 3], slots[bc.a + 1])) {
          pc += bc.d;
        }
        else {
          cmp = undefined;
        }
        continue;

      case "ITERC":
        slots[bc.a] = slots[bc.a - 3];
        slots[bc.a + 1] = slots[bc.a - 2];
        slots[bc.a + 2] = slots[bc.a - 1];
        arrCopy(slots, slots[bc.a](slots[bc.a - 2], slots[bc.a - 1]), bc.a, bc.b - 1);
        continue;


      case "ITERN":
        slots[bc.a] = slots[bc.a - 3];
        slots[bc.a + 1] = slots[bc.a - 2];
        slots[bc.a + 2] = slots[bc.a - 1];
        arrCopy(slots, env.next(slots[bc.a - 2], slots[bc.a - 1]), bc.a, bc.b - 1);
        continue;

      case "ITERL":
        if (!falsy(slots[bc.a])) {
          slots[bc.a - 1] = slots[bc.a];
          pc += bc.d;
        }
        continue;

      case "ISNEXT":
        if (slots[bc.a - 3] === env.next && type(slots[bc.a - 2]) === "table" && slots[bc.a - 1] === null) {
          pc += bc.d;
        }
        else {
          throw new Error("Implement ISNEXT failure");
        }
        continue;

      case "MOV":
        slots[bc.a] = slots[bc.d];
        continue;

      case "TDUP":
        slots[bc.a] = Array.isArray(bc.d) ? bc.d.slice(0) : clone(bc.d);
        continue;

      case "KSHORT":
        slots[bc.a] = bc.d;
        continue;

      case "GGET":
        slots[bc.a] = env[bc.d];
        continue;

      case "KSTR":
        slots[bc.a] = bc.d;
        continue;

      case "CALL":
        arrCopy(slots, slots[bc.a].apply(null, slots.slice(bc.a + 1, bc.a + bc.c)), bc.a, bc.b - 1);
        continue;

      case "TGETV":
        slots[bc.a] = slots[bc.b][slots[bc.c]];
        continue;

      case "ISF":
        if (!falsy(slots[bc.d])) { pc++; }
        continue;

      case "JMP":
        pc += bc.d;
        continue;

      case "LOOP":
        continue;

      case "ADDVN":
        slots[bc.a] = slots[bc.b] + bc.c;
        continue;

      case "RET0":
        return [];

      default:
        throw new Error("TODO: Implement " + bc.op);
    }
  }
}}

return interpret;

});
