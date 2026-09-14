import pool from "../config/db.js";

// GET Homepage Content
export const getHomepage = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT
        id,
        hero_title,
        hero_subtitle,
        hero_description,
        hero_button_text,
        hero_button_url,
        about_title,
        about_description,
        why_us_title,
        why_us_description,
        stats_students,
        stats_courses,
        stats_faculty,
        stats_events,
        created_at,
        updated_at
       FROM homepage_content
       WHERE id = 1
       LIMIT 1`
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Homepage content not found",
            });
        }

        return res.json({
            success: true,
            data: rows[0],
        });
    } catch (error) {
        console.error("Get Homepage Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};


// UPDATE Homepage Content
export const updateHomepage = async (req, res) => {
    try {
        const {
            hero_title,
            hero_subtitle,
            hero_description,
            hero_button_text,
            hero_button_url,
            about_title,
            about_description,
            why_us_title,
            why_us_description,
            stats_students,
            stats_courses,
            stats_faculty,
            stats_events,
        } = req.body;

        await pool.query(
            `UPDATE homepage_content
       SET
        hero_title = ?,
        hero_subtitle = ?,
        hero_description = ?,
        hero_button_text = ?,
        hero_button_url = ?,
        about_title = ?,
        about_description = ?,
        why_us_title = ?,
        why_us_description = ?,
        stats_students = ?,
        stats_courses = ?,
        stats_faculty = ?,
        stats_events = ?
       WHERE id = 1`,
            [
                hero_title || null,
                hero_subtitle || null,
                hero_description || null,
                hero_button_text || null,
                hero_button_url || null,
                about_title || null,
                about_description || null,
                why_us_title || null,
                why_us_description || null,
                Number(stats_students) || 0,
                Number(stats_courses) || 0,
                Number(stats_faculty) || 0,
                Number(stats_events) || 0,
            ]
        );

        return res.json({
            success: true,
            message: "Homepage content updated successfully",
        });
    } catch (error) {
        console.error("Update Homepage Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};