
function falsy(val) {
  return val === false || val === null;
}

function length(val) {
 if (Array.isArray(val)) return val.length;
 if (typeof val === "string") return val.length;
 if (typeof val === "object") return 0;
 throw new Error("attempt to get length of " + type(val) + " value");
}

function type(val) {
  if (val === null) return ["nil"];
  if (typeof val === "object") return ["table"];
  return [typeof val];
}

function arr(val) {
  if (Array.isArray(val)) return val;
  if (val === undefined) return [];
  return [val];
}

function newState() {
  return {
    console: console,
    print: console.log,
    type: type,
    require: require,
    process: process,
  };
}

