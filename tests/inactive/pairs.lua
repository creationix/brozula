local ret = ""
for k,v in pairs({1,'a',3}) do
   ret = ret .. k .. ":" .. v .. "|"
end
assert(ret == "1:1|2:a|3:3|", ret)


local ret = ""
for k,v in pairs({a=1,b='a'}) do
   ret = ret .. k .. ":" .. v .. "|"
end
assert(ret == "a:1|b:a|" or ret == "b:a|a:1|" , ret)


local ret = ""
for k,v in pairs{[0]='zero',[1]='one'} do
   ret = ret .. k .. ":" .. v .. "|"
end
assert(ret == "0:zero|1:one|" or ret ==  "1:one|0:zero|" , ret)

