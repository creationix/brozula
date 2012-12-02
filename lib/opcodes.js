// For mapping enum integer values to opcode names
exports.opcodes = [
  "ISLT", "ISGE", "ISLE", "ISGT", "ISEQV", "ISNEV", "ISEQS",
  "ISNES", "ISEQN", "ISNEN", "ISEQP", "ISNEP", "ISTC", "ISFC",
  "IST", "ISF", "MOV", "NOT", "UNM", "LEN", "ADDVN",
  "SUBVN", "MULVN", "DIVVN", "MODVN", "ADDNV", "SUBNV", "MULNV",
  "DIVNV", "MODNV", "ADDVV", "SUBVV", "MULVV", "DIVVV", "MODVV",
  "POW", "CAT", "KSTR", "KCDATA", "KSHORT", "KNUM", "KPRI",
  "KNIL", "UGET", "USETV", "USETS", "USETN", "USETP", "UCLO",
  "FNEW", "TNEW", "TDUP", "GGET", "GSET", "TGETV", "TGETS",
  "TGETB", "TSETV", "TSETS", "TSETB", "TSETM", "CALLM", "CALL",
  "CALLMT", "CALLT", "ITERC", "ITERN", "VARG", "ISNEXT", "RETM",
  "RET", "RET0", "RET1", "FORI", "JFORI", "FORL", "IFORL",
  "JFORL", "ITERL", "IITERL", "JITERL", "LOOP", "ILOOP", "JLOOP",
  "JMP", "FUNCF", "IFUNCF", "JFUNCF", "FUNCV", "IFUNCV", "JFUNCV",
  "FUNCC", "FUNCCW"
];

// For mapping opcode names to parse instructions
exports.bcdef = {
  ISLT: {ma: variable, mc: variable, mt: lt},
  ISGE: {ma: variable, mc: variable, mt: lt},
  ISLE: {ma: variable, mc: variable, mt: le},
  ISGT: {ma: variable, mc: variable, mt: le},
  ISEQV: {ma: variable, mc: variable, mt: eq},
  ISNEV: {ma: variable, mc: variable, mt: eq},
  ISEQS: {ma: variable, mc: str, mt: eq},
  ISNES: {ma: variable, mc: str, mt: eq},
  ISEQN: {ma: variable, mc: num, mt: eq},
  ISNEN: {ma: variable, mc: num, mt: eq},
  ISEQP: {ma: variable, mc: pri, mt: eq},
  ISNEP: {ma: variable, mc: pri, mt: eq},
  ISTC: {ma: dst, mc: variable},
  ISFC: {ma: dst, mc: variable},
  IST: {mc: variable},
  ISF: {mc: variable},
  MOV: {ma: dst, mc: variable},
  NOT: {ma: dst, mc: variable},
  UNM: {ma: dst, mc: variable, mt: unm},
  LEN: {ma: dst, mc: variable, mt: len},
  ADDVN: {ma: dst, mb: variable, mc: num, mt: add},
  SUBVN: {ma: dst, mb: variable, mc: num, mt: sub},
  MULVN: {ma: dst, mb: variable, mc: num, mt: mul},
  DIVVN: {ma: dst, mb: variable, mc: num, mt: div},
  MODVN: {ma: dst, mb: variable, mc: num, mt: mod},
  ADDNV: {ma: dst, mb: variable, mc: num, mt: add},
  SUBNV: {ma: dst, mb: variable, mc: num, mt: sub},
  MULNV: {ma: dst, mb: variable, mc: num, mt: mul},
  DIVNV: {ma: dst, mb: variable, mc: num, mt: div},
  MODNV: {ma: dst, mb: variable, mc: num, mt: mod},
  ADDVV: {ma: dst, mb: variable, mc: variable, mt: add},
  SUBVV: {ma: dst, mb: variable, mc: variable, mt: sub},
  MULVV: {ma: dst, mb: variable, mc: variable, mt: mul},
  DIVVV: {ma: dst, mb: variable, mc: variable, mt: div},
  MODVV: {ma: dst, mb: variable, mc: variable, mt: mod},
  POW: {ma: dst, mb: variable, mc: variable, mt: pow},
  CAT: {ma: dst, mb: rbase, mc: rbase, mt: concat},
  KSTR: {ma: dst, mc: str},
  KCDATA: {ma: dst, mc: cdata},
  KSHORT: {ma: dst, mc: lits},
  KNUM: {ma: dst, mc: num},
  KPRI: {ma: dst, mc: pri},
  KNIL: {ma: base, mc: base},
  UGET: {ma: dst, mc: uv},
  USETV: {ma: uv, mc: variable},
  USETS: {ma: uv, mc: str},
  USETN: {ma: uv, mc: num},
  USETP: {ma: uv, mc: pri},
  UCLO: {ma: rbase, mc: jump},
  FNEW: {ma: dst, mc: func, mt: gc},
  TNEW: {ma: dst, mc: lit, mt: gc},
  TDUP: {ma: dst, mc: tab, mt: gc},
  GGET: {ma: dst, mc: str, mt: index},
  GSET: {ma: variable, mc: str, mt: newindex},
  TGETV: {ma: dst, mb: variable, mc: variable, mt: index},
  TGETS: {ma: dst, mb: variable, mc: str, mt: index},
  TGETB: {ma: dst, mb: variable, mc: lit, mt: index},
  TSETV: {ma: variable, mb: variable, mc: variable, mt: newindex},
  TSETS: {ma: variable, mb: variable, mc: str, mt: newindex},
  TSETB: {ma: variable, mb: variable, mc: lit, mt: newindex},
  TSETM: {ma: base, mc: num, mt: newindex},
  CALLM: {ma: base, mb: lit, mc: lit, mt: call},
  CALL: {ma: base, mb: lit, mc: lit, mt: call},
  CALLMT: {ma: base, mc: lit, mt: call},
  CALLT: {ma: base, mc: lit, mt: call},
  ITERC: {ma: base, mb: lit, mc: lit, mt: call},
  ITERN: {ma: base, mb: lit, mc: lit, mt: call},
  VARG: {ma: base, mb: lit, mc: lit},
  ISNEXT: {ma: base, mc: jump},
  RETM: {ma: base, mc: lit},
  RET: {ma: rbase, mc: lit},
  RET0: {ma: rbase, mc: lit},
  RET1: {ma: rbase, mc: lit},
  FORI: {ma: base, mc: jump},
  JFORI: {ma: base, mc: jump},
  FORL: {ma: base, mc: jump},
  IFORL: {ma: base, mc: jump},
  JFORL: {ma: base, mc: lit},
  ITERL: {ma: base, mc: jump},
  IITERL: {ma: base, mc: jump},
  JITERL: {ma: base, mc: lit},
  LOOP: {ma: rbase, mc: jump},
  ILOOP: {ma: rbase, mc: jump},
  JLOOP: {ma: rbase, mc: lit},
  JMP: {ma: rbase, mc: jump},
  FUNCF: {ma: rbase},
  IFUNCF: {ma: rbase},
  JFUNCF: {ma: rbase, mc: lit},
  FUNCV: {ma: rbase},
  IFUNCV: {ma: rbase},
  JFUNCV: {ma: rbase, mc: lit},
  FUNCC: {ma: rbase},
  FUNCCW: {ma: rbase}
};

