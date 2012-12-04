
-- http://lua-users.org/wiki/MetatableEvents
t1a = {}
t1b = {}
t2  = {}
mt1 = { __eq = function( o1, o2 ) return 'whee' end }
mt2 = { __eq = function( o1, o2 ) return 'whee' end }

setmetatable( t1a, mt1 )
setmetatable( t1b, mt1 )
setmetatable( t2,  mt2 )

print( t1a == t1b )     --> true
print( t1a == t2 )      --> false

assert(t1a == t1b)
assert(t1a ~= t2)

local fooset = false
function foo (o1, o2) 
   print( '__eq call' )
   fooset = true
  return false 
end

t1 = {}
setmetatable( t1, {__eq = foo} )

t2 = t1
print( t1 == t2 ) --> true
assert(t1 == t2)
assert(not fooset)
-- string '__eq call' not printed (and comparison result is true, not like the return value of foo(...)), so no foo(...) call here

t3 = {}
setmetatable( t3, {__eq = foo} )
if t1 == t3 then assert(fooset) end  --> __eq call
-- foo(...) was called
