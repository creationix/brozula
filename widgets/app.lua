local document, window, console = eval "document", eval "window", eval "console"
local domBuilder = window.domBuilder
local alert = eval 'alert'
document.body.textContent = "";

-- Create a table to store element references
local elements = {}
-- Create the template as a JSON-ML structure
local template = {
  {".profile",  -- "<div class="profile">
    {".left.column", -- <div class="left column">
      {"#date", eval 'new Date().toString()' }, -- <div id="date">Today's Date</div>
      {"#address", "Red Lick, Texas" }
    },
    -- native event handlers, not a string to be evaled.
    {".right.column", { onclick = function (evt) alert "Foo!" end},
      {"#email", "tim@creationix.com" },
      {"#bio", "Cool Guy" }
    }
  },
  {".form",
    -- $inputField means this element will be available as $.inputField when the call returns.
    {"input$inputField"},
    -- Here we're using the reference in the onclick handler
    {"button", {onclick = function () alert(elements.inputField.value) end}, "Click Me"}
  },
  {"hr", {
    -- The css key sets .style attributes
    css = {width="100px",height="50px"},
    -- The oninit key gets called as soon as this element is created
    oninit = function (hr) console.log(hr) end
  }},
  {"p", "Inspect the source (not view source) to see how clean this dom is!"}

}


-- Calling the function with the template and storage hash will return the root
-- node (or document fragment is there are multiple root nodes).
local root = domBuilder(template, elements)
document.body.appendChild(root)
