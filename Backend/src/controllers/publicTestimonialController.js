import pool from "../config/db.js";

/*
|--------------------------------------------------------------------------
| Get Approved Testimonials - Public
|--------------------------------------------------------------------------
*/
export const getPublicTestimonials = async (req, res, next) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                id,
                name,
                designation,
                image,
                rating,
                message,
                created_at
            FROM testimonials
            WHERE status = 'active'
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
| Get Single Approved Testimonial - Public
|--------------------------------------------------------------------------
*/
export const getPublicTestimonialById = async (req, res, next) => {
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
                created_at
            FROM testimonials
            WHERE id = ?
              AND status = 'active'
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