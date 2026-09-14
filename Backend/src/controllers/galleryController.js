import pool from "../config/db.js";
import fs from "fs";
import path from "path";


// ========================================
// HELPER
// ========================================

const deleteFileIfExists = (filePath) => {
    if (!filePath) return;

    const absolutePath = path.resolve(filePath);

    if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
    }
};


// ========================================
// GET ALL GALLERY IMAGES - ADMIN
// ========================================

export const getGallery = async (req, res, next) => {
    try {
        const [images] = await pool.query(`
            SELECT
                id,
                image,
                caption,
                category,
                status,
                sort_order,
                created_at,
                updated_at
            FROM gallery
            ORDER BY
                category ASC,
                sort_order ASC,
                id DESC
        `);

        return res.status(200).json({
            success: true,
            data: images,
        });

    } catch (error) {
        next(error);
    }
};


// ========================================
// GET SINGLE GALLERY IMAGE - ADMIN
// ========================================

export const getGalleryImageById = async (
    req,
    res,
    next
) => {
    try {
        const { id } = req.params;

        const [images] = await pool.query(
            `
            SELECT
                id,
                image,
                caption,
                category,
                status,
                sort_order,
                created_at,
                updated_at
            FROM gallery
            WHERE id = ?
            LIMIT 1
            `,
            [id]
        );

        if (images.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Gallery image not found.",
            });
        }

        return res.status(200).json({
            success: true,
            data: images[0],
        });

    } catch (error) {
        next(error);
    }
};


// ========================================
// UPLOAD GALLERY IMAGES - ADMIN
// ========================================

export const uploadGalleryImages = async (
    req,
    res,
    next
) => {
    const uploadedFiles = [];

    try {

        // -------------------------------
        // CHECK FILES
        // -------------------------------

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one gallery image is required.",
            });
        }


        // -------------------------------
        // GET BODY DATA
        // -------------------------------

        const {
            caption,
            category,
            status,
            sort_order,
        } = req.body;


        // -------------------------------
        // VALID CATEGORIES
        // -------------------------------

        const allowedCategories = [
            "academic",
            "development",
            "campus",
        ];

        if (
            category &&
            !allowedCategories.includes(category.trim())
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid category. Allowed categories are academic, development and campus.",
            });
        }


        // -------------------------------
        // VALID STATUS
        // -------------------------------

        const imageStatus =
            status === "inactive"
                ? "inactive"
                : "active";


        // -------------------------------
        // SORT ORDER
        // -------------------------------

        const order =
            Number.isFinite(Number(sort_order))
                ? Number(sort_order)
                : 0;


        // -------------------------------
        // INSERT EACH IMAGE
        // -------------------------------

        for (const file of req.files) {

            const imagePath = path
                .relative(process.cwd(), file.path)
                .replace(/\\/g, "/");

            uploadedFiles.push(file.path);


            await pool.query(
                `
                INSERT INTO gallery
                (
                    image,
                    caption,
                    category,
                    status,
                    sort_order
                )
                VALUES (?, ?, ?, ?, ?)
                `,
                [
                    imagePath,
                    caption?.trim() || null,
                    category?.trim() || null,
                    imageStatus,
                    order,
                ]
            );
        }


        // -------------------------------
        // SUCCESS
        // -------------------------------

        return res.status(201).json({
            success: true,
            message: `${req.files.length} gallery image(s) uploaded successfully.`,
        });

    } catch (error) {

        // -------------------------------
        // CLEANUP FILES
        // -------------------------------

        for (const filePath of uploadedFiles) {
            deleteFileIfExists(filePath);
        }

        next(error);
    }
};


// ========================================
// UPDATE GALLERY IMAGE - ADMIN
// ========================================

export const updateGalleryImage = async (
    req,
    res,
    next
) => {
    try {

        const { id } = req.params;

        const {
            caption,
            category,
            status,
            sort_order,
        } = req.body;


        // -------------------------------
        // CHECK IMAGE
        // -------------------------------

        const [existing] = await pool.query(
            `
            SELECT id
            FROM gallery
            WHERE id = ?
            LIMIT 1
            `,
            [id]
        );


        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Gallery image not found.",
            });
        }


        // -------------------------------
        // VALID CATEGORY
        // -------------------------------

        const allowedCategories = [
            "academic",
            "development",
            "campus",
        ];

        if (
            category &&
            !allowedCategories.includes(category.trim())
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid category. Allowed categories are academic, development and campus.",
            });
        }


        // -------------------------------
        // STATUS
        // -------------------------------

        const imageStatus =
            status === "inactive"
                ? "inactive"
                : "active";


        // -------------------------------
        // SORT ORDER
        // -------------------------------

        const order =
            Number.isFinite(Number(sort_order))
                ? Number(sort_order)
                : 0;


        // -------------------------------
        // UPDATE
        // -------------------------------

        await pool.query(
            `
            UPDATE gallery
            SET
                caption = ?,
                category = ?,
                status = ?,
                sort_order = ?
            WHERE id = ?
            `,
            [
                caption?.trim() || null,
                category?.trim() || null,
                imageStatus,
                order,
                id,
            ]
        );


        return res.status(200).json({
            success: true,
            message: "Gallery image updated successfully.",
        });

    } catch (error) {
        next(error);
    }
};


// ========================================
// DELETE GALLERY IMAGE - ADMIN
// ========================================

export const deleteGalleryImage = async (
    req,
    res,
    next
) => {
    try {

        const { id } = req.params;


        // -------------------------------
        // GET IMAGE
        // -------------------------------

        const [images] = await pool.query(
            `
            SELECT
                id,
                image
            FROM gallery
            WHERE id = ?
            LIMIT 1
            `,
            [id]
        );


        if (images.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Gallery image not found.",
            });
        }


        const imagePath = images[0].image;


        // -------------------------------
        // DELETE DATABASE RECORD
        // -------------------------------

        await pool.query(
            `
            DELETE FROM gallery
            WHERE id = ?
            `,
            [id]
        );


        // -------------------------------
        // DELETE PHYSICAL FILE
        // -------------------------------

        deleteFileIfExists(imagePath);


        return res.status(200).json({
            success: true,
            message: "Gallery image deleted successfully.",
        });

    } catch (error) {
        next(error);
    }
};


// ========================================
// GET PUBLIC GALLERY IMAGES
// ========================================
//
// Used by:
// WhyUsSection.jsx
//
// Categories:
//
// academic
// development
// campus
//
// Only ACTIVE images are returned.
// ========================================

export const getPublicGalleryImages = async (
    req,
    res,
    next
) => {
    try {

        const [images] = await pool.query(
            `
            SELECT
                id,
                image,
                caption,
                category,
                sort_order
            FROM gallery
            WHERE status = 'active'
              AND category IN (
                  'academic',
                  'development',
                  'campus'
              )
            ORDER BY
                category ASC,
                sort_order ASC,
                id DESC
            `
        );


        return res.status(200).json({
            success: true,
            data: images,
        });

    } catch (error) {
        next(error);
    }
};