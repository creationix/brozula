// opcode names indexed by integer enum index.
var opcodes = ["ISLT", "ISGE", "ISLE", "ISGT", "ISEQV", "ISNEV", "ISEQS",
  "ISNES", "ISEQN", "ISNEN", "ISEQP", "ISNEP", "ISTC", "ISFC", "IST", "ISF",
  "MOV", "NOT", "UNM", "LEN", "ADDVN", "SUBVN", "MULVN", "DIVVN", "MODVN",
  "ADDNV", "SUBNV", "MULNV", "DIVNV", "MODNV", "ADDVV", "SUBVV", "MULVV",
  "DIVVV", "MODVV", "POW", "CAT", "KSTR", "KCDATA", "KSHORT", "KNUM", "KPRI",
  "KNIL", "UGET", "USETV", "USETS", "USETN", "USETP", "UCLO", "FNEW", "TNEW",
  "TDUP", "GGET", "GSET", "TGETV", "TGETS", "TGETB", "TSETV", "TSETS", "TSETB",
  "TSETM", "CALLM", "CALL", "CALLMT", "CALLT", "ITERC", "ITERN", "VARG",
  "ISNEXT", "RETM", "RET", "RET0", "RET1", "FORI", "JFORI", "FORL", "IFORL",
  "JFORL", "ITERL", "IITERL", "JITERL", "LOOP", "ILOOP", "JLOOP", "JMP",
  "FUNCF", "IFUNCF", "JFUNCF", "FUNCV", "IFUNCV", "JFUNCV", "FUNCC", "FUNCCW"];

// bytecode decoders indexed by opcode name.
var opdecs = {
  ISLT: AD, ISGE: AD, ISLE: AD, ISGT: AD, ISEQV: AD, ISNEV: AD, ISEQS: AD,
  ISNES: AD, ISEQN: AD, ISNEN: AD, ISEQP: AD, ISNEP: AD, ISTC: AD, ISFC: AD,
  IST: D, ISF: D, MOV: AD, NOT: AD, UNM: AD, LEN: AD, ADDVN: ABC, SUBVN: ABC,
  MULVN: ABC, DIVVN: ABC, MODVN: ABC, ADDNV: ABC, SUBNV: ABC, MULNV: ABC,
  DIVNV: ABC, MODNV: ABC, ADDVV: ABC, SUBVV: ABC, MULVV: ABC, DIVVV: ABC,
  MODVV: ABC, POW: ABC, CAT: ABC, KSTR: AD, KCDATA: AD, KSHORT: AD, KNUM: AD,
  KPRI: AD, KNIL: AD, UGET: AD, USETV: AD, USETS: AD, USETN: AD, USETP: AD,
  UCLO: AD, FNEW: AD, TNEW: AD, TDUP: AD, GGET: AD, GSET: AD, TGETV: ABC,
  TGETS: ABC, TGETB: ABC, TSETV: ABC, TSETS: ABC, TSETB: ABC, TSETM: AD,
  CALLM: ABC, CALL: ABC, CALLMT: AD, CALLT: AD, ITERC: ABC, ITERN: ABC,
  VARG: ABC, ISNEXT: AD, RETM: AD, RET: AD, RET0: AD, RET1: AD, FORI: AD,
  JFORI: AD, FORL: AD, IFORL: AD, JFORL: AD, ITERL: AD, IITERL: AD, JITERL: AD,
  LOOP: AD, ILOOP: AD, JLOOP: AD, JMP: AD, FUNCF: A, IFUNCF: A, JFUNCF: AD,
  FUNCV: A, IFUNCV: A, JFUNCV: AD, FUNCC: A, FUNCCW: A
};

// bytecode type decoders
function ABC(stream, name) {
  return [name, stream.B(), stream.B(), stream.B()];
}
function AD(stream, name) {
  return [name, stream.B(), stream.H()];
}
function A(stream, name) {
  var data = [name, stream.B()];
  stream.index += 2;
  return data;
}
function D(stream, name) {
  stream.index++;
  return [name, stream.H()];
}
