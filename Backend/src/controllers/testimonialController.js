import pool from "../config/db.js";
import fs from "fs";
import path from "path";

/*
|--------------------------------------------------------------------------
| Get All Testimonials - Admin
|--------------------------------------------------------------------------
*/
export const getTestimonials = async (req, res, next) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                id,
                user_id,
                name,
                role,
                avatar,
                rating,
                review,
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
                user_id,
                name,
                role,
                avatar,
                rating,
                review,
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
            role,
            avatar,
            rating,
            review,
            status,
            sort_order,
            user_id,
        } = req.body;

        // Required fields
        if (!name || !rating || !review) {
            return res.status(400).json({
                success: false,
                message: "Name, rating and review are required.",
            });
        }

        // Validate rating
        const numericRating = Number(rating);

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

        // Validate status
        const allowedStatuses = [
            "pending",
            "approved",
            "rejected",
        ];

        const testimonialStatus = status || "pending";

        if (!allowedStatuses.includes(testimonialStatus)) {
            return res.status(400).json({
                success: false,
                message:
                    "Status must be pending, approved or rejected.",
            });
        }

        const [result] = await pool.query(
            `
            INSERT INTO testimonials
            (
                user_id,
                name,
                role,
                avatar,
                rating,
                review,
                status,
                sort_order
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                user_id || null,
                name.trim(),
                role?.trim() || null,
                avatar?.trim() || null,
                numericRating,
                review.trim(),
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
            role,
            avatar,
            rating,
            review,
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
        if (!name || !rating || !review) {
            return res.status(400).json({
                success: false,
                message: "Name, rating and review are required.",
            });
        }

        // Validate rating
        const numericRating = Number(rating);

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

        // Validate status
        const allowedStatuses = [
            "pending",
            "approved",
            "rejected",
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message:
                    "Status must be pending, approved or rejected.",
            });
        }

        await pool.query(
            `
            UPDATE testimonials
            SET
                name = ?,
                role = ?,
                avatar = ?,
                rating = ?,
                review = ?,
                status = ?,
                sort_order = ?
            WHERE id = ?
            `,
            [
                name.trim(),
                role?.trim() || null,
                avatar?.trim() || null,
                numericRating,
                review.trim(),
                status,
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

        // Get avatar before deleting the record
        const [rows] = await pool.query(
            `
            SELECT avatar
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

        const avatar = rows[0].avatar;

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

        // Delete uploaded avatar only
        if (
            avatar &&
            avatar.startsWith("uploads/testimonials/")
        ) {
            const absolutePath = path.resolve(
                process.cwd(),
                avatar
            );

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