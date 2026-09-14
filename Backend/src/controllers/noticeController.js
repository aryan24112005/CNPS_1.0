import pool from "../config/db.js";
import fs from "fs";
import path from "path";

const deleteFileIfExists = (filePath) => {
    if (!filePath) return;

    const absolutePath = path.resolve(filePath);

    if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
    }
};

const isValidVideoUrl = (url) => {
    if (!url) return false;

    try {
        const parsedUrl = new URL(url);

        return ["http:", "https:"].includes(parsedUrl.protocol);
    } catch {
        return false;
    }
};

// Get all notices
export const getNotices = async (req, res, next) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                id,
                title,
                slug,
                type,
                content,
                file_path,
                video_url,
                notice_date,
                status,
                sort_order,
                created_at,
                updated_at
            FROM notices
            ORDER BY sort_order ASC, notice_date DESC, id DESC
        `);

        return res.status(200).json({
            success: true,
            notices: rows,
        });
    } catch (error) {
        next(error);
    }
};


// Get single notice
export const getNoticeById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [rows] = await pool.query(
            `
            SELECT
                id,
                title,
                slug,
                type,
                content,
                file_path,
                video_url,
                notice_date,
                status,
                sort_order,
                created_at,
                updated_at
            FROM notices
            WHERE id = ?
            `,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Notice not found.",
            });
        }

        return res.status(200).json({
            success: true,
            notice: rows[0],
        });
    } catch (error) {
        next(error);
    }
};


// Create notice
export const createNotice = async (req, res, next) => {
    try {
        const {
            title,
            slug,
            type,
            content,
            file_path,
            video_url,
            notice_date,
            status,
            sort_order,
        } = req.body;

        if (!title || !slug || !notice_date) {
            return res.status(400).json({
                success: false,
                message: "Title, slug and notice date are required.",
            });
        }

        const noticeType = type || "text";

        const allowedTypes = ["text", "image", "pdf", "video"];

        if (!allowedTypes.includes(noticeType)) {
            return res.status(400).json({
                success: false,
                message: "Invalid notice type.",
            });
        }

        const [existing] = await pool.query(
            "SELECT id FROM notices WHERE slug = ?",
            [slug]
        );

        if (noticeType === "video") {
            if (!video_url || !isValidVideoUrl(video_url)) {
                return res.status(400).json({
                    success: false,
                    message: "A valid video URL is required for video notices.",
                });
            }
        }

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: "A notice with this slug already exists.",
            });
        }

        const [result] = await pool.query(
            `
            INSERT INTO notices
            (
                title,
                slug,
                type,
                content,
                file_path,
                video_url,
                notice_date,
                status,
                sort_order
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                title,
                slug,
                noticeType,
                content ?? null,
                file_path ?? null,
                video_url ?? null,
                notice_date,
                status || "active",
                sort_order ?? 0,
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Notice created successfully.",
            noticeId: result.insertId,
        });
    } catch (error) {
        next(error);
    }
};


// Update notice
export const updateNotice = async (req, res, next) => {
    try {
        const { id } = req.params;

        const {
            title,
            slug,
            type,
            content,
            file_path,
            video_url,
            notice_date,
            status,
            sort_order,
        } = req.body;

        if (!title || !slug || !notice_date) {
            return res.status(400).json({
                success: false,
                message: "Title, slug and notice date are required.",
            });
        }

        const noticeType = type || "text";

        const allowedTypes = ["text", "image", "pdf", "video"];

        if (!allowedTypes.includes(noticeType)) {
            return res.status(400).json({
                success: false,
                message: "Invalid notice type.",
            });
        }

        const [noticeRows] = await pool.query(
            "SELECT id FROM notices WHERE id = ?",
            [id]
        );

        if (noticeType === "video") {
            if (!video_url || !isValidVideoUrl(video_url)) {
                return res.status(400).json({
                    success: false,
                    message: "A valid video URL is required for video notices.",
                });
            }
        }

        if (noticeRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Notice not found.",
            });
        }

        const [duplicate] = await pool.query(
            `
            SELECT id
            FROM notices
            WHERE slug = ?
            AND id != ?
            `,
            [slug, id]
        );

        if (duplicate.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Another notice with this slug already exists.",
            });
        }

        await pool.query(
            `
            UPDATE notices
            SET
                title = ?,
                slug = ?,
                type = ?,
                content = ?,
                file_path = ?,
                video_url = ?,
                notice_date = ?,
                status = ?,
                sort_order = ?
            WHERE id = ?
            `,
            [
                title,
                slug,
                noticeType,
                content ?? null,
                file_path ?? null,
                video_url ?? null,
                notice_date,
                status || "active",
                sort_order ?? 0,
                id,
            ]
        );

        return res.status(200).json({
            success: true,
            message: "Notice updated successfully.",
        });
    } catch (error) {
        next(error);
    }
};


// Delete notice
export const deleteNotice = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [rows] = await pool.query(
            `
            SELECT id, file_path
            FROM notices
            WHERE id = ?
            `,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Notice not found.",
            });
        }

        const filePath = rows[0].file_path;

        await pool.query(
            "DELETE FROM notices WHERE id = ?",
            [id]
        );

        // Delete associated physical file
        if (filePath) {
            deleteFileIfExists(filePath);
        }

        return res.status(200).json({
            success: true,
            message: "Notice deleted successfully.",
        });
    } catch (error) {
        next(error);
    }
};



