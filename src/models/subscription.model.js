import mongoose,{Schema} from "mongoose";

const subscriptionSchema = new Schema({
    subscribers:{
        type:mongoose.Schema.ObjectId,
        ref:"User"
    },
    channel:{
        type:mongoose.Schema.ObjectId,
        ref:"User"
    }
},{timestamps: true})

export const Subscription = mongoose.model("Subscription",subscriptionSchema)