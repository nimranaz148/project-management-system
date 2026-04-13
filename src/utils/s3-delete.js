import dotenv from "dotenv"
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import s3_Client from "../config/s3.js";

dotenv.config();

export const deleteFromS3 = async (fileUrl) => {
    try {
        const url = new URL(fileUrl);
        const key = decodeURIComponent(url.pathname.slice(1)); // remove leading '/' from pathname

         // remove leading slash
    if (key.startsWith("/")) key = key.slice(1);

    console.log("🧾 Deleting S3 Key:", key)
    
        await s3_Client.send(new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key
    }))

        console.log(`✅ File deleted from S3: ${key}`)
        
    } catch (error) {
        console.error(`❌ Error deleting file from S3: ${error.message}`);
        throw error;
    }

}