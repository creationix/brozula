a = { value = 5 };
setmetatable(a, { __add = function (a, b)
		if type(a) == "table" then
			return a.value + b;
		else
			return a + b.value;
		end
	end
});

print(5 + 5)
print(a.value + 5)
print(5 + a.value)
print(a.value + a.value)
print(a + 5)
print(5 + a)
