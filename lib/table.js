module.exports = Table;

// Represents a lua table.
function Table(narray, nhash) {
  if (narray) {
    this.array = new Array(narray);
  }
  if (nhash) {
    this.keys = new Array(nhash);
    this.values = new Array(nhash);
  }
}

// Get a value from a table
Table.prototype.rawget = function (key) {
  // Use a normal js object for string keys
  if (this.obj && (typeof key === "string") && this.obj.hasOwnProperty(key)) {
    return this.obj[key];
  }
  // Get array keys from array storage
  if (this.array && (typeof key === "number") && key > 0 && key <= this.array.length) {
    return this.array[key - 1];
  }
  // Use two parallel arrays for non-string keys
  if (this.keys) {
    var index = this.keys.indexOf(key);
    if (index >= 0) {
      return this.values[index];
    }
  }
  return null;
};

// Set a value to a table
Table.prototype.rawset = function (key, value) {
  if (key === null) throw new Error("table index is nil");
  if (typeof key === "string") {
    if (!this.obj) this.obj = {};
    this.obj[key] = value;
    return;
  }
  if (typeof key === "number" && key > 0 && key <= this.array.length) {
    if (!this.array) this.array = [];
    this.array[key - 1] = value;
    return;
  }
  if (!this.keys) {
    this.keys = [];
    this.values = [];
  }
  var index = this.keys.indexOf(key);
  if (index >= 0) {
    this.values[index] = value;
    return;
  }
  this.keys.push(key);
  this.values.push(value);
};
