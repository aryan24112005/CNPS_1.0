import pool from "../config/db.js";

export const getPublicAboutSections = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT
                id,
                section_key,
                title,
                description,
                image,
                bullets,
                sort_order
             FROM about_sections
             WHERE status = 'active'
             ORDER BY sort_order ASC, id ASC`
        );

        const sections = rows.map((section) => ({
            ...section,
            bullets: section.bullets
                ? typeof section.bullets === "string"
                    ? JSON.parse(section.bullets)
                    : section.bullets
                : [],
        }));

        return res.json({
            success: true,
            data: sections,
        });
    } catch (error) {
        console.error(
            "Get Public About Sections Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};