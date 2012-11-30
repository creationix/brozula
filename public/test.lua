Square = {}
function Square:initialize(w)
  self.w = w
end
function Square:area()
  return self.w * self.w
end

square = setmetatable({}, {__index=Square})
square:initialize(4)
return square:area()