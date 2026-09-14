import pool from "../config/db.js";

// Get all active notices for public website
export const getPublicNotices = async (req, res, next) => {
    try {
        const [rows] = await pool.query(
            `
            SELECT
                id,
                title,
                slug,
                type,
                content,
                file_path,
                video_url,
                notice_date,
                sort_order
            FROM notices
            WHERE status = 'active'
            ORDER BY sort_order ASC, notice_date DESC, id DESC
            `
        );

        return res.status(200).json({
            success: true,
            notices: rows,
        });
    } catch (error) {
        next(error);
    }
};


// Get single active notice by slug
export const getPublicNoticeBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;

        const [rows] = await pool.query(
            `
            SELECT
                id,
                title,
                slug,
                type,
                content,
                file_path,
                video_url,
                notice_date,
                sort_order
            FROM notices
            WHERE slug = ?
            AND status = 'active'
            LIMIT 1
            `,
            [slug]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Notice not found.",
            });
        }

        return res.status(200).json({
            success: true,
            notice: rows[0],
        });
    } catch (error) {
        next(error);
    }
};