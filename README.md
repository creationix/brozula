# Brozula

Brozula is a luajit bytecode compiler that generates ES5 JavaScript.  This means
you can write webapps using lua code, compile it to bytecode, and run the lua in
either node.js or a browser environment.

# Status

This project is not done.  I just started it last weekend while I was at
Lua Workshop 2012 in DC.  Currently it can parse nearly all luajit bytecode and
execute a subset of the lua language.  This is not a lua -> bytecode compiler.
You'll need the luajit binary to do that part of the conversion.

## End-to-end lua webapps.

One use of this is to write end-to-end lua webapps using something like [luvit][]
or [moonslice][] for the server-side half, and writing your browser-side scripts
in lua that's then executed *in* the browser using Brozula.

I plan on adding child process support to [luv][] so that a [moonslice][] framework
can be built for doing everything from a single place.

## Obfuscated JavaScript Apps.

The question comes up all the time.  How can I ship a JavaScript app without
sharing my code with the world.  JavaScript minimizers do a pretty good job at
this, but we can do better.

If you want your JavaScript code protected from prying eyes, write it in Lua!
Then you only have to share the binary bytecode publicly which is considerably
harder to make sense of and near impossible to trace back to the original code.

For example, consider the following lua module that calculates factorials:

```lua
local function fact (n)
  if n == 0 then
    return 1
  else
    return n * fact(n-1)
  end
end
return fact
```

The only code you have to store in your node-webkit or web app would be brozula
and the following bytecode:

```hd
00000000  1b 4c 4a 01 02 37 00 01  03 01 00 02 0b 09 00 00  |.LJ..7..........|
00000010  00 54 01 03 80 27 01 01  00 48 01 02 00 54 01 05  |.T...'...H...T..|
00000020  80 2b 01 00 00 15 02 01  00 3e 01 02 02 20 01 01  |.+.......>... ..|
00000030  00 48 01 02 00 47 00 01  00 00 c0 00 02 14 03 00  |.H...G..........|
00000040  01 00 01 00 03 31 00 00  00 30 00 00 80 48 00 02  |.....1...0...H..|
00000050  00 00 00                                          |...|
00000053
```

Notice that even the `fact` variable name was optimized out by luajit's compiler.
Your original lua code never has to be released to the public since the JavaScript
engines can't make any sense out of lua code anyway.

[luvit]: http://luvit.io/
[moonslice]: https://github.com/creationix/moonslice-luv
[luv]: https://github.com/creationix/luv