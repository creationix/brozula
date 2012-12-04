local a, b = "One", "Deux";

function pp()
	local _b = b;
	a = "Une"
	local c = "Trois!";
	local function b()
		return a, _b, c;
	end
	return b;
end

print(pp()())

print(a)
