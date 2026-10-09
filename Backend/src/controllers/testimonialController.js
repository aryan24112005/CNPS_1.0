import pool from "../config/db.js";
import fs from "fs";
import path from "path";

/*
|--------------------------------------------------------------------------
| Get All Testimonials - Admin
|--------------------------------------------------------------------------
| Real schema: id, name, designation, image, rating, message,
|              status (active|inactive), sort_order, created_at, updated_at
*/
export const getTestimonials = async (req, res, next) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                id,
                name,
                designation,
                image,
                rating,
                message,
                status,
                sort_order,
                created_at,
                updated_at
            FROM testimonials
            ORDER BY sort_order ASC, created_at DESC, id DESC
        `);

        return res.status(200).json({
            success: true,
            testimonials: rows,
        });
    } catch (error) {
        next(error);
    }
};


/*
|--------------------------------------------------------------------------
| Get Single Testimonial - Admin
|--------------------------------------------------------------------------
*/
export const getTestimonialById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [rows] = await pool.query(
            `
            SELECT
                id,
                name,
                designation,
                image,
                rating,
                message,
                status,
                sort_order,
                created_at,
                updated_at
            FROM testimonials
            WHERE id = ?
            LIMIT 1
            `,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Testimonial not found.",
            });
        }

        return res.status(200).json({
            success: true,
            testimonial: rows[0],
        });
    } catch (error) {
        next(error);
    }
};


/*
|--------------------------------------------------------------------------
| Create Testimonial - Admin
|--------------------------------------------------------------------------
*/
export const createTestimonial = async (req, res, next) => {
    try {
        const {
            name,
            designation,
            rating,
            message,
            status,
            sort_order,
        } = req.body;

        // Required fields
        if (!name || !message) {
            return res.status(400).json({
                success: false,
                message: "Name and message are required.",
            });
        }

        // Validate rating if provided
        let numericRating = null;
        if (rating !== undefined && rating !== null && rating !== "") {
            numericRating = Number(rating);
            if (
                !Number.isInteger(numericRating) ||
                numericRating < 1 ||
                numericRating > 5
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Rating must be an integer between 1 and 5.",
                });
            }
        }

        // Validate status
        const allowedStatuses = ["active", "inactive"];
        const testimonialStatus = status || "active";

        if (!allowedStatuses.includes(testimonialStatus)) {
            return res.status(400).json({
                success: false,
                message: "Status must be active or inactive.",
            });
        }

        const [result] = await pool.query(
            `
            INSERT INTO testimonials
            (name, designation, rating, message, status, sort_order)
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
                name.trim(),
                designation?.trim() || null,
                numericRating,
                message.trim(),
                testimonialStatus,
                Number(sort_order) || 0,
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Testimonial created successfully.",
            testimonialId: result.insertId,
        });
    } catch (error) {
        next(error);
    }
};


/*
|--------------------------------------------------------------------------
| Update Testimonial - Admin
|--------------------------------------------------------------------------
*/
export const updateTestimonial = async (req, res, next) => {
    try {
        const { id } = req.params;

        const {
            name,
            designation,
            rating,
            message,
            status,
            sort_order,
        } = req.body;

        // Check testimonial exists
        const [existing] = await pool.query(
            "SELECT id FROM testimonials WHERE id = ? LIMIT 1",
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Testimonial not found.",
            });
        }

        // Required fields
        if (!name || !message) {
            return res.status(400).json({
                success: false,
                message: "Name and message are required.",
            });
        }

        // Validate rating if provided
        let numericRating = null;
        if (rating !== undefined && rating !== null && rating !== "") {
            numericRating = Number(rating);
            if (
                !Number.isInteger(numericRating) ||
                numericRating < 1 ||
                numericRating > 5
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Rating must be an integer between 1 and 5.",
                });
            }
        }

        // Validate status
        const allowedStatuses = ["active", "inactive"];
        if (status && !allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be active or inactive.",
            });
        }

        await pool.query(
            `
            UPDATE testimonials
            SET
                name = ?,
                designation = ?,
                rating = ?,
                message = ?,
                status = ?,
                sort_order = ?
            WHERE id = ?
            `,
            [
                name.trim(),
                designation?.trim() || null,
                numericRating,
                message.trim(),
                status || "active",
                Number(sort_order) || 0,
                id,
            ]
        );

        return res.status(200).json({
            success: true,
            message: "Testimonial updated successfully.",
        });
    } catch (error) {
        next(error);
    }
};


/*
|--------------------------------------------------------------------------
| Delete Testimonial - Admin
|--------------------------------------------------------------------------
*/
export const deleteTestimonial = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Get image path before deleting the record
        const [rows] = await pool.query(
            `SELECT image FROM testimonials WHERE id = ? LIMIT 1`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Testimonial not found.",
            });
        }

        const image = rows[0].image;

        // Delete database record
        const [result] = await pool.query(
            "DELETE FROM testimonials WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Testimonial not found.",
            });
        }

        // Delete uploaded image file
        if (image && image.startsWith("uploads/testimonials/")) {
            const absolutePath = path.resolve(process.cwd(), image);
            if (fs.existsSync(absolutePath)) {
                fs.unlinkSync(absolutePath);
            }
        }

        return res.status(200).json({
            success: true,
            message: "Testimonial deleted successfully.",
        });
    } catch (error) {
        next(error);
    }
};
