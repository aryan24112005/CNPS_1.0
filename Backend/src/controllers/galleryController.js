import pool from "../config/db.js";
import fs from "fs";
import path from "path";

/*
|--------------------------------------------------------------------------
| Gallery table schema (Why Us section):
|   id, title, description, category (academic|development|campus),
|   image, status (active|inactive), sort_order, created_at, updated_at
|--------------------------------------------------------------------------
*/

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
                title,
                description,
                category,
                image,
                status,
                sort_order,
                created_at,
                updated_at
            FROM gallery
            ORDER BY sort_order ASC, id DESC
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

export const getGalleryImageById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [images] = await pool.query(
            `
            SELECT
                id,
                title,
                description,
                category,
                image,
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

export const uploadGalleryImages = async (req, res, next) => {
    const uploadedFiles = [];

    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one gallery image is required.",
            });
        }

        const { title, description, category, status, sort_order } = req.body;

        const imageStatus = status === "inactive" ? "inactive" : "active";
        const order = Number.isFinite(Number(sort_order))
            ? Number(sort_order)
            : 0;

        const validCategories = ["academic", "development", "campus"];
        const imageCategory = validCategories.includes(category) ? category : null;

        for (const file of req.files) {
            const imagePath = path
                .relative(process.cwd(), file.path)
                .replace(/\\/g, "/");

            uploadedFiles.push(file.path);

            await pool.query(
                `
                INSERT INTO gallery (title, description, category, image, status, sort_order)
                VALUES (?, ?, ?, ?, ?, ?)
                `,
                [
                    title?.trim() || null,
                    description?.trim() || null,
                    imageCategory,
                    imagePath,
                    imageStatus,
                    order,
                ]
            );
        }

        return res.status(201).json({
            success: true,
            message: `${req.files.length} gallery image(s) uploaded successfully.`,
        });
    } catch (error) {
        for (const filePath of uploadedFiles) {
            deleteFileIfExists(filePath);
        }

        next(error);
    }
};


// ========================================
// UPDATE GALLERY IMAGE - ADMIN
// ========================================

export const updateGalleryImage = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description, category, status, sort_order } = req.body;

        const [existing] = await pool.query(
            `SELECT id FROM gallery WHERE id = ? LIMIT 1`,
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Gallery image not found.",
            });
        }

        const imageStatus = status === "inactive" ? "inactive" : "active";
        const order = Number.isFinite(Number(sort_order))
            ? Number(sort_order)
            : 0;

        const validCategories = ["academic", "development", "campus"];
        const imageCategory = validCategories.includes(category) ? category : null;

        await pool.query(
            `
            UPDATE gallery
            SET
                title = ?,
                description = ?,
                category = ?,
                status = ?,
                sort_order = ?
            WHERE id = ?
            `,
            [
                title?.trim() || null,
                description?.trim() || null,
                imageCategory,
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

export const deleteGalleryImage = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [images] = await pool.query(
            `SELECT id, image FROM gallery WHERE id = ? LIMIT 1`,
            [id]
        );

        if (images.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Gallery image not found.",
            });
        }

        const imagePath = images[0].image;

        await pool.query(`DELETE FROM gallery WHERE id = ?`, [id]);

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
// GET PUBLIC GALLERY IMAGES (Why Us section)
// ========================================

export const getPublicGalleryImages = async (req, res, next) => {
    try {
        const { category } = req.query;
        const validCategories = ["academic", "development", "campus"];

        let sql = `
            SELECT
                id,
                title,
                description,
                category,
                image,
                sort_order
            FROM gallery
            WHERE status = 'active'
        `;
        const params = [];

        if (category && validCategories.includes(category)) {
            sql += " AND category = ?";
            params.push(category);
        }

        sql += " ORDER BY sort_order ASC, id DESC";

        const [images] = await pool.query(sql, params);

        return res.status(200).json({
            success: true,
            data: images,
        });
    } catch (error) {
        next(error);
    }
};



// ========================================
// ALBUM CRUD - ADMIN
// ========================================

// Helper: generate slug from title
const slugify = (text) =>
    text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-") +
    "-" +
    Date.now().toString(36);

// GET ALL ALBUMS
export const getAlbums = async (req, res, next) => {
    try {
        const [albums] = await pool.query(`
            SELECT
                id, title, slug, description, cover_image,
                status, sort_order, created_at, updated_at
            FROM gallery_albums
            ORDER BY sort_order ASC, id DESC
        `);

        // For each album, get image count
        if (albums.length > 0) {
            const ids = albums.map((a) => a.id);
            const [counts] = await pool.query(
                `SELECT album_id, COUNT(*) AS count
                 FROM gallery_images WHERE album_id IN (?)
                 GROUP BY album_id`,
                [ids]
            );
            const countMap = {};
            counts.forEach((c) => { countMap[c.album_id] = c.count; });
            albums.forEach((a) => { a.image_count = countMap[a.id] || 0; });
        }

        return res.status(200).json({ success: true, data: albums });
    } catch (error) {
        next(error);
    }
};

// CREATE ALBUM
export const createAlbum = async (req, res, next) => {
    try {
        const { title, description, status, sort_order } = req.body;

        if (!title?.trim()) {
            return res.status(400).json({ success: false, message: "Album title is required." });
        }

        const slug = slugify(title);

        const [result] = await pool.query(
            `INSERT INTO gallery_albums (title, slug, description, status, sort_order)
             VALUES (?, ?, ?, ?, ?)`,
            [title.trim(), slug, description?.trim() || null, status || "active", Number(sort_order) || 0]
        );

        const [rows] = await pool.query(
            "SELECT * FROM gallery_albums WHERE id = ?",
            [result.insertId]
        );

        return res.status(201).json({ success: true, message: "Album created successfully.", data: rows[0] });
    } catch (error) {
        next(error);
    }
};

// UPDATE ALBUM
export const updateAlbum = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description, status, sort_order } = req.body;

        const [existing] = await pool.query(
            "SELECT id FROM gallery_albums WHERE id = ? LIMIT 1",
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: "Album not found." });
        }

        await pool.query(
            `UPDATE gallery_albums SET title = ?, description = ?, status = ?, sort_order = ? WHERE id = ?`,
            [title?.trim() || "", description?.trim() || null, status || "active", Number(sort_order) || 0, id]
        );

        return res.status(200).json({ success: true, message: "Album updated successfully." });
    } catch (error) {
        next(error);
    }
};

// DELETE ALBUM (cascades to gallery_images via FK)
export const deleteAlbum = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Get all image paths first so we can delete files
        const [images] = await pool.query(
            "SELECT image FROM gallery_images WHERE album_id = ?",
            [id]
        );

        const [result] = await pool.query(
            "DELETE FROM gallery_albums WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Album not found." });
        }

        // Delete physical image files
        const fs = (await import("fs")).default;
        const path = (await import("path")).default;
        for (const img of images) {
            if (img.image) {
                const abs = path.resolve(process.cwd(), img.image);
                if (fs.existsSync(abs)) fs.unlinkSync(abs);
            }
        }

        return res.status(200).json({ success: true, message: "Album and all its images deleted." });
    } catch (error) {
        next(error);
    }
};

// GET IMAGES FOR AN ALBUM
export const getAlbumImages = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [images] = await pool.query(
            `SELECT id, album_id, image, caption, sort_order, created_at
             FROM gallery_images WHERE album_id = ?
             ORDER BY sort_order ASC, id ASC`,
            [id]
        );

        return res.status(200).json({ success: true, data: images });
    } catch (error) {
        next(error);
    }
};

// UPLOAD IMAGES TO AN ALBUM
export const uploadAlbumImages = async (req, res, next) => {
    const uploadedFiles = [];
    try {
        const { id } = req.params;

        const [albums] = await pool.query(
            "SELECT id FROM gallery_albums WHERE id = ?",
            [id]
        );

        if (albums.length === 0) {
            return res.status(404).json({ success: false, message: "Gallery album not found." });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: "At least one image is required." });
        }

        uploadedFiles.push(...req.files);

        const path = (await import("path")).default;
        const values = req.files.map((file) => {
            const imagePath = path.relative(process.cwd(), file.path).replace(/\\/g, "/");
            return [id, imagePath, null, 0];
        });

        await pool.query(
            `INSERT INTO gallery_images (album_id, image, caption, sort_order) VALUES ?`,
            [values]
        );

        return res.status(201).json({
            success: true,
            message: `${req.files.length} image(s) uploaded to album successfully.`,
        });
    } catch (error) {
        const fs = (await import("fs")).default;
        for (const file of uploadedFiles) {
            if (file.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);
        }
        next(error);
    }
};

// DELETE A SINGLE ALBUM IMAGE
export const deleteAlbumImage = async (req, res, next) => {
    try {
        const { imageId } = req.params;

        const [rows] = await pool.query(
            "SELECT id, image FROM gallery_images WHERE id = ?",
            [imageId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "Image not found." });
        }

        await pool.query("DELETE FROM gallery_images WHERE id = ?", [imageId]);

        deleteFileIfExists(rows[0].image);

        return res.status(200).json({ success: true, message: "Image deleted successfully." });
    } catch (error) {
        next(error);
    }
};
