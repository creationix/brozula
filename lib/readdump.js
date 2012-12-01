var Parser = require('./parser');

module.exports = function (buffer) {
  var parser = new Parser(buffer);

  // header = ESC 'L' 'J' versionB flagsU [namelenU nameB*]
  if (parser.B() !== 0x1b) throw new Error("Expected ESC in first byte");
  if (parser.B() !== 0x4c) throw new Error("Expected L in second byte");
  if (parser.B() !== 0x4a) throw new Error("Expected J in third byte");
  if (parser.B() !== 1) throw new Error("Only version 1 supported");
  var flags = parser.U();
  if (flags & 1) throw new Error("Big endian encoding not supported yet");
  if (!(flags & 2)) throw new Error("Non stripped bytecode not supported yet");
  if (flags & 4) throw new Error("FFI bytecode not supported");

  // proto+
  var protoBuffers = [];
  do {
    var len = parser.U();
    protoBuffers.push(buffer.slice(parser.index, parser.index + len));
    parser.index += len;
  } while (buffer[parser.index])

  // 0U and EOF
  if (parser.U() !== 0) throw new Error("Missing 0U at end of file");
  if (parser.index < buffer.length) throw new Error((length - parser.index) + " bytes leftover");

  return protoBuffers;

}