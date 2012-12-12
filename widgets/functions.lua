
local function outer(a, b)
  print "start outer"
  local function inner(a, b)
    print "inner"
    return a + b
  end
  print "end outer"
  return inner(a, b)
end

print(outer(4, 5))
