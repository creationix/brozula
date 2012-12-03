module.exports = Parser;

function Parser(buffer) {
  this.buffer = buffer;
  this.index = 0;
  this.mark = 0;
}

Parser.prototype.dump = function () {
  var dump = this.buffer.slice(this.mark, this.index).inspect();
  this.mark = this.index;
  return dump;
}

Parser.prototype.B = function () {
  return this.buffer[this.index++];
};

// Consume 16 bit value from stream and move pointer
Parser.prototype.H = function () {
  var value = this.buffer.readUInt16LE(this.index);
  this.index += 2;
  return value;
};

// Consume 32 bit value from stream and move pointer
Parser.prototype.W = function () {
  var value = this.buffer.readUInt32LE(this.index);
  this.index += 4;
  return value;
};

// Decode ULEB128 from the stream
// http://en.wikipedia.org/wiki/LEB128
Parser.prototype.U = function () {
  var value = 0;
  var shift = 0;
  do {
    var byte = this.buffer[this.index++];
    value |= (byte & 0x7f) << shift;
    shift += 7;
  } while (byte >= 0x80);
  return value >>> 0;
};
