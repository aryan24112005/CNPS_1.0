import db from "../config/db.js";

export const getPublicHomepageCounts = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                id,
                number_value,
                label,
                icon,
                sort_order
            FROM homepage_counts
            WHERE status = 'active'
            ORDER BY sort_order ASC, id ASC
        `);

        res.json({
            success: true,
            counts: rows,
        });
    } catch (error) {
        console.error(
            "Get public homepage counts error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch homepage counts.",
        });
    }
};
