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

// Upload multiple images to an event
export const uploadEventGalleryImages = async (req, res, next) => {
    const uploadedFiles = [];

    try {
        const { id } = req.params;

        // Check event exists
        const [events] = await pool.query(
            "SELECT id FROM events WHERE id = ?",
            [id]
        );

        if (events.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Event not found.",
            });
        }

        // Check files
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one event gallery image is required.",
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
            INSERT INTO event_images
            (
                event_id,
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
            message: `${req.files.length} event gallery image(s) uploaded successfully.`,
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


// Update event gallery image caption and sort order
export const updateEventGalleryImage = async (req, res, next) => {
    try {
        const { imageId } = req.params;
        const { caption, sort_order } = req.body;

        // Check image exists
        const [rows] = await pool.query(
            "SELECT id FROM event_images WHERE id = ?",
            [imageId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Event gallery image not found.",
            });
        }

        await pool.query(
            `
            UPDATE event_images
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
            message: "Event gallery image updated successfully.",
        });
    } catch (error) {
        next(error);
    }
};


// Delete a single event gallery image
export const deleteEventGalleryImage = async (req, res, next) => {
    try {
        const { imageId } = req.params;

        // Get image path
        const [rows] = await pool.query(
            `
            SELECT id, image
            FROM event_images
            WHERE id = ?
            `,
            [imageId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Event gallery image not found.",
            });
        }

        const imagePath = rows[0].image;

        // Delete database record
        await pool.query(
            "DELETE FROM event_images WHERE id = ?",
            [imageId]
        );

        // Delete physical file
        deleteFileIfExists(imagePath);

        return res.status(200).json({
            success: true,
            message: "Event gallery image deleted successfully.",
        });
    } catch (error) {
        next(error);
    }
};