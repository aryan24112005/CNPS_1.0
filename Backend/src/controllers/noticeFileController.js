import pool from "../config/db.js";
import fs from "fs";
import path from "path";

const deleteFileIfExists = (filePath) => {
    if (!filePath) return;

    const absolutePath = path.resolve(filePath);

    if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
    }
};


// Upload / replace notice file
export const uploadNoticeFile = async (req, res, next) => {
    let newFilePath = null;

    try {
        const { id } = req.params;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Notice file is required.",
            });
        }

        newFilePath = req.file.path;

        const [rows] = await pool.query(
            `
            SELECT id, type, file_path
            FROM notices
            WHERE id = ?
            `,
            [id]
        );

        if (rows.length === 0) {
            deleteFileIfExists(newFilePath);

            return res.status(404).json({
                success: false,
                message: "Notice not found.",
            });
        }

        const notice = rows[0];

        // Only image and PDF notices can have uploaded files
        if (!["image", "pdf"].includes(notice.type)) {
            deleteFileIfExists(newFilePath);

            return res.status(400).json({
                success: false,
                message:
                    "File upload is allowed only for image or PDF notices.",
            });
        }

        const oldFilePath = notice.file_path;

        const filePath = path
            .relative(process.cwd(), req.file.path)
            .replace(/\\/g, "/");

        await pool.query(
            `
            UPDATE notices
            SET file_path = ?
            WHERE id = ?
            `,
            [filePath, id]
        );

        // Delete old file after successful DB update
        if (
            oldFilePath &&
            oldFilePath !== filePath
        ) {
            deleteFileIfExists(oldFilePath);
        }

        newFilePath = null;

        return res.status(200).json({
            success: true,
            message: "Notice file uploaded successfully.",
            file_path: filePath,
        });

    } catch (error) {
        if (newFilePath) {
            deleteFileIfExists(newFilePath);
        }

        next(error);
    }
};