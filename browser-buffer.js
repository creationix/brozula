
function Buffer(arraybuffer, offset, length) {
  if (arguments.length === 1) {
    offset = 0;
    length = arraybuffer.byteLength;
  }
  var buffer = new Uint8Array(arraybuffer, offset, length);
  buffer.__proto__ = Buffer.prototype;
  buffer.view = new DataView(arraybuffer, offset, length);
  buffer.offset = offset;
  buffer.length = length;
  return buffer;
}
Buffer.prototype.__proto__ = Uint8Array.prototype;
Buffer.prototype.slice = function (start, end) {
  return Buffer(this.buffer, start + this.offset, end - start);
}
Buffer.prototype.readUInt32LE = function (offset) {
  return this.view.getUint32(offset, true);
};
Buffer.prototype.readUInt16LE = function (offset) {
  return this.view.getUint16(offset, true);
};
Buffer.prototype.readDoubleLE = function (value, offset) {
  return this.view.getFloat64(offset, true);
};
Buffer.prototype.writeUInt32LE = function (value, offset) {
  this.view.setUint32(offset, value, true);
};
Buffer.prototype.toString = function (encoding) {
  if (!encoding) {
    return String.fromCharCode.apply(null, this);
  }
}