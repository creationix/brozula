local name = "tim"

print(name)

local function rename()
  name = "newname"
  return function ()
    print(1, name)
    return function ()
      print(2, name)
      return function ()
        name = "changed again"
      end
    end
  end
end

rename()()()()

print(name)

