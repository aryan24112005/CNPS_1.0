import db from "../config/db.js";
import fs from "fs";
import path from "path";

/*
|--------------------------------------------------------------------------
| Real schema: id, title, subtitle, description, image,
|              button_text, button_url, status, sort_order,
|              created_at, updated_at
| NOTE: There is NO media_type or media_path column.
|       The single 'image' column stores the file path.
|--------------------------------------------------------------------------
*/

/* ----------------------------------------
   Helper: Delete uploaded file
----------------------------------------- */
const deleteFile = (filePath) => {
    if (!filePath) return;

    // filePath may be stored as /uploads/hero/xxx or uploads/hero/xxx
    const relative = filePath.replace(/^\//, "");
    const fullPath = path.resolve(process.cwd(), relative);

    if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
    }
};

/* ----------------------------------------
   GET ALL HERO SLIDES
----------------------------------------- */
export const getHeroSlides = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                id,
                title,
                subtitle,
                description,
                image,
                button_text,
                button_url,
                status,
                sort_order,
                created_at,
                updated_at
            FROM home_hero_slides
            ORDER BY sort_order ASC, id DESC
        `);

        res.json({
            success: true,
            data: rows,
        });
    } catch (error) {
        console.error("Get hero slides error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch hero slides.",
        });
    }
};

/* ----------------------------------------
   GET SINGLE HERO SLIDE
----------------------------------------- */
export const getHeroSlideById = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.query(
            `SELECT * FROM home_hero_slides WHERE id = ? LIMIT 1`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Hero slide not found.",
            });
        }

        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error("Get hero slide error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch hero slide.",
        });
    }
};

/* ----------------------------------------
   CREATE HERO SLIDE
----------------------------------------- */
export const createHeroSlide = async (req, res) => {
    try {
        const {
            title,
            subtitle,
            description,
            button_text,
            button_url,
            status,
            sort_order,
        } = req.body;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Hero image or video is required.",
            });
        }

        const imagePath = `/uploads/hero/${req.file.filename}`;

        const [result] = await db.query(
            `
            INSERT INTO home_hero_slides
            (title, subtitle, description, button_text, button_url, image, status, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                title || null,
                subtitle || null,
                description || null,
                button_text || null,
                button_url || null,
                imagePath,
                status || "active",
                Number(sort_order) || 0,
            ]
        );

        const [rows] = await db.query(
            `SELECT * FROM home_hero_slides WHERE id = ?`,
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: "Hero slide created successfully.",
            data: rows[0],
        });
    } catch (error) {
        console.error("Create hero slide error:", error);

        if (req.file) {
            deleteFile(`/uploads/hero/${req.file.filename}`);
        }

        res.status(500).json({
            success: false,
            message: "Failed to create hero slide.",
        });
    }
};

/* ----------------------------------------
   BULK CREATE HERO SLIDES
----------------------------------------- */
export const createHeroSlidesBulk = async (req, res) => {
    try {
        const files = req.files || [];

        if (files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please select at least one image or video.",
            });
        }

        const {
            title,
            subtitle,
            description,
            button_text,
            button_url,
            status,
            sort_order,
        } = req.body;

        const [orderRows] = await db.query(`
            SELECT COALESCE(MAX(sort_order), -1) AS max_order
            FROM home_hero_slides
        `);

        let nextOrder = Number(orderRows[0]?.max_order ?? -1) + 1;
        const createdSlides = [];

        for (const file of files) {
            const imagePath = `/uploads/hero/${file.filename}`;

            const [result] = await db.query(
                `
                INSERT INTO home_hero_slides
                (title, subtitle, description, button_text, button_url, image, status, sort_order)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `,
                [
                    title || null,
                    subtitle || null,
                    description || null,
                    button_text || null,
                    button_url || null,
                    imagePath,
                    status || "active",
                    sort_order !== undefined
                        ? Number(sort_order) + createdSlides.length
                        : nextOrder++,
                ]
            );

            const [rows] = await db.query(
                `SELECT * FROM home_hero_slides WHERE id = ?`,
                [result.insertId]
            );

            createdSlides.push(rows[0]);
        }

        res.status(201).json({
            success: true,
            message: `${createdSlides.length} hero slide(s) uploaded successfully.`,
            data: createdSlides,
        });
    } catch (error) {
        console.error("Bulk hero upload error:", error);

        if (req.files?.length) {
            for (const file of req.files) {
                if (file.path && fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            }
        }

        res.status(500).json({
            success: false,
            message: "Failed to upload hero slides.",
        });
    }
};

/* ----------------------------------------
   UPDATE HERO SLIDE
----------------------------------------- */
export const updateHeroSlide = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            title,
            subtitle,
            description,
            button_text,
            button_url,
            status,
            sort_order,
        } = req.body;

        const [existingRows] = await db.query(
            `SELECT * FROM home_hero_slides WHERE id = ? LIMIT 1`,
            [id]
        );

        if (existingRows.length === 0) {
            if (req.file) {
                deleteFile(`/uploads/hero/${req.file.filename}`);
            }

            return res.status(404).json({
                success: false,
                message: "Hero slide not found.",
            });
        }

        const existing = existingRows[0];
        let imagePath = existing.image;

        if (req.file) {
            imagePath = `/uploads/hero/${req.file.filename}`;
            deleteFile(existing.image);
        }

        await db.query(
            `
            UPDATE home_hero_slides
            SET
                title = ?,
                subtitle = ?,
                description = ?,
                button_text = ?,
                button_url = ?,
                image = ?,
                status = ?,
                sort_order = ?
            WHERE id = ?
            `,
            [
                title ?? existing.title,
                subtitle ?? existing.subtitle,
                description ?? existing.description,
                button_text ?? existing.button_text,
                button_url ?? existing.button_url,
                imagePath,
                status ?? existing.status,
                sort_order !== undefined
                    ? Number(sort_order)
                    : existing.sort_order,
                id,
            ]
        );

        const [rows] = await db.query(
            `SELECT * FROM home_hero_slides WHERE id = ?`,
            [id]
        );

        res.json({
            success: true,
            message: "Hero slide updated successfully.",
            data: rows[0],
        });
    } catch (error) {
        console.error("Update hero slide error:", error);

        if (req.file) {
            deleteFile(`/uploads/hero/${req.file.filename}`);
        }

        res.status(500).json({
            success: false,
            message: "Failed to update hero slide.",
        });
    }
};

/* ----------------------------------------
   DELETE HERO SLIDE
----------------------------------------- */
export const deleteHeroSlide = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.query(
            `SELECT * FROM home_hero_slides WHERE id = ? LIMIT 1`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Hero slide not found.",
            });
        }

        const slide = rows[0];

        await db.query(`DELETE FROM home_hero_slides WHERE id = ?`, [id]);

        deleteFile(slide.image);

        res.json({
            success: true,
            message: "Hero slide deleted successfully.",
        });
    } catch (error) {
        console.error("Delete hero slide error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete hero slide.",
        });
    }
};
