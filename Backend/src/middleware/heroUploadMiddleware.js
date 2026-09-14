import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.resolve("uploads/hero");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();

        const uniqueName =
            `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

        cb(null, uniqueName);
    },
});

const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "video/mp4",
    "video/webm",
];

const heroUpload = multer({
    storage,

    fileFilter: (req, file, cb) => {
        if (!allowedMimeTypes.includes(file.mimetype)) {
            return cb(
                new Error(
                    "Only JPG, PNG, WEBP, MP4 and WEBM files are allowed."
                )
            );
        }

        cb(null, true);
    },

    limits: {
        fileSize: 100 * 1024 * 1024,
        files: 20,
    },
});

export default heroUpload;