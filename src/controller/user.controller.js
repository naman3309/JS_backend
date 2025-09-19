import { asyncHandler } from "../utils/async.handler.js"
import { apiErrorHandler } from "../utils/apiErrorHandler.js"
import { User } from "../models/user.model.js"
import { apiResponse } from "../utils/apiResponse.js"
import { uploadFileClouianry } from "../utils/file.upload.js"

const userRegister = asyncHandler(
    async (req, res) => {
        const { fullName, email, username, password } = req.body

        //validation
        if ([fullName, email, username, password].some((fields => fields?.trim() === "")))
            throw new apiErrorHandler("All fields are required", 400)
        // if (fullName === "") throw new apiErrorHandler("Fullname is required", 400)
        // if (email === "") throw new apiErrorHandler("Email is required", 400)
        // if (username === "") throw new apiErrorHandler("Username is required", 400)
        // if (password === "") throw new apiErrorHandler("Password is required", 400)
        const exsitedUser = User.findOne({
            $or: [{ username }, { email }]
        })

        if (exsitedUser)
            throw new apiErrorHandler("User with same username or email already exist", 409)

        const avatarLocalPath = req.files?.avatar[0]?.path;
        const CoverImageLocalPath = req.files?.coverImage[0]?.path;

        const avatar = await uploadFileClouianry(avatarLocalPath)
        const coverImage = await uploadFileClouianry(coverImageLocalPath)

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

        return res.status(201).json(
            new apiResponse(200,createdUser,"User registered successfully")
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