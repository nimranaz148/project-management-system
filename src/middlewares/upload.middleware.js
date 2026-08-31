import dotenv from "dotenv";
import multer from "multer";
import multerS3 from "multer-s3";
import s3_Client  from "../config/s3.js";


dotenv.config();


const allowedMimeTypes = [
    "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/svg+xml", "image/bmp",
    "application/pdf", "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/zip", "application/x-zip-compressed", "application/x-rar-compressed", "application/octet-stream", "application/json",
    "text/plain", "text/csv", "text/markdown", "text/html"
];



export const uploadAvatar = multer({
    storage: multerS3({
        s3: s3_Client,
        bucket: process.env.AWS_S3_BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: (req, file, cb) => {
            const taskId = req.params?.taskId || "new"
            const timestamp = Date.now();
            const filename = `tasks/${taskId}/${timestamp}-${file.originalname}`;
            cb(null, filename);
        }
    
    }),
    fileFilter: (req, file, cb) => {
        // only avatar image files are allowed
        const imageTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
        if (imageTypes.includes(file.mimetype) || file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Invalid file type. Only image files are allowed."));

        }

    },


    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB file size limit
        files: 10 // limit to 10 files upload once
    }
})




// ----------------for task attachments----------------
export const uploadTaskAttachments = multer({
    storage: multerS3({
        s3: s3_Client,
        bucket: process.env.AWS_S3_BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: (req, file, cb) => {
            const taskId = req.params?.taskId || "new"
            const timestamp = Date.now();
            const filename = `tasks/${taskId}/${timestamp}-${file.originalname}`;
            cb(null, filename);
        }
    
    }),
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype.startsWith("image/") ||
            file.mimetype.startsWith("text/") ||
            allowedMimeTypes.includes(file.mimetype.toLowerCase()) ||
            file.originalname.match(/\.(jpg|jpeg|png|gif|webp|svg|pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|txt|csv|json|md)$/i)
        ) {
            cb(null, true);
        } else {
            cb(null, true);
        }
    },


    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB file size limit
        files: 10 // limit to 10 files upload once
    }
})




// ----------------for note attachments----------------
export const uploadNoteAttachments = multer({
    storage: multerS3({
        s3: s3_Client,
        bucket: process.env.AWS_S3_BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: (req, file, cb) => {
            const noteId = req.params?.noteId || "new"
            const timestamp = Date.now();
            const filename = `notes/${noteId}/${timestamp}-${file.originalname}`;
            cb(null, filename);
        }
    
    }),
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype.startsWith("image/") ||
            file.mimetype.startsWith("text/") ||
            allowedMimeTypes.includes(file.mimetype.toLowerCase()) ||
            file.originalname.match(/\.(jpg|jpeg|png|gif|webp|svg|pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|txt|csv|json|md)$/i)
        ) {
            cb(null, true);
        } else {
            cb(null, true);
        }
    }
})

