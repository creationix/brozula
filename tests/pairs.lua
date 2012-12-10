local list = {"This","is","a","list"}
local hash = {this="is",a="hash"}
for key, value in pairs(list) do
  print(key, value)
end
for key, value in pairs(hash) do
  print(key, value)
end