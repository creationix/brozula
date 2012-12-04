assert(tostring(3) == "3")
assert(tostring('3') == "3")
local t = setmetatable({ name="test" },
	{ __tostring=function(self)
	return "viameta:"..self.name
end
});
assert(tostring(t) == 'viameta:test')
assert(string.find(tostring(getmetatable(t)), "^table:"), tostring(getmetatable(t)))


