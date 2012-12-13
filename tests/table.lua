local tab = {}
tab[print] = true
tab[false] = 0
tab[1] = "Hello"
tab[1.5] = "between"
tab[2] = "World"
tab[0] = "Hidden"
tab[-1] = "Stuff"
tab.name = "Tim"
tab.age = 30

for k, v in ipairs(tab) do
  print(k, v)
end

print()

for k, v in pairs(tab) do
  print(k, v)
end