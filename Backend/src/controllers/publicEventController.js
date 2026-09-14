import pool from "../config/db.js";

// Get all active events
export const getPublicEvents = async (req, res, next) => {
    try {
        const [events] = await pool.query(`
            SELECT
                id,
                title,
                slug,
                short_description,
                description,
                event_date,
                start_time,
                end_time,
                venue,
                image,
                sort_order,
                created_at
            FROM events
            WHERE status = 'active'
            ORDER BY event_date DESC, sort_order ASC, id DESC
        `);

        return res.status(200).json({
            success: true,
            events,
        });
    } catch (error) {
        next(error);
    }
};


// Get single active event by slug
export const getPublicEventBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;

        // Get event
        const [events] = await pool.query(
            `
            SELECT
                id,
                title,
                slug,
                short_description,
                description,
                event_date,
                start_time,
                end_time,
                venue,
                image,
                sort_order,
                created_at
            FROM events
            WHERE slug = ?
              AND status = 'active'
            `,
            [slug]
        );

        if (events.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Event not found.",
            });
        }

        const event = events[0];

        // Get event gallery images
        const [gallery] = await pool.query(
            `
            SELECT
                id,
                image,
                caption,
                sort_order,
                created_at
            FROM event_images
            WHERE event_id = ?
            ORDER BY sort_order ASC, id ASC
            `,
            [event.id]
        );

        // Attach gallery to event
        event.gallery = gallery;

        return res.status(200).json({
            success: true,
            event,
        });
    } catch (error) {
        next(error);
    }
};