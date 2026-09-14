import db from "../config/db.js";

/*
|--------------------------------------------------------------------------
| Get Public Site Settings
|--------------------------------------------------------------------------
*/
export const getPublicSettings = async (req, res) => {
    try {
        const [rows] = await db.query(
            `
            SELECT
                id,
                website_title,
                website_tagline,

                contact_address,
                contact_phone,
                contact_email,
                office_hours,
                map_url,

                facebook_url,
                instagram_url,
                youtube_url,
                linkedin_url,
                twitter_url,

                footer_description,
                footer_tagline,
                footer_address,
                footer_phone,
                footer_email,
                footer_copyright,
                footer_links
            FROM site_settings
            ORDER BY id ASC
            LIMIT 1
            `
        );

        if (!rows.length) {
            return res.status(404).json({
                success: false,
                message: "Site settings not found.",
            });
        }

        const settings = rows[0];

        /*
        |--------------------------------------------------------------------------
        | Parse Footer Links
        |--------------------------------------------------------------------------
        */
        if (typeof settings.footer_links === "string") {
            try {
                settings.footer_links = JSON.parse(settings.footer_links);
            } catch (error) {
                settings.footer_links = [];
            }
        }

        if (!Array.isArray(settings.footer_links)) {
            settings.footer_links = [];
        }

        return res.status(200).json({
            success: true,
            data: settings,
        });
    } catch (error) {
        console.error("Get Public Settings Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch public site settings.",
            error: error.message,
        });
    }
};
