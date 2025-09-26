import { apiErrorHandler } from "../utils/apiErrorHandler";
import { asyncHandler } from "../utils/async.handler";
import { jwt } from "jsonwebtoken";
import {User} from "../models/user.model"

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try{
    const token = req.cookie?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    if(!token){
        throw new apiErrorHandler("Unauthorized request",400)
    }
    const decodedtoken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
    const user = await User?.findById(decodedtoken._id).select("-password -refreshToken")

    if(!user){
        throw new apiErrorHandler("Invalid Access Token")
    }

    req.user = user
    next()
    }
    catch(error){
        throw new apiErrorHandler("Invalid Access Token", 400)
    }
})