# Brozula

Brozula is a luajit bytecode compiler that generates ES5 JavaScript.  This means
you can write webapps using lua code, compile it to bytecode, and run the lua in
either node.js or a browser environment.

# Status

This project is not done.  I just started it while I was at
Lua Workshop 2012 in DC.  Currently it can parse nearly all luajit bytecode and
execute a subset of the lua language.  This is not a lua -> bytecode compiler.
You'll need the luajit binary to do that part of the conversion.  [Performance][]
seems pretty good so far in initial benchmarks.  Only time will tell how this scales.

# Installing

Brozula can be used as either a nodejs module or a browser library.  To see how
to use in the browser, look at [index.html][]. To use in nodejs, use the
`brozula` module in npm.

## CLI

There is a command-line-interface to brozula called `brozula` that can be
installed by installing the npm module globally.

```sh
npm install -g brozula
```

I'll let the tool speak for itself since it's self documented.

There is also a [recording][] of using it in action.

```
$ brozula
Usage: brozula [OPTION...] program.lua[x]
Brozula compiles lua files to bytecode and then executes them using a JS VM
The lua -> luax (luajit bytecode) step is done by using luajit

Examples:
  brozula myprogram.lua
  brozula --print myprogram.lua
  brozula -pb myprogram.luax

 Main operation mode:

  -x, --execute          Execute the generated javascript
                         (This is the default behavior)
  -p, --print            Print the generated javascript
  --serve port           Serve the current folder over HTTP auto-compiling
                         any lua scripts requested

 Operation modifiers:

  -u, --uglify           Compress the generated javascript using uglify-js
  -b, --beautify         Beautify the generated javascript using uglify-js
  -l, --lines            Show line numbers when printing
```

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

Brozula converts this bytecode to JavaScript something like:

```js
(function(){function r(r){return null===r?["nil"]:"object"==typeof r?["table"]:[typeof r]}
function t(r){return Array.isArray(r)?r:void 0===r?[]:[r]}function e(r,t){
return Object.defineProperty(r,"__metatable",{value:t}),[r]}function n(){
console.log(Array.prototype.join.call(arguments,"  "))}function o(r,t){
return r?arguments:(a(t),void 0)}function a(r){throw r}function u(r){for(var e,n,o,a="0";;)
switch(a){case"0":if(0!==r){a="5";break}return n=1,[n];case"5":return n=this.__proto__.closure[0],
o=r-1,e=t(n(o)),n=e[0],e=void 0,n=r*n,[n];case"a":return[]}}function c(){for(var r,t="0";;)
switch(t){case"0":r=u.bind(Object.create(this)),this.closure=[r],t="2";break;case"2":return[r]}}
var i={type:r,setmetatable:e,print:n,assert:o,error:a};return c.apply(i,arguments)})();
```

## License

Brozula is licensed under the MIT license.

[luvit]: http://luvit.io/
[moonslice]: https://github.com/creationix/moonslice-luv
[luv]: https://github.com/creationix/luv
[index.html]: https://github.com/creationix/brozula/blob/master/widgets/index.html
[recording]: http://codestre.am/a0b85e026d7f63958cb5adf7c
[Performance]: http://jsperf.com/efficient-goto
