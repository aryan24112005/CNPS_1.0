import pool from "../config/db.js";
import fs from "fs";
import path from "path";


// GET ALL ABOUT SECTIONS
export const getAboutSections = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT
                id,
                section_key,
                title,
                description,
                image,
                bullets,
                sort_order,
                status,
                created_at,
                updated_at
             FROM about_sections
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
        console.error("Get About Sections Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};


// GET SINGLE ABOUT SECTION
export const getAboutSectionById = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await pool.query(
            `SELECT
                id,
                section_key,
                title,
                description,
                image,
                bullets,
                sort_order,
                status,
                created_at,
                updated_at
             FROM about_sections
             WHERE id = ?
             LIMIT 1`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "About section not found",
            });
        }

        const section = {
            ...rows[0],
            bullets: rows[0].bullets
                ? typeof rows[0].bullets === "string"
                    ? JSON.parse(rows[0].bullets)
                    : rows[0].bullets
                : [],
        };

        return res.json({
            success: true,
            data: section,
        });
    } catch (error) {
        console.error(
            "Get About Section By ID Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};


// CREATE ABOUT SECTION
export const createAboutSection = async (req, res) => {
    try {
        const {
            section_key,
            title,
            description,
            bullets,
            sort_order,
            status,
        } = req.body;

        if (!section_key || !title) {
            return res.status(400).json({
                success: false,
                message: "Section key and title are required.",
            });
        }

        const image = req.file
            ? `/uploads/about/${req.file.filename}`
            : null;

        let parsedBullets = [];

        if (bullets) {
            try {
                parsedBullets =
                    typeof bullets === "string"
                        ? JSON.parse(bullets)
                        : bullets;
            } catch {
                return res.status(400).json({
                    success: false,
                    message: "Invalid bullets format.",
                });
            }
        }

        const [result] = await pool.query(
            `INSERT INTO about_sections
                (
                    section_key,
                    title,
                    description,
                    image,
                    bullets,
                    sort_order,
                    status
                )
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                section_key,
                title,
                description || null,
                image,
                JSON.stringify(parsedBullets),
                Number(sort_order) || 0,
                status || "active",
            ]
        );

        return res.status(201).json({
            success: true,
            message: "About section created successfully.",
            data: {
                id: result.insertId,
                image,
            },
        });
    } catch (error) {
        console.error(
            "Create About Section Error:",
            error
        );

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "This section already exists.",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};


// UPDATE ABOUT SECTION
export const updateAboutSection = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            section_key,
            title,
            description,
            bullets,
            sort_order,
            status,
        } = req.body;

        const [existingRows] = await pool.query(
            `SELECT image
             FROM about_sections
             WHERE id = ?
             LIMIT 1`,
            [id]
        );

        if (existingRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "About section not found.",
            });
        }

        let image = existingRows[0].image || null;

        if (req.file) {
            const newImage =
                `/uploads/about/${req.file.filename}`;

            if (
                image &&
                image.startsWith("/uploads/about/")
            ) {
                const oldImagePath = path.join(
                    process.cwd(),
                    image.replace(/^\/+/, "")
                );

                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }

            image = newImage;
        }

        let parsedBullets = [];

        if (bullets) {
            try {
                parsedBullets =
                    typeof bullets === "string"
                        ? JSON.parse(bullets)
                        : bullets;
            } catch {
                return res.status(400).json({
                    success: false,
                    message: "Invalid bullets format.",
                });
            }
        }

        await pool.query(
            `UPDATE about_sections
             SET
                section_key = ?,
                title = ?,
                description = ?,
                image = ?,
                bullets = ?,
                sort_order = ?,
                status = ?
             WHERE id = ?`,
            [
                section_key,
                title,
                description || null,
                image,
                JSON.stringify(parsedBullets),
                Number(sort_order) || 0,
                status || "active",
                id,
            ]
        );

        return res.json({
            success: true,
            message: "About section updated successfully.",
            data: {
                image,
            },
        });
    } catch (error) {
        console.error(
            "Update About Section Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};


// DELETE ABOUT SECTION
export const deleteAboutSection = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await pool.query(
            `SELECT image
             FROM about_sections
             WHERE id = ?
             LIMIT 1`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "About section not found.",
            });
        }

        const image = rows[0].image;

        await pool.query(
            `DELETE FROM about_sections
             WHERE id = ?`,
            [id]
        );

        if (
            image &&
            image.startsWith("/uploads/about/")
        ) {
            const imagePath = path.join(
                process.cwd(),
                image.replace(/^\/+/, "")
            );

            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        return res.json({
            success: true,
            message: "About section deleted successfully.",
        });
    } catch (error) {
        console.error(
            "Delete About Section Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};