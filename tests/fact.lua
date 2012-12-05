local function test()
  local function fact (n)
    if n == 0 then
      return 1
    else
      return n * fact(n-1)
    end
  end
  return fact
end
print(test()(5))