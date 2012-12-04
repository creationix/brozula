// Represents a lua table.
function Table(narray, nhash) {
  if (narray) {
    this.__array = new Array(narray);
  }
  if (nhash) {
    this.__keys = new Array(nhash);
    this.__values = new Array(nhash);
  }
}

// Get a value from a table
Table.prototype.rawget = function (key) {
  // Use a normal js object for string keys
  if ((typeof key === "string") && this.hasOwnProperty(key)) {
    return this[key];
  }
  // Get array keys from array storage
  if (this.__array && (typeof key === "number") && key > 0 && key <= this.__array.length) {
    return this.__array[key - 1];
  }
  // Use two parallel arrays for non-string keys
  if (this.__keys) {
    var index = this.__keys.indexOf(key);
    if (index >= 0) {
      return this.__values[index];
    }
  }
  return null;
};

// Set a value to a table
Table.prototype.rawset = function (key, value) {
  if (key === null) throw new Error("table index is nil");
  if (typeof key === "string") {
    this[" " + key] = value;
    return;
  }
  if (typeof key === "number" && key > 0 && key <= this.__array.length) {
    if (!this.__array) this.__array = [];
    this.__array[key - 1] = value;
    return;
  }
  if (!this.__keys) {
    this.__keys = [];
    this.__values = [];
  }
  var index = this.__keys.indexOf(key);
  if (index >= 0) {
    this.__values[index] = value;
    return;
  }
  this.__keys.push(key);
  this.__values.push(value);
};

function newState() {
  var global = new Table();
  global.print = function () {
    console.log(Array.prototype.join.call(arguments, "\t"));
    return [];
  };
  global.type = function (val) {
    if (val === null) return ["nil"];
    if (val instanceof Table) return ["table"];
    return [typeof val];
  };
  return global;
}

