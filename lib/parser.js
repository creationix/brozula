module.exports = Parser;

function Parser(buffer) {
  this.buffer = buffer;
  this.index = 0;
}

Parser.prototype.B = function () {
  return this.buffer[this.index++];
};

// Consume 16 bit value from stream and move pointer
Parser.prototype.H = function () {
  return this.buffer[this.index++] +
        (this.buffer[this.index++] << 8);
};

// Consume 32 bit value from stream and move pointer
Parser.prototype.W = function () {
  return this.buffer[this.index++] +
        (this.buffer[this.index++] << 8) +
        (this.buffer[this.index++] << 16) +
        (this.buffer[this.index++] << 24);
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
  return value;
};
