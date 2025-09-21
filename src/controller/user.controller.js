import { asyncHandler } from "../utils/async.handler.js"
import { apiErrorHandler } from "../utils/apiErrorHandler.js"
import { User } from "../models/user.model.js"
import { apiResponse } from "../utils/apiResponse.js"
import { uploadFileCloudinary } from "../utils/file.upload.js"

const userRegister = asyncHandler(
    async (req, res) => {
        if(req.body === undefined)
            throw new apiErrorHandler("nothing was found in the body of request",400)
        console.log(req.body)
        const { fullName, email, username, password } = req.body

        //validation
        if ([fullName, email, username, password].some((fields => {fields?.trim() === "" || fields?.trim() === undefined})))
            throw new apiErrorHandler("All fields are required", 400)

        const exsitedUser = await User.findOne({
            $or: [{ username }, { email }]
        })

        if (exsitedUser)
            throw new apiErrorHandler("User with same username or email already exist", 409)

        const avatarLocalPath = req.files?.avatar[0]?.path;
        const coverImageLocalPath = req.files?.coverImage[0]?.path;

        const avatar = await uploadFileCloudinary(avatarLocalPath)
        const coverImage = await uploadFileCloudinary(coverImageLocalPath)
        console.log(avatar,coverImage)
        if (!avatar) {
            throw new apiErrorHandler("Avatar is required but not provided", 400)
        }

        const user = await User.create({
            fullName: fullName,
            avatarUrl: avatar.url,
            username: username,
            email: email,
            coverImageUrl: coverImage?.url || "",
            password: password
        })

        const createdUser = await User.findById(user._id).select("-password -refreshToken")

        if(!createdUser)
            throw new apiErrorHandler("something went wrong while registering user",500)
        
        console.log(createdUser)

        return res.status(201).json(
            new apiResponse(201,createdUser,"User registered successfully")
        )
    }
)

/*
1.  get user details from req  
    1.1 validate user details
2.  check if exists
3.  res for if exist 
4.  store the details in db 

*/
export { userRegister }