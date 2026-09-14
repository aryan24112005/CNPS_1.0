import db from "../config/db.js";

/*
|--------------------------------------------------------------------------
| Get Site Settings
|--------------------------------------------------------------------------
*/
export const getSettings = async (req, res) => {
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
                footer_links,

                created_at,
                updated_at
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
        | Convert footer_links JSON string into JavaScript array
        |--------------------------------------------------------------------------
        */
        if (typeof settings.footer_links === "string") {
            try {
                settings.footer_links = JSON.parse(settings.footer_links);
            } catch (error) {
                settings.footer_links = [];
            }
        }

        if (!settings.footer_links) {
            settings.footer_links = [];
        }

        return res.status(200).json({
            success: true,
            data: settings,
        });
    } catch (error) {
        console.error("Get Settings Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch site settings.",
            error: error.message,
        });
    }
};


/*
|--------------------------------------------------------------------------
| Update Site Settings
|--------------------------------------------------------------------------
*/
export const updateSettings = async (req, res) => {
    try {
        const {
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
            footer_links,
        } = req.body;

        /*
        |--------------------------------------------------------------------------
        | Prepare Footer Links
        |--------------------------------------------------------------------------
        */
        let footerLinksValue = [];

        if (footer_links) {
            if (Array.isArray(footer_links)) {
                footerLinksValue = footer_links;
            } else if (typeof footer_links === "string") {
                try {
                    footerLinksValue = JSON.parse(footer_links);

                    if (!Array.isArray(footerLinksValue)) {
                        footerLinksValue = [];
                    }
                } catch (error) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid footer_links JSON format.",
                    });
                }
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Check Existing Settings
        |--------------------------------------------------------------------------
        */
        const [existingRows] = await db.query(
            `
            SELECT id
            FROM site_settings
            ORDER BY id ASC
            LIMIT 1
            `
        );

        /*
        |--------------------------------------------------------------------------
        | If settings don't exist, create them
        |--------------------------------------------------------------------------
        */
        if (!existingRows.length) {
            const [result] = await db.query(
                `
                INSERT INTO site_settings (
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
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `,
                [
                    website_title || "",
                    website_tagline || "",

                    contact_address || "",
                    contact_phone || "",
                    contact_email || "",
                    office_hours || "",
                    map_url || "",

                    facebook_url || "",
                    instagram_url || "",
                    youtube_url || "",
                    linkedin_url || "",
                    twitter_url || "",

                    footer_description || "",
                    footer_tagline || "",
                    footer_address || "",
                    footer_phone || "",
                    footer_email || "",
                    footer_copyright || "",
                    JSON.stringify(footerLinksValue),
                ]
            );

            return res.status(201).json({
                success: true,
                message: "Site settings created successfully.",
                data: {
                    id: result.insertId,
                },
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Update Existing Settings
        |--------------------------------------------------------------------------
        */
        const settingsId = existingRows[0].id;

        await db.query(
            `
            UPDATE site_settings
            SET
                website_title = ?,
                website_tagline = ?,

                contact_address = ?,
                contact_phone = ?,
                contact_email = ?,
                office_hours = ?,
                map_url = ?,

                facebook_url = ?,
                instagram_url = ?,
                youtube_url = ?,
                linkedin_url = ?,
                twitter_url = ?,

                footer_description = ?,
                footer_tagline = ?,
                footer_address = ?,
                footer_phone = ?,
                footer_email = ?,
                footer_copyright = ?,
                footer_links = ?
            WHERE id = ?
            `,
            [
                website_title || "",
                website_tagline || "",

                contact_address || "",
                contact_phone || "",
                contact_email || "",
                office_hours || "",
                map_url || "",

                facebook_url || "",
                instagram_url || "",
                youtube_url || "",
                linkedin_url || "",
                twitter_url || "",

                footer_description || "",
                footer_tagline || "",
                footer_address || "",
                footer_phone || "",
                footer_email || "",
                footer_copyright || "",
                JSON.stringify(footerLinksValue),

                settingsId,
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | Return Updated Settings
        |--------------------------------------------------------------------------
        */
        const [updatedRows] = await db.query(
            `
            SELECT *
            FROM site_settings
            WHERE id = ?
            LIMIT 1
            `,
            [settingsId]
        );

        const updatedSettings = updatedRows[0];

        if (typeof updatedSettings.footer_links === "string") {
            try {
                updatedSettings.footer_links = JSON.parse(
                    updatedSettings.footer_links
                );
            } catch (error) {
                updatedSettings.footer_links = [];
            }
        }

        return res.status(200).json({
            success: true,
            message: "Site settings updated successfully.",
            data: updatedSettings,
        });
    } catch (error) {
        console.error("Update Settings Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update site settings.",
            error: error.message,
        });
    }
};
