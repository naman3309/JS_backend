import { asyncHandler } from "../utils/async.handler.js"
import { apiErrorHandler } from "../utils/apiErrorHandler.js"
import { User } from "../models/user.model.js"
import { apiResponse } from "../utils/apiResponse.js"
import { uploadFileCloudinary } from "../utils/file.upload.js"

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

/*
1.  get user details from req  
    1.1 validate user details
2.  check if exists
3.  res for if exist 
4.  store the details in db 

*/


const userLogin = asyncHandler(
    async (req, res) => {
        // console.table(req.body)
        if (req.body === undefined)
            throw new apiErrorHandler("Please enter the details", 400)
        
        const { username, email, password } = req.body  
        let registeredUser = await User.findOne({
            $or: [{ username }, { email }]
        })
        // console.log(registeredUser)
        if(!registeredUser)
            throw new apiErrorHandler("User does not exist",404)
        
        if(!registeredUser.isPasswordCorrect(password)){
            throw new apiErrorHandler("Either password or username is wrong",401)
        }

        const accessToken  = registeredUser.generateAccessToken()
        const refreshToken  = registeredUser.generateRefreshToken()

        registeredUser.refreshToken = refreshToken

        registeredUser = await registeredUser.save({validateBeforeSave: false})
        registeredUser = registeredUser.toObject()
        delete registeredUser.password
        delete registeredUser.refreshToken

        const options = {
            httpOnly: true,
            secure: true
        }

        return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new apiResponse(200,{user:registeredUser , accessToken , refreshToken})
        )
    }
)

export { userRegister, userLogin }