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

function eq(op1, op2) {
 // TODO: check metamethods
 return op1 === op2;
}

function ge(op1, op2) {
  return !lt(op1, op2);
}

function len(val) {
 if (Array.isArray(val)) return val.length;
 if (typeof val === "string") return val.length;
 if (typeof val === "object") return 0;
 throw new Error("attempt to get length of " + type(val) + " value");
}

function index(tab, key) {
  // TODO: Implement metamethods
  return tab[key];
}

function newindex(tab, key, value) {
  // TODO: Implement metamethods
  tab[key] = value;
}

function interpret(protos, protoIndex, env) { return function () {
  var pc = 0;
  var proto = protos[protoIndex];
  var bcins = proto.bcins;
  var slots = new Array(proto.framesize);
  arrCopy(slots, arguments, 0, proto.numparams);

//  console.log(bcins);

  var cmp, bc, i, multires;
  for(;;) {
    bc = bcins[pc++];
//    console.log(protoIndex, pc - 1, slots, multires, bc);
    switch (bc.op) {
      case "ISLT":
        if (!lt(slots[bc.a], slots[bc.d])) { pc++; }
        continue;

      case "ISGE":
        if (lt(slots[bc.a], slots[bc.d])) { pc++; }
        continue;

      case "ISLE":
        if (!le(slots[bc.a], slots[bc.d])) { pc++; }
        continue;

      case "ISGT":
        if (le(slots[bc.a], slots[bc.d])) { pc++; }
        continue;

      case "ISEQV":
        if (!eq(slots[bc.a], slots[bc.d])) { pc++; }
        continue;

      case "ISNEV":
        if (eq(slots[bc.a], slots[bc.d])) { pc++; }
        continue;

      case "ISEQS":
      case "ISEQN":
      case "ISEQP":
        if (!eq(slots[bc.a], bc.d)) { pc++; }
        continue;

      case "ISNES":
      case "ISNEN":
      case "ISNEP":
        if (eq(slots[bc.a], bc.d)) { pc++; }
        continue;

      case "ISTC":
        throw new Error("TODO: Implement ISTC");

      case "ISFC":
        throw new Error("TODO: Implement ISFC");

      case "IST":
        if (falsy(slots[bc.d])) { pc++ }
        continue;

      case "ISF":
        if (!falsy(slots[bc.d])) { pc++ }
        continue;

      case "MOV":
        slots[bc.a] = slots[bc.d];
        continue;

      case "NOT":
        slots[bc.a] = falsy(slots[bc.d]);
        continue;

      case "UNM":
        slots[bc.a] = -slots[bc.d];
        continue;

      case "LEN":
        slots[bc.a] = len(slots[bc.d]);
        continue;

      case "ADDVN":
        slots[bc.a] = slots[bc.b] + bc.c;
        continue;

      case "SUBVN":
        slots[bc.a] = slots[bc.b] - bc.c;
        continue;

      case "MULVN":
        slots[bc.a] = slots[bc.b] * bc.c;
        continue;

      case "DIVVN":
        slots[bc.a] = slots[bc.b] / bc.c;
        continue;

      case "MODVN":
        slots[bc.a] = slots[bc.b] % bc.c;
        continue;

      case "ADDNV":
        slots[bc.a] = bc.c + slots[bc.b];
        continue;

      case "SUBNV":
        slots[bc.a] = bc.c - slots[bc.b];
        continue;

      case "MULNV":
        slots[bc.a] = bc.c * slots[bc.b];
        continue;

      case "DIVNV":
        slots[bc.a] = bc.c / slots[bc.b];
        continue;

      case "MODNV":
        slots[bc.a] = bc.c % slots[bc.b];
        continue;

      case "ADDVV":
        slots[bc.a] = slots[bc.b] + slots[bc.c];
        continue;

      case "SUBVV":
        slots[bc.a] = slots[bc.b] - slots[bc.c];
        continue;

      case "MULVV":
        slots[bc.a] = slots[bc.b] * slots[bc.c];
        continue;

      case "DIVVV":
        slots[bc.a] = slots[bc.b] / slots[bc.c];
        continue;

      case "MODVV":
        slots[bc.a] = slots[bc.b] % slots[bc.c];
        continue;

      case "POW":
        slots[bc.a] = Math.pow(slots[bc.b], slots[bc.c]);
        continue;

      case "CAT":
        // TODO: test this, for off by one errors
        slots[bc.a] = slots.slice(bc.b, bc.c).join("");
        continue;

      case "KSTR":
      case "KCDATA":
      case "KSHORT":
      case "KNUM":
      case "KPRI":
        slots[bc.a] = bc.d;
        continue;

      case "KNIL":
        for (i = bc.a; i <= bc.d; i++) {
          slots[i] = null;
        }
        continue;

      case "UGET":
        if (bc.d & 0x8000) { // local
          if (bc.d & 0x4000) { // immutable
            // d = bc.d & 0x3fff;
          }
        }
        throw new Error("TODO: Implemnt UGET");

      case "USETV":
        throw new Error("TODO: Implement USETV");

      case "USETS":
        throw new Error("TODO: Implement USETS");

      case "USETN":
        throw new Error("TODO: Implement USETN");

      case "USETP":
        throw new Error("TODO: Implement USETP");

      case "UCLO":
        continue;
//        throw new Error("TODO: Implement UCLO");

      case "FNEW":
        slots[bc.a] = interpret(protos, bc.d, env);
        continue;

      case "TNEW":
        i = bc.d & 0x7ff;
        if (!i || (bc.d >>> 11)) {
          slots[bc.a] = {};
        }
        else {
          slots[bc.a] = new Array(i);
        }
        continue;

      case "TDUP":
        slots[bc.a] = Array.isArray(bc.d) ? bc.d.slice(0) : clone(bc.d);
        continue;

      case "GGET":
        slots[bc.a] = index(env, bc.d);
        continue;

      case "GSET":
        newindex(env, bc.d, slots[bc.a]);
        continue;

      case "TGETV":
        slots[bc.a] = index(slots[bc.b], slots[bc.c]);
        continue;

      case "TGETS":
      case "TGETB":
        slots[bc.a] = index(slots[bc.b], bc.c);
        continue;

      case "TSETV":
        newindex(slots[bc.b], slots[bc.c], slots[bc.a]);
        continue;

      case "TSETS":
      case "TSETB":
        newindex(slots[bc.b], bc.c, slots[bc.a]);
        continue;

      case "TSETM":
        // TODO: test manually
        i = new Buffer(8); // Get the lower 32 bits from the number
        i.writeDoubleLE(bc.d, 0);
        i = i.readUInt32LE(0);
        multires.forEach(function (val, index) {
          slots[bc.a - 1][index + i] = val;
        });
        multires = undefined;
        break;

      case "CALLM":
        if (bc.c > 0) { // Extras
          if (bc.b === 0) { // MULTIRES return
            multires = slots[bc.a].apply(null, slots.slice(bc.a + 1, bc.a + bc.c + 1).concat(multires));
          }
          else {
            arrCopy(slots, slots[bc.a].apply(null, slots.slice(bc.a + 1, bc.a + bc.c + 1).concat(multires)), bc.a, bc.b - 1);
            multires = undefined;
          }
        }
        else {
          if (bc.b === 0) { // MULTIRES return
            multires = slots[bc.a].apply(null, multires);
          }
          else if (bc.b === 1) { // no return
            slots[bc.a].apply(null, multires);
            multires = undefined;
          }
          else {
            arrCopy(slots, slots[bc.a].apply(null, multires), bc.a, bc.b - 1);
            multires = undefined;
          }
        }
        continue;

      case "CALL":
        if (bc.b === 0) { // MULTIRES return
          multires = slots[bc.a].apply(null, slots.slice(bc.a + 1, bc.a + bc.c));
        }
        else if (bc.b === 1) { // no return
          slots[bc.a].apply(null, slots.slice(bc.a + 1, bc.a + bc.c));
        }
        else {
          arrCopy(slots, slots[bc.a].apply(null, slots.slice(bc.a + 1, bc.a + bc.c)), bc.a, bc.b - 1);
        }
        continue;

      case "CALLMT":
        return slots[bc.a].apply(null, multires);

      case "CALLT":
        return slots[bc.a].apply(null, slots.slice(bc.a + 1, bc.a + bc.d));

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

      case "VARG":
        arrCopy(slots, multires, bc.a, bc.b - 1);
        multires = undefined;
        continue;

      case "ISNEXT":
        if (slots[bc.a - 3] === env.next && type(slots[bc.a - 2]) === "table" && slots[bc.a - 1] === null) {
          pc += bc.d;
        }
        else {
          throw new Error("Implement ISNEXT failure");
        }
        continue;

      case "RETM":
        return multires;

      case "RET":
        // TODO: test manually
        return slots.slice(bc.a, bc.a + bc.d);

      case "RET0":
        return [];

      case "RET1":
        return [slots[bc.a]];

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

      case "ITERL":
        if (!falsy(slots[bc.a])) {
          slots[bc.a - 1] = slots[bc.a];
          pc += bc.d;
        }
        continue;

      case "LOOP":
        // tracing noop
        continue;

      case "JMP":
        pc += bc.d;
        continue;

      case "FUNCF":
        throw new Error("TODO: Implement FUNCF");

      case "FUNCV":
        throw new Error("TODO: Implement FUNCV");

      case "FUNCC":
        throw new Error("TODO: Implement FUNCC");

      case "FUNCCW":
        throw new Error("TODO: Implement FUNCCW");

      default:
        throw new Error("TODO: Implement " + bc.op);
    }
  }
}}

return interpret;

});
