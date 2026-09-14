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

// Upload multiple images to an album
export const uploadGalleryImages = async (req, res, next) => {
    const uploadedFiles = [];

    try {
        const { id } = req.params;

        // Check album exists
        const [albums] = await pool.query(
            "SELECT id FROM gallery_albums WHERE id = ?",
            [id]
        );

        if (albums.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Gallery album not found.",
            });
        }

        // Check files
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one gallery image is required.",
            });
        }

        uploadedFiles.push(...req.files);

        const values = req.files.map((file) => {
            const imagePath = path
                .relative(process.cwd(), file.path)
                .replace(/\\/g, "/");

            return [
                id,
                imagePath,
                null,
                0,
            ];
        });

        // Insert all images
        await pool.query(
            `
            INSERT INTO gallery_images
            (
                album_id,
                image,
                caption,
                sort_order
            )
            VALUES ?
            `,
            [values]
        );

        return res.status(201).json({
            success: true,
            message: `${req.files.length} gallery image(s) uploaded successfully.`,
            images: values.map((item) => item[1]),
        });

    } catch (error) {

        // Cleanup uploaded files if database operation fails
        for (const file of uploadedFiles) {
            deleteFileIfExists(file.path);
        }

        next(error);
    }
};


// Update gallery image caption and sort order
export const updateGalleryImage = async (req, res, next) => {
    try {
        const { imageId } = req.params;
        const { caption, sort_order } = req.body;

        // Check image exists
        const [rows] = await pool.query(
            "SELECT id FROM gallery_images WHERE id = ?",
            [imageId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Gallery image not found.",
            });
        }

        await pool.query(
            `
            UPDATE gallery_images
            SET
                caption = ?,
                sort_order = ?
            WHERE id = ?
            `,
            [
                caption ?? null,
                sort_order ?? 0,
                imageId,
            ]
        );

        return res.status(200).json({
            success: true,
            message: "Gallery image updated successfully.",
        });

    } catch (error) {
        next(error);
    }
};


// Delete a single gallery image
export const deleteGalleryImage = async (req, res, next) => {
    try {
        const { imageId } = req.params;

        // Get image path
        const [rows] = await pool.query(
            `
            SELECT id, image
            FROM gallery_images
            WHERE id = ?
            `,
            [imageId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Gallery image not found.",
            });
        }

        const imagePath = rows[0].image;

        // Delete database record
        await pool.query(
            "DELETE FROM gallery_images WHERE id = ?",
            [imageId]
        );

        // Delete physical file
        deleteFileIfExists(imagePath);

        return res.status(200).json({
            success: true,
            message: "Gallery image deleted successfully.",
        });

    } catch (error) {
        next(error);
    }
};