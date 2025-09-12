import dotenv from 'dotenv'
import connectDB from './db/db.connect.js'
import {app} from "./app.js"

dotenv.config({path: './env'})
const port = process.env.PORT || 5000

connectDB()
.then(
app.listen(port, () => {
    console.log(`Server started on PORT ${port}`)
})
)
.catch((error)=>{
    console.error(`Error connecting to the database: ${error.message}`);
    process.exit(1)
})