assert(not string.find(".", "B", 1,1))
local two, three = string.find("asdf","sd",nil,true)
assert(two == 2 and three == 3)

assert(1 == string.find("asd.f", "."),  string.find("asd.f", "."))
assert(3 ==  string.find("asd.f", ".", 3))
assert(4 == string.find("asd.f", ".", 3, true))

-- http://lua-users.org/wiki/PatternsTutorial

local a,b = string.find('banana', 'an')   -- find 1st occurance of 'an'
assert(a == 2 and b == 3, a.."/"..b)

assert(not string.find('banana', 'lua'))  -- 'lua' will not be found

local text = 'a word to the wise'
local ret = string.sub(text, string.find(text, 'w...'))
assert(ret == "word", ret)
ret = string.sub(text, string.find(text, 'w...', 5)) -- bit further on...
assert("wise" == ret)


function findpattern(text, pattern, start)
   return string.sub(text, string.find(text, pattern, start))
end

ret = findpattern('a word to the wise', 'w...')
assert("word" == ret, ret)

assert("wise" == findpattern('a word to the wise', 'w...', 5))

assert("T" == findpattern('The quick brown fox', '%a')) -- %a is all letters
assert("2" == findpattern('it is 2003', '%d'))         -- %d finds digits
assert("l" == findpattern('UPPER lower', '%l'))         -- %l finds lowercase characters
assert("U" == findpattern('UPPER lower', '%u'))         -- %u finds uppercase characters
assert("Rl" == findpattern('UPPERlower', '%u%l'))   -- upper followed by lower
assert("234" == findpattern('123 234 345', '%d3%d')) -- digit 3 digit


assert("n" == findpattern('banana', '[xyjkn]')) -- look for one of "xyjkn"
assert("n" == findpattern('banana', '[j-q]')) -- equivalent to "jklmnopq"
assert("2" == findpattern('it is 2003', '[%dabc]'))
assert("n" == findpattern('banana', '[^ba]'))       -- we don't want a or b
assert("s" == findpattern('bananas', '[^a-n]'))     -- forget a to n
assert("2" == findpattern('it is 2003', '[^%l%s]')) -- not a lowercase or space


assert("annnnn" == findpattern('bannnnnanas', 'an*'))

assert(nil == string.find('banana', 'az+'))   -- won't be found
assert("an" == findpattern('bananas', 'an+'))

assert("annnnn" == findpattern('bannnnnanas', 'an+'), (findpattern('bannnnnanas', 'an+')))

--fail/ assert("a" == findpattern('bananas', 'az-'),  (findpattern('bananas', 'az-')))
--fail/ assert("a" == findpattern('bananas', 'an-'))
--fail/ assert("a" == findpattern('bannnnanas', 'an-'))
