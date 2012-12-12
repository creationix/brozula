local t = setmetatable({ name="test" },
	{
	   __index=function(self, k)
				  if k == "metaname" then return "fromindex" end
			   end,
	   __call=function(self, x)
				 return self.name .. " / "
					.. self.metaname
					.. " / x:"
					.. x
			  end
	})
assert(t(5) == 'test / fromindex / x:5', t(5))
