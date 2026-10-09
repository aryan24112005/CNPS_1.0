import db from "../config/db.js";

/* ----------------------------------------
   GET ACTIVE HERO SLIDES
----------------------------------------- */
export const getPublicHeroSlides = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                id,
                title,
                subtitle,
                description,
                button_text,
                button_url,
                image,
                sort_order
            FROM home_hero_slides
            WHERE status = 'active'
            ORDER BY sort_order ASC, id ASC
        `);

        res.json({
            success: true,
            slides: rows,
        });
    } catch (error) {
        console.error("Get public hero slides error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch hero slides.",
        });
    }
};