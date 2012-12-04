local i = 1;
local s = "the rain in spain stays mainly in the plain";
local st = { "the", "rain", "in", "spain", "stays", "mainly", "in", "the", "plain" };
for word in string.gmatch(s, "%a+") do
	print(word)
	assert(word == st[i], word.." == "..st[i]);
	i = i + 1;
end

assert(i == 10, i.." == 10");
