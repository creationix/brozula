if ffi then
  --local ffi = require("ffi")
  ffi.jsdef[[
    function warn(x) { console.warn(x); }
    function debug(x) { require('sys').debug(x); }
    function plusone(x) { return x+1; }
    function add(x,y) { return x+y; }
  ]]
  print("ffi.os=", ffi.os)
  print("ffi.js.debug=", ffi.js.debug);
  local emit
  if ffi.os == "node" then
     function emit(s)
		ffi.js.debug(s)
	 end
  else
	 function emit(s)
		ffi.js.warn(s)
	 end
  end

  emit("hi!")
  emit(ffi.js.plusone(6))
  
  assert(ffi.js.plusone(1)==2)
  assert(ffi.js.add(10,20)==30)
end