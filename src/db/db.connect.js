import mongoose from "mongoose"

const connectDB = async () => {
    try {
        const connection = await mongoose.connect(`${process.env.MONGO_URL}/${process.env.DB_NAME}`)
        console.log("MongoDB connected")
    } catch (error) {
        console.error(error.message)
        process.exit(1)
    }
};

export default connectDB