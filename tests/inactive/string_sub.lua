assert("Lua user" == string.sub("Hello Lua user", 7))      -- from character 7 until the end
assert("Lua" == string.sub("Hello Lua user", 7, 9))   -- from character 7 until and including 9

local ret = string.sub("Hello Lua user", -8)
assert("Lua user" == ret,ret.."/Lua user")     -- 8 from the end until the end

ret =  string.sub("Hello Lua user", -8, 9)
assert("Lua" == ret, ret)  -- 8 from the end until 9 from the start

ret = string.sub("Hello Lua user", -8, -6)
assert("Lua" == ret, ret.."/Lua") -- 8 from the end until 6 from the end
