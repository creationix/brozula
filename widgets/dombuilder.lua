--------------------------------------
--                                  --
-- Lua domBuilder Library           --
--                                  --
-- Tim Caswell <tim@creationix.com> --
--                                  --
--------------------------------------

-- Access the DOM
local document, window, console = eval "document", eval "window", eval "console"
local isDom = func("val", "return val instanceof HTMLElement || val instanceof Text;")
-- Pre-declare our functions
local domBuilder, setAttrs, setStyle

function domBuilder(json, refs)

  local jsonType = type(json)
  -- Render strings as text nodes
  if jsonType == "string" then
    console.log("Found string, returning to text...", json)
    return document.createTextNode(json)
  end

  -- Pass through html elements and text nodes as-is
  if isDom(json) then
    console.log("Found dom, returning as-is...", json)
    return json
  end

  -- Stringify any other value types
  if not(jsonType == "table") then
    console.log("Found unknown, returning stringified as text...", json)
    return document.createTextNode(tostring(json))
  end

  -- Empty arrays are just empty fragments.
  if #json == 0 then
    console.log("found empty array, returning fragment...", json)
    return document.createDocumentFragment()
  end

  console.log("json", json)

  local node, first;
  for i, part in ipairs(json) do

    local partType = type(part)
    if partType == "table" and next(part) == 1 then partType = "array" end

    if not node and partType == "string" then
      -- Create a new dom node by parsing the tagline
      local tag = part:match("^[^.$#]+") or "div"
      node = document.createElement(tag)
      first = true
      local classes = {}
      for class in part:gmatch("%.[^.$#]+") do
        node.classList.add(class:sub(2))
      end
      local id = part:match("#[^.$#]+")
      if id then node.setAttribute("id", id:sub(2)) end
      local ref = part:match("%$[^.$#]+")
      if ref then refs[ref:sub(2)] = node end
      skip = true
    else
      if not node then
        node = document.createDocumentFragment()
      end
      -- Except the first item if it's an attribute object
      if first and partType == "table" then
        setAttrs(node, part)
      else
        node.appendChild(domBuilder(part, refs))
      end
      first = false
    end

  end
  return node
end

function setAttrs(node, attrs)
  for key, value in pairs(attrs) do
    if key == "oninit" then
      value(node)
    elseif key == "css" then
      setStyle(node.style, value)
    elseif key:sub(1, 2) == "on" then
      node.addEventListener(key:sub(3), value, false)
    else
      node.setAttribute(key, value)
    end
  end
end

function setStyle(style, attrs)
  for key, value in pairs(attrs) do
    style[key] = value
  end
end

return domBuilder