function variable() {
  throw new Error("TODO: Implement variable");
}
function lt() {
  throw new Error("TODO: Implement lt");
}
function le() {
  throw new Error("TODO: Implement le");
}
function eq() {
  throw new Error("TODO: Implement eq");
}
function str() {
  throw new Error("TODO: Implement str");
}
function num() {
  throw new Error("TODO: Implement num");
}
function pri() {
  throw new Error("TODO: Implement pri");
}
function dst() {
  throw new Error("TODO: Implement dst");
}
function unm() {
  throw new Error("TODO: Implement unm");
}
function len() {
  throw new Error("TODO: Implement len");
}
function add() {
  throw new Error("TODO: Implement add");
}
function sub() {
  throw new Error("TODO: Implement sub");
}
function mul() {
  throw new Error("TODO: Implement mul");
}
function div() {
  throw new Error("TODO: Implement div");
}
function mod() {
  throw new Error("TODO: Implement mod");
}
function pow() {
  throw new Error("TODO: Implement pow");
}
function rbase() {
  throw new Error("TODO: Implement rbase");
}
function concat() {
  throw new Error("TODO: Implement concat");
}
function cdata() {
  throw new Error("TODO: Implement cdata");
}
function lits() {
  throw new Error("TODO: Implement lits");
}
function base() {
  throw new Error("TODO: Implement base");
}
function uv() {
  throw new Error("TODO: Implement uv");
}
function jump() {
  throw new Error("TODO: Implement jump");
}
function func() {
  throw new Error("TODO: Implement func");
}
function gc() {
  throw new Error("TODO: Implement gc");
}
function lit() {
  throw new Error("TODO: Implement lit");
}
function tab() {
  throw new Error("TODO: Implement tab");
}
function index() {
  throw new Error("TODO: Implement index");
}
function newindex() {
  throw new Error("TODO: Implement newindex");
}
function call() {
  throw new Error("TODO: Implement call");
}

