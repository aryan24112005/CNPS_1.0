import pool from "../config/db.js";
import fs from "fs";
import path from "path";

// GET all faculty
export const getFaculty = async (req, res) => {
    try {
        const [faculty] = await pool.query(
            `SELECT *
       FROM faculty
       ORDER BY sort_order ASC, id DESC`
        );

        return res.json({
            success: true,
            data: faculty,
        });
    } catch (error) {
        console.error("Get Faculty Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch faculty",
        });
    }
};

// GET single faculty
export const getFacultyById = async (req, res) => {
    try {
        const { id } = req.params;

        const [faculty] = await pool.query(
            `SELECT *
       FROM faculty
       WHERE id = ?
       LIMIT 1`,
            [id]
        );

        if (faculty.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Faculty member not found",
            });
        }

        return res.json({
            success: true,
            data: faculty[0],
        });
    } catch (error) {
        console.error("Get Faculty By ID Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch faculty member",
        });
    }
};

// CREATE faculty
export const createFaculty = async (req, res) => {
    try {
        const {
            name,
            designation,
            qualification,
            short_bio,
            bio,
            photo,
            email,
            phone,
            facebook_url,
            instagram_url,
            linkedin_url,
            youtube_url,
            status,
            sort_order,
        } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Faculty name is required",
            });
        }

        const [result] = await pool.query(
            `INSERT INTO faculty (
        name,
        designation,
        qualification,
        short_bio,
        bio,
        photo,
        email,
        phone,
        facebook_url,
        instagram_url,
        linkedin_url,
        youtube_url,
        status,
        sort_order
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name.trim(),
                designation || null,
                qualification || null,
                short_bio || null,
                bio || null,
                photo || null,
                email || null,
                phone || null,
                facebook_url || null,
                instagram_url || null,
                linkedin_url || null,
                youtube_url || null,
                status || "active",
                sort_order ?? 0,
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Faculty member created successfully",
            id: result.insertId,
        });
    } catch (error) {
        console.error("Create Faculty Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create faculty member",
        });
    }
};

// UPDATE faculty
export const updateFaculty = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            name,
            designation,
            qualification,
            short_bio,
            bio,
            photo,
            email,
            phone,
            facebook_url,
            instagram_url,
            linkedin_url,
            youtube_url,
            status,
            sort_order,
        } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Faculty name is required",
            });
        }

        const [existing] = await pool.query(
            "SELECT id FROM faculty WHERE id = ? LIMIT 1",
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Faculty member not found",
            });
        }

        await pool.query(
            `UPDATE faculty
       SET
         name = ?,
         designation = ?,
         qualification = ?,
         short_bio = ?,
         bio = ?,
         photo = ?,
         email = ?,
         phone = ?,
         facebook_url = ?,
         instagram_url = ?,
         linkedin_url = ?,
         youtube_url = ?,
         status = ?,
         sort_order = ?
       WHERE id = ?`,
            [
                name.trim(),
                designation || null,
                qualification || null,
                short_bio || null,
                bio || null,
                photo || null,
                email || null,
                phone || null,
                facebook_url || null,
                instagram_url || null,
                linkedin_url || null,
                youtube_url || null,
                status || "active",
                sort_order ?? 0,
                id,
            ]
        );

        return res.json({
            success: true,
            message: "Faculty member updated successfully",
        });
    } catch (error) {
        console.error("Update Faculty Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update faculty member",
        });
    }
};

// DELETE faculty
export const deleteFaculty = async (req, res) => {
    try {
        const { id } = req.params;

        const [existing] = await pool.query(
            `SELECT id, photo
       FROM faculty
       WHERE id = ?
       LIMIT 1`,
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Faculty member not found",
            });
        }

        const faculty = existing[0];

        // Delete database record
        await pool.query(
            "DELETE FROM faculty WHERE id = ?",
            [id]
        );

        // Delete associated photo from server
        if (faculty.photo) {
            const relativePhotoPath = faculty.photo.replace(/^\/+/, "");

            const photoPath = path.resolve(
                process.cwd(),
                relativePhotoPath
            );

            if (fs.existsSync(photoPath)) {
                fs.unlinkSync(photoPath);
            }
        }

        return res.json({
            success: true,
            message: "Faculty member and associated photo deleted successfully",
        });
    } catch (error) {
        console.error("Delete Faculty Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete faculty member",
        });
    }
};