function foo(a, b, ...)
	assert(a == 1);
	assert(b == 2);
	local c, d = ...;
	assert(c == 3);
	assert(d == 4);
	return a, b, ...;
end

local a, b, c, d = foo(1, 2, 3, 4);
assert(a == 1);
assert(b == 2);
print("c is", c);
assert(c == 3);
assert(d == 4);

