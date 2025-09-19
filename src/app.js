import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express();
app.use(cors({
    // origin: process.env.WHITELISTED_DOMAINS ? process.env.WHITELISTED_DOMAINS.split(",") : "10.0.0.0/0"
    origin: "*"
}))

app.use(express.json({limit: '10kb'}))
app.use(express.urlencoded({limit: '10kb',extended: true}))
app.use(express.static("public"))
app.use(cookieParser())

import userRouter from "./routes/user.router.js"

app.use("/users",userRouter)


export {app}