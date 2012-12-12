local ret = 0
for i = 1, 10 do
   print("counting to 10...", i)
   ret = ret + i
end
assert(ret == 55, ret)

ret=0
for i = 1, 10,2 do
   print("counting to 10 by 2...", i)
   ret = ret + i
end

assert(ret == 25, ret)

ret=0
for i = 10, 1, -1 do
   print("counting down from 10...", i)
   ret = ret + i
end
assert(ret == 55, ret)
print(i)

function looponnvars(nvars)

   -- in ljs < 0.0011 this would mutate "nvars"...
   for i = nvars, 0, -1 do
	  print("i,loop.nvars", i, nvars)
   end
end

function incnvars(nvars)
   nvars = nvars + 1
end
function test(a, nvars)
   local atstart = nvars
   print("test.nvars", nvars)
   incnvars(nvars)
   print("test.nvars", nvars)
   looponnvars(nvars)
   print("test.nvars", nvars)
   assert(atstart == nvars)
end

local nvars = 5
print("main.nvars", nvars)
test(1, nvars)
print("main.nvars", nvars)
assert(nvars == 5)