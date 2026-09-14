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

export const uploadCourseFiles = async (req, res) => {
    try {
        const courseId = req.params.id;

        // Check course exists
        const [courses] = await pool.query(
            "SELECT id, image, fee_pdf, timetable_pdf FROM courses WHERE id = ? LIMIT 1",
            [courseId]
        );

        if (courses.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        const course = courses[0];

        if (!req.files) {
            return res.status(400).json({
                success: false,
                message: "No files uploaded",
            });
        }

        const updateFields = [];
        const updateValues = [];

        // Course Image
        if (req.files.image?.[0]) {
            const file = req.files.image[0];

            // Delete old image
            deleteFileIfExists(course.image);

            updateFields.push("image = ?");
            updateValues.push(`/uploads/courses/${file.filename}`);
        }

        // Fee PDF
        if (req.files.fee_pdf?.[0]) {
            const file = req.files.fee_pdf[0];

            if (file.mimetype !== "application/pdf") {
                return res.status(400).json({
                    success: false,
                    message: "Fee structure must be a PDF file",
                });
            }

            deleteFileIfExists(course.fee_pdf);

            updateFields.push("fee_pdf = ?");
            updateValues.push(`/uploads/courses/${file.filename}`);
        }

        // Timetable PDF
        if (req.files.timetable_pdf?.[0]) {
            const file = req.files.timetable_pdf[0];

            if (file.mimetype !== "application/pdf") {
                return res.status(400).json({
                    success: false,
                    message: "Timetable must be a PDF file",
                });
            }

            deleteFileIfExists(course.timetable_pdf);

            updateFields.push("timetable_pdf = ?");
            updateValues.push(`/uploads/courses/${file.filename}`);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid files received",
            });
        }

        updateValues.push(courseId);

        await pool.query(
            `UPDATE courses
       SET ${updateFields.join(", ")}
       WHERE id = ?`,
            updateValues
        );

        const [updatedCourses] = await pool.query(
            `SELECT id, title, image, fee_pdf, timetable_pdf
       FROM courses
       WHERE id = ?
       LIMIT 1`,
            [courseId]
        );

        return res.json({
            success: true,
            message: "Course files uploaded successfully",
            course: updatedCourses[0],
        });
    } catch (error) {
        console.error("Course File Upload Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to upload course files",
        });
    }

    
};


export const uploadCourseBookImage = async (req, res) => {
    try {
        const { id, bookId } = req.params;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Book image is required.",
            });
        }

        const imagePath = `/uploads/courses/${req.file.filename}`;

        const [result] = await pool.query(
            `UPDATE course_books
             SET image = ?
             WHERE id = ? AND course_id = ?`,
            [imagePath, bookId, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Book not found.",
            });
        }

        return res.json({
            success: true,
            message: "Book image uploaded successfully.",
            image: imagePath,
        });
    } catch (error) {
        console.error("Upload Course Book Image Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to upload book image.",
        });
    }
};