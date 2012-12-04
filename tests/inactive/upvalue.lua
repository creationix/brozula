local u;
local f = {};
for i=1,2 do
	f[i] = function (set)
		if set then
			u = set;
		end
		return u;
	end;
end

assert(f[1]("foo") == "foo");
assert(f[2]() == "foo");

assert(f[2]("bar") == "bar");
assert(f[1]() == "bar");

local prevmeta = setmetatable({name="prevmeta"}, {__index={id="#prevmeta"}})

local upwithmeta = {name="upwithmeta"}
function maker()
   return function()
			 assert(getmetatable(upwithmeta), "upwithmeta has no metatable!")
			 assert("#"..upwithmeta.name == upwithmeta.id)
		  end
end
setmetatable(upwithmeta,
			 {__index={id="#upwithmeta"}})

maker()()

function taker()
   return function()
			 assert(getmetatable(upwithmeta), "upwithmeta has no metatable!")
			 upwithmeta = prevmeta
			 print(upwithmeta.name, upwithmeta.id)
			 assert("#prevmeta" == upwithmeta.id)
		  end
end
taker()()
local luaZ = {}
function luaZ:make_getS(buff)
   print("buff",buff)
  local b = buff
--   local data
  return function() -- chunk reader anonymous function here
			print("buff",b)
    if not b then return nil end
    local data = b
    b = nil
    return data
  end
end

local blah = "print(5)"
local tmp = luaZ:make_getS(""..blah)
local blah2 = tmp()
assert(blah2 == blah, tostring(blah) .. "~="..tostring(blah2))


u = "hello";
print(f[1]())
assert(f[1]() == "hello");
assert(f[2]() == "hello");
