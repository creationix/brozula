print "\n1 to 10"
for i = 1, 10 do
  print(i)
end

print "\n10 to 1"
for i = 10, 1, -1 do
  print(i)
end
local list = {"This", "is", "a", "list"}
local hash = {this="is",a="hash"}

print "\nlist pairs"
for k, v in pairs(list) do
  print(k, v)
end

print "\nhash pairs"
for k, v in pairs(hash) do
  print(k, v)
end

print "\nlist ipairs"
for k, v in ipairs(list) do
  print(k, v)
end