import {asyncHandler} from "../utils/async.handler.js"
import {apiErrorHandler} from "../utils/apiErrorHandler.js"

const userRegister = asyncHandler(
    async (req,res)=>{
        const {fullName,email,username,password} = req.body
        
        //validation
        if(fullName==="") throw new apiErrorHandler("Fullname is required",400)
        if(email==="") throw new apiErrorHandler("Email is required",400)
        if(username==="") throw new apiErrorHandler("Username is required",400)
        if(password==="") throw new apiErrorHandler("Password is required",400)
    }
)

/*
1.  get user details from req  
    1.1 validate user details
2.  check if exists
3.  res for if exist 
4.  store the details in db 

*/
export {userRegister}