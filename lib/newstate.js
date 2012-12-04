
function falsy(val) {
  return val === false || val === null;
}

function newState() {
  return {
    console: console,
    print: console.log,
    type: function (val) {
      if (val === null) return ["nil"];
      if (typeof val === "object") return ["table"];
      return [typeof val];
    }
  };
}

