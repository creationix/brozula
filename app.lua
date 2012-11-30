local p = require('utils').prettyPrint
local await = require('fiber').await

local app = require('moonslice')()
app.log = true

-- A custom endpoint
app:get("^/greet$", function (req, res)
  res(200, {}, "Hello World\n")
end)

-- A websocket echo endpoint
app:websocket("^/socket$", function (headers, socket)
  repeat
    local message = await(socket.read())
    if message then
      socket.write("Hello " .. message)()
    end
  until not message
  socket.write()()
end)

-- Serve a folder as static resources
app:static("public", {index="index.html"})


return app
