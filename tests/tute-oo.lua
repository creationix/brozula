local mt = {
    __index = function ( ob , k )
        if ob.parent then
            return ob.parent [ k ]
        end
    end ;
}

local root = setmetatable ( {
        parent = nil
    } , mt )

function root:say(phrase)
    print ( tostring(self) .. " says " .. phrase)
end

function root:derive ( newname )
    return setmetatable ( {
            parent = self ;
        } , mt )
end

root:say ( "I am root" )

local foo = root:derive ( )
foo:say ( "I am foo" )
function foo:say ( phrase )
    print ( tostring(self) .. " annouces " .. phrase)
end
foo:say ( "I am foo" )
root:say ( "I am root" )
