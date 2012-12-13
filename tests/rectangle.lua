local Rectangle = {}

function Rectangle:initialize(w, h)
  self.w = w
  self.h = h
end

function Rectangle:area()
  return self.w * self.h
end

local rectangleMeta = {__index = Rectangle}

local rect = setmetatable({}, rectangleMeta)
rect:initialize(3, 4)

print(rect:area())