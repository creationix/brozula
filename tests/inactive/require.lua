package.preload.themodule = function(name)
							   print("preload called for: ", name)
							   module(name, package.seeall)
							   print("_M", _M)
							   function _M.afunc(x) return x .. x end
							end

assert(not themodule)
print(require'themodule')
assert(require'themodule'.afunc)
assert(themodule.afunc("x") == "xx")
