import pool from "../config/db.js";
import fs from "fs";
import path from "path";

const deleteFileIfExists = (filePath) => {
    if (!filePath) return;

    const fullPath = path.resolve(filePath);

    if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
    }
};

export const uploadFacultyPhoto = async (req, res) => {
    try {
        const facultyId = req.params.id;

        const [facultyRows] = await pool.query(
            `SELECT id, photo
       FROM faculty
       WHERE id = ?
       LIMIT 1`,
            [facultyId]
        );

        if (facultyRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Faculty member not found",
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Faculty photo is required",
            });
        }

        const faculty = facultyRows[0];

        // Delete old photo
        deleteFileIfExists(faculty.photo);

        const photoPath = `/uploads/faculty/${req.file.filename}`;

        await pool.query(
            `UPDATE faculty
       SET photo = ?
       WHERE id = ?`,
            [photoPath, facultyId]
        );

        return res.json({
            success: true,
            message: "Faculty photo uploaded successfully",
            photo: photoPath,
        });
    } catch (error) {
        console.error("Faculty Photo Upload Error:", error);

        // Cleanup newly uploaded file if database update fails
        if (req.file?.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        return res.status(500).json({
            success: false,
            message: "Failed to upload faculty photo",
        });
    }
};