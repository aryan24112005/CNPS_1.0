import pool from "../config/db.js";

// GET all active faculty
export const getPublicFaculty = async (req, res) => {
    try {
        const [faculty] = await pool.query(
            `SELECT
                id,
                name,
                designation,
                qualification,
                short_bio,
                bio,
                photo,
                email,
                phone,
                facebook_url,
                instagram_url,
                linkedin_url,
                youtube_url,
                sort_order
             FROM faculty
             WHERE status = 'active'
             ORDER BY sort_order ASC, id DESC`
        );

        return res.json({
            success: true,
            faculty,
        });
    } catch (error) {
        console.error("Get Public Faculty Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch faculty",
        });
    }
};

// GET single active faculty
export const getPublicFacultyById = async (req, res) => {
    try {
        const { id } = req.params;

        const [faculty] = await pool.query(
            `SELECT
                id,
                name,
                designation,
                qualification,
                short_bio,
                bio,
                photo,
                email,
                phone,
                facebook_url,
                instagram_url,
                linkedin_url,
                youtube_url,
                sort_order
             FROM faculty
             WHERE id = ?
               AND status = 'active'
             LIMIT 1`,
            [id]
        );

        if (faculty.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Faculty member not found",
            });
        }

        return res.json({
            success: true,
            faculty: faculty[0],
        });
    } catch (error) {
        console.error("Get Public Faculty By ID Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch faculty member",
        });
    }
};