import pool from "../config/db.js";

export const getWebsiteSettings = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT
        id,
        phone,
        alternate_phone,
        email,
        alternate_email,
        address,
        facebook_url,
        instagram_url,
        youtube_url,
        twitter_url,
        linkedin_url,
        whatsapp_number,
        created_at,
        updated_at
       FROM website_settings
       WHERE id = 1
       LIMIT 1`
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Website settings not found",
            });
        }

        return res.json({
            success: true,
            data: rows[0],
        });
    } catch (error) {
        console.error("Get Website Settings Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};


export const updateWebsiteSettings = async (req, res) => {
    try {
        const {
            phone,
            alternate_phone,
            email,
            alternate_email,
            address,
            facebook_url,
            instagram_url,
            youtube_url,
            twitter_url,
            linkedin_url,
            whatsapp_number,
        } = req.body;

        await pool.query(
            `UPDATE website_settings
       SET
        phone = ?,
        alternate_phone = ?,
        email = ?,
        alternate_email = ?,
        address = ?,
        facebook_url = ?,
        instagram_url = ?,
        youtube_url = ?,
        twitter_url = ?,
        linkedin_url = ?,
        whatsapp_number = ?
       WHERE id = 1`,
            [
                phone || null,
                alternate_phone || null,
                email || null,
                alternate_email || null,
                address || null,
                facebook_url || null,
                instagram_url || null,
                youtube_url || null,
                twitter_url || null,
                linkedin_url || null,
                whatsapp_number || null,
            ]
        );

        return res.json({
            success: true,
            message: "Website settings updated successfully",
        });
    } catch (error) {
        console.error("Update Website Settings Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};