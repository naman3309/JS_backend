import { Router } from "express";
import { changeAvatarImage, changeDetails, changePassword, getProfile, getWatchHistory, logout, refreshAccessToken, userLogin, userRegister } from "../controller/user.controller.js";
import { upload } from "../middleware/multer.middleware.js"
import { verifyJWT } from "../middleware/auth.middleware.js";
const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ])
    , userRegister)

router.route("/login").post(userLogin)
router.route("/logout").post(verifyJWT, logout)
router.route("/refresh-tokens").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, changePassword)
router.route("/change-avatar").post(verifyJWT,upload.single("changeAvatar"), changeAvatarImage)
router.route("/update-profile").patch(verifyJWT,changeDetails)
router.route("/c/:username").get(verifyJWT,getProfile)
router.route("/history").get(verifyJWT,getWatchHistory)

export default router