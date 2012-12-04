function findpattern(text, pattern, start)
   return string.sub(text, string.find(text, pattern, start))
end
assert("a" == findpattern('bananas', 'az-'),  (findpattern('bananas', 'az-')))
assert("a" == findpattern('bananas', 'an-'))
assert("a" == findpattern('bannnnanas', 'an-'))
