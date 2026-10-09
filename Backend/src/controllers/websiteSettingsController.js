/*
|--------------------------------------------------------------------------
| UNUSED — websiteSettingsController.js
|--------------------------------------------------------------------------
| This controller references columns (alternate_phone, alternate_email,
| whatsapp_number, facebook_url, etc.) that do NOT exist in the actual
| website_settings table. The frontend does not call /api/website-settings
| anywhere. The full site settings are managed via /api/settings instead.
|
| Keeping this file commented out to preserve for future reference.
|--------------------------------------------------------------------------
*/

/*
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
*/

// Stub exports so the route file doesn't crash on import
export const getWebsiteSettings = async (req, res) => {
    return res.status(410).json({
        success: false,
        message: "This endpoint is not in use. Use /api/settings instead.",
    });
};

export const updateWebsiteSettings = async (req, res) => {
    return res.status(410).json({
        success: false,
        message: "This endpoint is not in use. Use /api/settings instead.",
    });
};
