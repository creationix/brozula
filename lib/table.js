module.exports = Table;

// Represents a lua table.
function Table(narray, nhash) {
  this.array = new Array(narray);
  this.keys = new Array(nhash);
  this.values = new Array(nhash);
}

