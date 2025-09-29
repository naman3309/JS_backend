import { apiErrorHandler } from "../utils/apiErrorHandler.js";
import { asyncHandler } from "../utils/async.handler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js"

export const verifyJWT = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    console.log("vjwt   ",token)
    try {
    if (!token) {
            throw new apiErrorHandler("Unauthorized request", 400)
        }
        const decodedtoken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User?.findById(decodedtoken._id).select("-password -refreshToken")

        if (!user) {
            throw new apiErrorHandler("Invalid Access Token user")
        }

        req.user = user
        next()
    }
    catch (error) {
        throw new apiErrorHandler("Invalid Access Token error", 400)
    }
})