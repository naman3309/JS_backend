import {v2 as cloudinary} from "cloudinary";
import fs from "fs";

const uploadFileCloudinary = async(filePath)=>{
    try{
        if(!filePath) return null

        const resp = await cloudinary.uploader.upload(filePath,{resource_type:"auto"})
        // console.log("resp : "+resp)
        return resp;
    }
    catch(error){
        console.error(error)
    }
    finally{
        fs.unlinkSync(filePath)
    }
}

export {uploadFileCloudinary}