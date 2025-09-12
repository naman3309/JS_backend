import express from 'express'
import dotenv from 'dotenv'
import connectDB from './db/db.connect.js'

dotenv.config({path: './env'})

const app = express()
const port = process.env.PORT || 5000

connectDB()

app.listen(port, () => {
    console.log(`Server started on PORT ${port}`)
})


