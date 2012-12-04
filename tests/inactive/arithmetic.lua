local _ = 0; -- To prevent constant folding
assert((_ + 0) + 0 == 0)
assert((_ + 0) + 1 == 1)
assert((_ + 1) + 0 == 1)
assert((_ + 1) + 1 == 2)

assert((_ + 0) - 0 == 0)
assert((_ + 0) - 1 == -1)
assert((_ + 0) - 0 == 0)
assert((_ + 1) - 1 == 0)

assert((_ + 0) * 0 == 0)
assert((_ + 0) * 1 == 0)
assert((_ + 1) * 0 == 0)
assert((_ + 1) * 1 == 1)

assert((0 / 1) == 0)
assert((1 / 1) == 1)
assert((1 / 2) == 0.5)
assert((2 / 1) == 2)

