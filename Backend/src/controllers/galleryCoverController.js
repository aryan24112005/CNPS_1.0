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

export const uploadGalleryCover = async (req, res, next) => {
    let newFilePath = null;

    try {
        const { id } = req.params;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Gallery cover image is required.",
            });
        }

        newFilePath = req.file.path;

        // Check album exists and get old cover
        const [albums] = await pool.query(
            "SELECT id, cover_image FROM gallery_albums WHERE id = ?",
            [id]
        );

        if (albums.length === 0) {
            deleteFileIfExists(newFilePath);

            return res.status(404).json({
                success: false,
                message: "Gallery album not found.",
            });
        }

        const oldCoverImage = albums[0].cover_image;

        // Convert Windows path to database-friendly relative path
        const coverImagePath = path
            .relative(process.cwd(), req.file.path)
            .replace(/\\/g, "/");

        // Update database
        await pool.query(
            `
            UPDATE gallery_albums
            SET cover_image = ?
            WHERE id = ?
            `,
            [coverImagePath, id]
        );

        // Delete old cover after successful DB update
        if (
            oldCoverImage &&
            oldCoverImage !== coverImagePath
        ) {
            deleteFileIfExists(oldCoverImage);
        }

        newFilePath = null;

        return res.status(200).json({
            success: true,
            message: "Gallery cover image uploaded successfully.",
            cover_image: coverImagePath,
        });

    } catch (error) {

        // Cleanup newly uploaded file if DB update fails
        if (newFilePath) {
            deleteFileIfExists(newFilePath);
        }

        next(error);
    }
};