import {v2 as cloudinary} from "cloudinary";
import fs from "fs";

const uploadFile = async(filePath)=>{
    try{
        if(!filePath) return null

        const resp = cloudinary.uploader.uploadFile(filePath,{resource_type:"auto"})
        return resp;
    }
    catch(error){
        console.error(error)
    }
    finally{
        fs.unlinkSync(filePath)
    }
}

export {uploadFile}