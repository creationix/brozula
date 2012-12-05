local data = {"This", "is", "a", "stream?"}
local index = 1

print("before")
while data[index] do
  print(data[index])
  index = index + 1
end
print("after")
