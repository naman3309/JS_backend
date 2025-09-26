import { asyncHandler } from "../utils/async.handler.js"
import { apiErrorHandler } from "../utils/apiErrorHandler.js"
import { User } from "../models/user.model.js"
import { apiResponse } from "../utils/apiResponse.js"
import { uploadFileCloudinary } from "../utils/file.upload.js"
import { jwt } from "jsonwebtoken"

const generateAccessAndRefreshToken = async (user) => {
    const accessToken = await user.generateAccessToken()
    const refreshToken = await user.generateRefreshToken()
    return accessToken, refreshToken
}

const userRegister = asyncHandler(
    async (req, res) => {
        if (req.body === undefined)
            throw new apiErrorHandler("nothing was found in the body of request", 400)
        // console.log(req.body)
        const { fullName, email, username, password } = req.body

        //validation
        if ([fullName, email, username, password].some((fields => { fields?.trim() === "" || fields?.trim() === undefined })))
            throw new apiErrorHandler("All fields are required", 400)

        const exsitedUser = await User.findOne({
            $or: [{ username }, { email }]
        })

        if (exsitedUser)
            throw new apiErrorHandler("User with same username or email already exist", 409)

        let avatarLocalPath
        if (req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0)
            avatarLocalPath = req.files?.avatar[0]?.path;

        let coverImageLocalPath
        if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0)
            coverImageLocalPath = req.files?.coverImage[0]?.path

        const avatar = await uploadFileCloudinary(avatarLocalPath)
        const coverImage = await uploadFileCloudinary(coverImageLocalPath)
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

        if (!createdUser)
            throw new apiErrorHandler("something went wrong while registering user", 500)

        // console.log(createdUser)

        return res.status(201).json(
            new apiResponse(201, createdUser, "User registered successfully")
        )
    }
)

const options = {
    httpOnly: true,
    secure: true
}

const userLogin = asyncHandler(
    async (req, res) => {
        // console.table(req.body)
        if (req.body === undefined)
            throw new apiErrorHandler("Please enter the details", 400)

        const { username, email, password } = req.body

        if (!username && !email) {
            throw new apiErrorHandler("Username or Email is required", 400)
        }

        let registeredUser = await User.findOne({
            $or: [{ username }, { email }]
        })
        // console.log(registeredUser)
        if (!registeredUser)
            throw new apiErrorHandler("User does not exist", 404)

        if (!password) throw new apiErrorHandler("Password is required", 400)

        if (!registeredUser.isPasswordCorrect(password)) {
            throw new apiErrorHandler("Either password or username is wrong", 401)
        }

        const { accessToken, refreshToken } = generateAccessAndRefreshToken(registeredUser)

        registeredUser.refreshToken = refreshToken

        registeredUser = await registeredUser.save({ validateBeforeSave: false })
        registeredUser = registeredUser.toObject()
        delete registeredUser.password
        delete registeredUser.refreshToken



        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new apiResponse(200, { user: registeredUser, accessToken, refreshToken })
            )
    }
)

const logout = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            refreshToken: undefined
        },

    },
        {
            new: true
        }
    )
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new apiResponse(200, {}, "Logged out Successfully"))

})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const localRefrershToken = req.cookie.refreshToken || req.body.refreshToken
    if (!localRefrershToken) {
        throw new apiErrorHandler("Unauthorized access", 401)
    }

try {
        const decodedToken = jwt.verify(localRefrershToken,process.env.REFRESH_TOKEN_SECRET)
    
    
        const user = await User.findById(decodedToken._id)
    
        if(!user)
            throw new apiErrorHandler("Invalid Token",401)
    
        if(localRefrershToken !== user.refreshToken)
            throw new apiErrorHandler("Token is expired or used",400)
    
        const {accessToken,refreshToken} = generateAccessAndRefreshToken(user)
    
        return res
            .status(200)
            .cookie("accessToken",accessToken)
            .cookie("refreshToken",refreshToken)
            .json(
                new apiResponse(200,{
                    accessToken,refreshToken
                },
                "Tokens refreshed"
            )
            )
} catch (error) {
    throw new apiErrorHandler(error?.message,401)    
}
})


export { userRegister, userLogin, logout, refreshAccessToken }