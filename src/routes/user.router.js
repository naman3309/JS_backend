import { Router } from "express";
import { refreshAccessToken, userLogin, userRegister } from "../controller/user.controller.js";
import { upload } from "../middleware/multer.middleware.js"
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
router.route("/refresh-tokens").post(refreshAccessToken)

export default router