module.exports = Table;

// Represents a lua table.
function Table(narray, nhash) {
  this.array = new Array(narray);
  this.keys = new Array(nhash);
  this.values = new Array(nhash);
}

// Get a value from a table
Table.prototype.rawget = function (key) {
  // Get array keys from array storage
  if (typeof key === "number" && key > 0 && key <= this.array.length) {
    return this.array[key - 1];
  }
  var index = this.keys.indexOf(key);
  if (index >= 0) {
    return this.values[index];
  }
  return null;
};

// Set a value to a table
Table.prototype.rawset = function (key, value) {
  // Get array keys from array storage
  if (typeof key === "number" && key > 0 && key <= this.array.length) {
    this.array[key - 1] = value;
    return;
  }
  var index = this.keys.indexOf(key);
  if (index >= 0) {
    this.values[index] = value;
    return;
  }
  this.keys.push(key);
  this.values.push(value);
};
