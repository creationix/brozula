#!/usr/local/bin/luajit
-- Put the moonslice folder in our search path
package.path = package.path .. ";../moonslice-luv/?.lua"
package.cpath = package.cpath .. ";../moonslice-luv/?.so"

-- Get the ip and port from the environment
local host = os.getenv("IP") or "0.0.0.0"
local port = os.getenv("PORT") or 8080

local p = (...)
-- Create our web app stack with autoheaders and logging added in
local app = require('app')
app = require('autoheaders')(app)

-- Create an http webserver from the app
local socketHandler = require('web').socketHandler
local createServer = require('uv').createServer
local server = createServer(host, port, socketHandler(app))

-- Print the addresses where the server can be found
for name, data in pairs(require('luv').interface_addresses()) do
  for i, address in ipairs(data) do
    if address.family == "IPv4" then
      if address.internal then
        print("Internally listening at http://" .. address.address .. ":" .. port .. "/")
      else
        print("Externally listening at http://" .. address.address .. ":" .. port .. "/")
      end
    end
  end
end
-- Make a little event loop to consume ticks and uv events
local run_once = require('luv').run_once
local flushTickQueue = require('tick').flushTickQueue
repeat
  flushTickQueue()
until run_once() == 0
