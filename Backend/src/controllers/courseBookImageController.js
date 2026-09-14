import pool from "../config/db.js";
import fs from "fs";
import path from "path";

const deleteFileIfExists = (filePath) => {
    if (!filePath) return;

    const relativePath = filePath.replace(/^\/+/, "");
    const fullPath = path.join(process.cwd(), relativePath);

    if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
    }
};

export const uploadCourseBookImage = async (req, res) => {
    try {
        const { courseId, bookId } = req.params;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No book image uploaded",
            });
        }

        // Check book belongs to this course
        const [books] = await pool.query(
            `SELECT id, image
             FROM course_books
             WHERE id = ? AND course_id = ?
             LIMIT 1`,
            [bookId, courseId]
        );

        if (books.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Book not found for this course",
            });
        }

        const book = books[0];

        // Delete previous image
        deleteFileIfExists(book.image);

        const imagePath = `/uploads/courses/${req.file.filename}`;

        await pool.query(
            `UPDATE course_books
             SET image = ?
             WHERE id = ? AND course_id = ?`,
            [imagePath, bookId, courseId]
        );

        const [updatedBooks] = await pool.query(
            `SELECT id, book_name, publisher, image, sort_order
             FROM course_books
             WHERE id = ?
             LIMIT 1`,
            [bookId]
        );

        return res.json({
            success: true,
            message: "Book image uploaded successfully",
            book: updatedBooks[0],
        });
    } catch (error) {
        console.error("Upload Course Book Image Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to upload book image",
        });
    }
};