import pool from "../config/db.js";
import fs from "fs";
import path from "path";

const deleteFileIfExists = (relativePath) => {
    if (!relativePath) return;

    const absolutePath = path.resolve(process.cwd(), relativePath);

    if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
    }
};

export const uploadTestimonialAvatar = async (req, res, next) => {
    let uploadedFilePath = null;

    try {
        const { id } = req.params;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please select an image to upload.",
            });
        }

        uploadedFilePath = path
            .relative(process.cwd(), req.file.path)
            .replace(/\\/g, "/");

        const [rows] = await pool.query(
            `
            SELECT id, image
            FROM testimonials
            WHERE id = ?
            LIMIT 1
            `,
            [id]
        );

        if (rows.length === 0) {
            deleteFileIfExists(uploadedFilePath);

            return res.status(404).json({
                success: false,
                message: "Testimonial not found.",
            });
        }

        const oldAvatar = rows[0].image;
        const newAvatar = uploadedFilePath;

        await pool.query(
            `
            UPDATE testimonials
            SET image = ?
            WHERE id = ?
            `,
            [newAvatar, id]
        );

        if (
            oldAvatar &&
            oldAvatar.startsWith("uploads/testimonials/")
        ) {
            deleteFileIfExists(oldAvatar);
        }

        uploadedFilePath = null;

        return res.status(200).json({
            success: true,
            message: "Testimonial avatar uploaded successfully.",
            avatar: newAvatar,
        });
    } catch (error) {
        if (uploadedFilePath) {
            deleteFileIfExists(uploadedFilePath);
        }

        next(error);
    }
};