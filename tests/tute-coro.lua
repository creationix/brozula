local read = function ( )
    return coroutine.yield ( )
end

local get_blah = function ( )
    print ( "PRE 1" )
    print ( read ( ) )
    print ( "PRE 2" )
    print ( read ( ) )
    print ( "PRE 3" )
    print ( read ( ) )
end

-- Create coroutine
local get_blah_co = coroutine.create ( get_blah )

-- Basic dispatcher
while coroutine.status ( get_blah_co ) == "suspended" do
    local ok , err_msg = coroutine.resume ( get_blah_co )
    if not ok then
        print("AN ERROR!",err_msg)
        break
    end
end
