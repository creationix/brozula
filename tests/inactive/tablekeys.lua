local t = {}

t[5.5] = "a"
t["5.5"] = "b"

for k,v in pairs(t) do
	print(k,v)
end

assert(t[5.5] ~= t["5.5"])

t[t] = true

