print("_VERSION", _VERSION)

-- 2011.08.22 : http://lua-users.org/wiki/DemoScripts

-- Curried fripperies
put_in = function (t)
			local f
			f = function (k)
				   if k then t[k] = true; return f
				   else return end -- if
				end -- function
			return f
         end -- function
bag, enough = {}
put_in (bag) "wibble" (57) "grumpkin" "foo" (enough)
for k,v in pairs(bag) do print("bag has",k,"?",v) end

--- the classic recursive example:
function factorial(n)
   if n == 0 then
	  return 1
   else
	  return n * factorial(n-1)
   end
end

io.write("factorial of 10 is ", factorial(10), "\n")

-- and its tail recursive variant
fact = function (n)
		  local f
		  f = function (m,a)
				 if m == 0 then return a end -- if
				 return f(m-1,m*a) end -- function
		  return f(n,1) end -- function
print("factorial of 10 is",fact(10))
