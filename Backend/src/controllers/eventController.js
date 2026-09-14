import pool from "../config/db.js";
import fs from "fs";
import path from "path";

// GET all events
export const getEvents = async (req, res) => {
    try {
        const [events] = await pool.query(
            `SELECT *
       FROM events
       ORDER BY event_date DESC, sort_order ASC, id DESC`
        );

        return res.json({
            success: true,
            data: events,
        });
    } catch (error) {
        console.error("Get Events Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch events",
        });
    }
};

// GET single event
export const getEventById = async (req, res) => {
    try {
        const { id } = req.params;

        const [events] = await pool.query(
            `SELECT *
       FROM events
       WHERE id = ?
       LIMIT 1`,
            [id]
        );

        if (events.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Event not found",
            });
        }

        return res.json({
            success: true,
            data: events[0],
        });
    } catch (error) {
        console.error("Get Event By ID Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch event",
        });
    }
};

// CREATE event
export const createEvent = async (req, res) => {
    try {
        const {
            title,
            slug,
            short_description,
            description,
            event_date,
            start_time,
            end_time,
            venue,
            image,
            status,
            sort_order,
        } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: "Event title is required",
            });
        }

        if (!slug || !slug.trim()) {
            return res.status(400).json({
                success: false,
                message: "Event slug is required",
            });
        }

        if (!event_date) {
            return res.status(400).json({
                success: false,
                message: "Event date is required",
            });
        }

        const [existingSlug] = await pool.query(
            `SELECT id
       FROM events
       WHERE slug = ?
       LIMIT 1`,
            [slug.trim()]
        );

        if (existingSlug.length > 0) {
            return res.status(409).json({
                success: false,
                message: "An event with this slug already exists",
            });
        }

        const [result] = await pool.query(
            `INSERT INTO events (
        title,
        slug,
        short_description,
        description,
        event_date,
        start_time,
        end_time,
        venue,
        image,
        status,
        sort_order
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title.trim(),
                slug.trim(),
                short_description || null,
                description || null,
                event_date,
                start_time || null,
                end_time || null,
                venue || null,
                image || null,
                status || "active",
                sort_order ?? 0,
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Event created successfully",
            id: result.insertId,
        });
    } catch (error) {
        console.error("Create Event Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create event",
        });
    }
};

// UPDATE event
export const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            title,
            slug,
            short_description,
            description,
            event_date,
            start_time,
            end_time,
            venue,
            image,
            status,
            sort_order,
        } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: "Event title is required",
            });
        }

        if (!slug || !slug.trim()) {
            return res.status(400).json({
                success: false,
                message: "Event slug is required",
            });
        }

        if (!event_date) {
            return res.status(400).json({
                success: false,
                message: "Event date is required",
            });
        }

        const [existing] = await pool.query(
            `SELECT id
       FROM events
       WHERE id = ?
       LIMIT 1`,
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Event not found",
            });
        }

        const [existingSlug] = await pool.query(
            `SELECT id
       FROM events
       WHERE slug = ?
       AND id != ?
       LIMIT 1`,
            [slug.trim(), id]
        );

        if (existingSlug.length > 0) {
            return res.status(409).json({
                success: false,
                message: "An event with this slug already exists",
            });
        }

        await pool.query(
            `UPDATE events
       SET
         title = ?,
         slug = ?,
         short_description = ?,
         description = ?,
         event_date = ?,
         start_time = ?,
         end_time = ?,
         venue = ?,
         status = ?,
         sort_order = ?
       WHERE id = ?`,
            [
                title.trim(),
                slug.trim(),
                short_description || null,
                description || null,
                event_date,
                start_time || null,
                end_time || null,
                venue || null,
                image || null,
                status || "active",
                sort_order ?? 0,
                id,
            ]
        );

        return res.json({
            success: true,
            message: "Event updated successfully",
        });
    } catch (error) {
        console.error("Update Event Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update event",
        });
    }
};

// DELETE event
export const deleteEvent = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check event and get image path
        const [rows] = await pool.query(
            "SELECT id, image FROM events WHERE id = ?",
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Event not found.",
            });
        }

        const imagePath = rows[0].image;

        // Delete event from database
        await pool.query(
            "DELETE FROM events WHERE id = ?",
            [id]
        );

        // Delete associated image from uploads/events
        if (imagePath) {
            const absoluteImagePath = path.resolve(imagePath);

            if (fs.existsSync(absoluteImagePath)) {
                fs.unlinkSync(absoluteImagePath);
            }
        }

        return res.status(200).json({
            success: true,
            message: "Event deleted successfully.",
        });
    } catch (error) {
        next(error);
    }
};