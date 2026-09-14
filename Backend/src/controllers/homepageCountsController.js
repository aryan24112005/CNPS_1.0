import db from "../config/db.js";

/* ========================================
   GET ALL COUNTS
======================================== */

export const getHomepageCounts = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                id,
                number_value,
                label,
                icon,
                status,
                sort_order,
                created_at,
                updated_at
            FROM homepage_counts
            ORDER BY sort_order ASC, id ASC
        `);

        res.json({
            success: true,
            data: rows,
        });
    } catch (error) {
        console.error("Get homepage counts error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch homepage counts.",
        });
    }
};


/* ========================================
   GET SINGLE COUNT
======================================== */

export const getHomepageCountById = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.query(
            `
            SELECT
                id,
                number_value,
                label,
                icon,
                status,
                sort_order,
                created_at,
                updated_at
            FROM homepage_counts
            WHERE id = ?
            `,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Homepage count not found.",
            });
        }

        res.json({
            success: true,
            data: rows[0],
        });
    } catch (error) {
        console.error(
            "Get homepage count by ID error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch homepage count.",
        });
    }
};


/* ========================================
   CREATE COUNT
======================================== */

export const createHomepageCount = async (req, res) => {
    try {
        const {
            number_value,
            label,
            icon,
            status,
            sort_order,
        } = req.body;

        if (
            number_value === undefined ||
            number_value === null ||
            !label
        ) {
            return res.status(400).json({
                success: false,
                message: "Number and label are required.",
            });
        }

        const [result] = await db.query(
            `
            INSERT INTO homepage_counts
            (
                number_value,
                label,
                icon,
                status,
                sort_order
            )
            VALUES (?, ?, ?, ?, ?)
            `,
            [
                Number(number_value),
                label,
                icon || null,
                status || "active",
                sort_order !== undefined
                    ? Number(sort_order)
                    : 0,
            ]
        );

        const [rows] = await db.query(
            `
            SELECT *
            FROM homepage_counts
            WHERE id = ?
            `,
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: "Homepage count created successfully.",
            data: rows[0],
        });
    } catch (error) {
        console.error(
            "Create homepage count error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to create homepage count.",
        });
    }
};


/* ========================================
   UPDATE COUNT
======================================== */

export const updateHomepageCount = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            number_value,
            label,
            icon,
            status,
            sort_order,
        } = req.body;

        const [existingRows] = await db.query(
            `
            SELECT *
            FROM homepage_counts
            WHERE id = ?
            `,
            [id]
        );

        if (existingRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Homepage count not found.",
            });
        }

        const existing = existingRows[0];

        await db.query(
            `
            UPDATE homepage_counts
            SET
                number_value = ?,
                label = ?,
                icon = ?,
                status = ?,
                sort_order = ?
            WHERE id = ?
            `,
            [
                number_value !== undefined
                    ? Number(number_value)
                    : existing.number_value,

                label !== undefined
                    ? label
                    : existing.label,

                icon !== undefined
                    ? icon || null
                    : existing.icon,

                status !== undefined
                    ? status
                    : existing.status,

                sort_order !== undefined
                    ? Number(sort_order)
                    : existing.sort_order,

                id,
            ]
        );

        const [rows] = await db.query(
            `
            SELECT *
            FROM homepage_counts
            WHERE id = ?
            `,
            [id]
        );

        res.json({
            success: true,
            message: "Homepage count updated successfully.",
            data: rows[0],
        });
    } catch (error) {
        console.error(
            "Update homepage count error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to update homepage count.",
        });
    }
};


/* ========================================
   DELETE COUNT
======================================== */

export const deleteHomepageCount = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(
            `
            DELETE FROM homepage_counts
            WHERE id = ?
            `,
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Homepage count not found.",
            });
        }

        res.json({
            success: true,
            message: "Homepage count deleted successfully.",
        });
    } catch (error) {
        console.error(
            "Delete homepage count error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to delete homepage count.",
        });
    }
};