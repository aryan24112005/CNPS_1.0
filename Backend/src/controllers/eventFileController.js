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

export const uploadEventImage = async (req, res, next) => {
    let newFilePath = null;

    try {
        const { id } = req.params;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Event image is required.",
            });
        }

        newFilePath = req.file.path;

        // Check event exists
        const [rows] = await pool.query(
            "SELECT id, image FROM events WHERE id = ?",
            [id]
        );

        if (rows.length === 0) {
            deleteFileIfExists(newFilePath);

            return res.status(404).json({
                success: false,
                message: "Event not found.",
            });
        }

        const oldImage = rows[0].image;

        // Convert absolute path to DB-friendly relative path
        const imagePath = path
            .relative(process.cwd(), req.file.path)
            .replace(/\\/g, "/");

        // Save image path in events table
        const [updateResult] = await pool.query(
            "UPDATE events SET image = ? WHERE id = ?",
            [imagePath, id]
        );

        console.log("===== EVENT IMAGE DEBUG =====");
        console.log("Event ID:", id);
        console.log("Image Path:", imagePath);
        console.log("Affected Rows:", updateResult.affectedRows);
        console.log("Changed Rows:", updateResult.changedRows);

        // Verify immediately from the same DB connection
        const [verifyRows] = await pool.query(
            `SELECT DATABASE() AS database_name, id, title, image
     FROM events
     WHERE id = ?`,
            [id]
        );

        console.log("DB VERIFY:", verifyRows);
        console.log("============================");

        // Delete old image after successful DB update
        if (oldImage && oldImage !== imagePath) {
            deleteFileIfExists(oldImage);
        }

        newFilePath = null;

        return res.status(200).json({
            success: true,
            message: "Event image uploaded successfully.",
            image: imagePath,
        });

    } catch (error) {
        console.error("Upload Event Image Error:", error);

        // Delete newly uploaded file if DB update fails
        if (newFilePath) {
            deleteFileIfExists(newFilePath);
        }

        next(error);
    }
};