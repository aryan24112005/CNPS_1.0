import db from "../config/db.js";
import path from "path";
import fs from "fs";

/**
 * Get About page
 * GET /api/about
 */
export const getAbout = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                id,
                title,
                subtitle,
                description,
                image,

                mission_title,
                mission_description,
                mission_image,

                vision_title,
                vision_description,
                vision_image,

                values_title,
                values_description,
                values_image,

                created_at,
                updated_at
            FROM about_page
            WHERE id = 1
            LIMIT 1
        `);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "About page content not found.",
            });
        }

        return res.status(200).json({
            success: true,
            data: rows[0],
        });
    } catch (error) {
        console.error("Get About Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch About page content.",
        });
    }
};


/**
 * Update About page
 * PUT /api/about
 */
export const updateAbout = async (req, res) => {
    try {
        const {
            title,
            subtitle,
            description,

            mission_title,
            mission_description,

            vision_title,
            vision_description,

            values_title,
            values_description,
        } = req.body;

        // Get existing About data
        const [existingRows] = await db.query(`
            SELECT *
            FROM about_page
            WHERE id = 1
            LIMIT 1
        `);

        if (existingRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "About page content not found.",
            });
        }

        const existing = existingRows[0];

        /*
         * -----------------------------------------
         * IMAGE PATHS
         * -----------------------------------------
         */

        let image = existing.image || null;
        let visionImage = existing.vision_image || null;
        let missionImage = existing.mission_image || null;
        let valuesImage = existing.values_image || null;


        /*
         * -----------------------------------------
         * MAIN ABOUT IMAGE
         * -----------------------------------------
         */

        if (req.files?.image?.[0]) {
            image = `/uploads/about/${req.files.image[0].filename}`;
        }


        /*
         * -----------------------------------------
         * VISION IMAGE
         * -----------------------------------------
         */

        if (req.files?.vision_image?.[0]) {
            visionImage =
                `/uploads/about/${req.files.vision_image[0].filename}`;
        }


        /*
         * -----------------------------------------
         * MISSION IMAGE
         * -----------------------------------------
         */

        if (req.files?.mission_image?.[0]) {
            missionImage =
                `/uploads/about/${req.files.mission_image[0].filename}`;
        }


        /*
         * -----------------------------------------
         * VALUES IMAGE
         * -----------------------------------------
         */

        if (req.files?.values_image?.[0]) {
            valuesImage =
                `/uploads/about/${req.files.values_image[0].filename}`;
        }


        /*
         * -----------------------------------------
         * DELETE OLD IMAGES
         * ONLY WHEN NEW IMAGE IS UPLOADED
         * -----------------------------------------
         */

        const deleteOldImage = (oldImage) => {
            if (!oldImage) return;

            try {
                const relativePath = oldImage.replace(/^\/+/, "");

                const fullPath = path.join(
                    process.cwd(),
                    relativePath
                );

                if (fs.existsSync(fullPath)) {
                    fs.unlinkSync(fullPath);
                }
            } catch (error) {
                console.error(
                    "Failed to delete old About image:",
                    error
                );
            }
        };


        if (req.files?.image?.[0] && existing.image) {
            deleteOldImage(existing.image);
        }

        if (
            req.files?.vision_image?.[0] &&
            existing.vision_image
        ) {
            deleteOldImage(existing.vision_image);
        }

        if (
            req.files?.mission_image?.[0] &&
            existing.mission_image
        ) {
            deleteOldImage(existing.mission_image);
        }

        if (
            req.files?.values_image?.[0] &&
            existing.values_image
        ) {
            deleteOldImage(existing.values_image);
        }


        /*
         * -----------------------------------------
         * UPDATE DATABASE
         * -----------------------------------------
         */

        await db.query(
            `
            UPDATE about_page
            SET
                title = ?,
                subtitle = ?,
                description = ?,
                image = ?,

                mission_title = ?,
                mission_description = ?,
                mission_image = ?,

                vision_title = ?,
                vision_description = ?,
                vision_image = ?,

                values_title = ?,
                values_description = ?,
                values_image = ?

            WHERE id = 1
            `,
            [
                title || "",
                subtitle || "",
                description || "",
                image,

                mission_title || "",
                mission_description || "",
                missionImage,

                vision_title || "",
                vision_description || "",
                visionImage,

                values_title || "",
                values_description || "",
                valuesImage,
            ]
        );


        /*
         * -----------------------------------------
         * RETURN UPDATED DATA
         * -----------------------------------------
         */

        const [updatedRows] = await db.query(`
            SELECT
                id,
                title,
                subtitle,
                description,
                image,

                mission_title,
                mission_description,
                mission_image,

                vision_title,
                vision_description,
                vision_image,

                values_title,
                values_description,
                values_image,

                created_at,
                updated_at
            FROM about_page
            WHERE id = 1
            LIMIT 1
        `);


        return res.status(200).json({
            success: true,
            message: "About page updated successfully.",
            data: updatedRows[0],
        });

    } catch (error) {
        console.error("Update About Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update About page content.",
            error: error.message,
        });
    }
};