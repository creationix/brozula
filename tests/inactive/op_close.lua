local f = {};
for i=1,2 do
	local p;
	f[i] = function (set)
		if set then
			p = set;
		end
		return p;
	end;
end

assert(f[1]("foo") == "foo");
assert(f[2]("bar") == "bar");
assert(f[1]() == "foo");
assert(f[2]() == "bar");
