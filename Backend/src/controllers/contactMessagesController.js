import db from "../config/db.js";

/*
|--------------------------------------------------------------------------
| PUBLIC - Submit Contact Message
|--------------------------------------------------------------------------
*/
export const createContactMessage = async (req, res) => {
    try {
        const {
            name,
            email,
            subject,
            message,
        } = req.body;

        // Basic validation
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: "Name, email and message are required.",
            });
        }

        const trimmedName = name.trim();
        const trimmedEmail = email.trim();
        const trimmedSubject = subject ? subject.trim() : "";
        const trimmedMessage = message.trim();

        if (!trimmedName || !trimmedEmail || !trimmedMessage) {
            return res.status(400).json({
                success: false,
                message: "Name, email and message cannot be empty.",
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Insert Message
        |--------------------------------------------------------------------------
        */
        const [result] = await db.query(
            `
            INSERT INTO contact_messages (
                name,
                email,
                subject,
                message,
                status,
                is_read
            )
            VALUES (?, ?, ?, ?, 'new', 0)
            `,
            [
                trimmedName,
                trimmedEmail,
                trimmedSubject || null,
                trimmedMessage,
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Your message has been sent successfully.",
            data: {
                id: result.insertId,
            },
        });
    } catch (error) {
        console.error("Create Contact Message Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to send your message.",
            error: error.message,
        });
    }
};


/*
|--------------------------------------------------------------------------
| ADMIN - Get All Contact Messages
|--------------------------------------------------------------------------
*/
export const getContactMessages = async (req, res) => {
    try {
        const [rows] = await db.query(
            `
            SELECT
                id,
                name,
                email,
                subject,
                message,
                status,
                is_read,
                created_at,
                updated_at
            FROM contact_messages
            ORDER BY
                CASE
                    WHEN status = 'new' THEN 0
                    WHEN status = 'read' THEN 1
                    WHEN status = 'replied' THEN 2
                    WHEN status = 'archived' THEN 3
                    ELSE 4
                END,
                created_at DESC
            `
        );

        return res.status(200).json({
            success: true,
            data: rows,
        });
    } catch (error) {
        console.error("Get Contact Messages Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch contact messages.",
            error: error.message,
        });
    }
};


/*
|--------------------------------------------------------------------------
| ADMIN - Get Single Contact Message
|--------------------------------------------------------------------------
*/
export const getContactMessageById = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.query(
            `
            SELECT
                id,
                name,
                email,
                subject,
                message,
                status,
                is_read,
                created_at,
                updated_at
            FROM contact_messages
            WHERE id = ?
            LIMIT 1
            `,
            [id]
        );

        if (!rows.length) {
            return res.status(404).json({
                success: false,
                message: "Contact message not found.",
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Mark Message As Read
        |--------------------------------------------------------------------------
        */
        await db.query(
            `
            UPDATE contact_messages
            SET
                is_read = 1,
                status = CASE
                    WHEN status = 'new' THEN 'read'
                    ELSE status
                END
            WHERE id = ?
            `,
            [id]
        );

        const message = {
            ...rows[0],
            is_read: 1,
            status:
                rows[0].status === "new"
                    ? "read"
                    : rows[0].status,
        };

        return res.status(200).json({
            success: true,
            data: message,
        });
    } catch (error) {
        console.error("Get Contact Message Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch contact message.",
            error: error.message,
        });
    }
};


/*
|--------------------------------------------------------------------------
| ADMIN - Update Message Status
|--------------------------------------------------------------------------
*/
export const updateContactMessageStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const allowedStatuses = [
            "new",
            "read",
            "replied",
            "archived",
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid status. Allowed values: new, read, replied, archived.",
            });
        }

        const isRead = status === "new" ? 0 : 1;

        const [result] = await db.query(
            `
            UPDATE contact_messages
            SET
                status = ?,
                is_read = ?
            WHERE id = ?
            `,
            [
                status,
                isRead,
                id,
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Contact message not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Message status updated successfully.",
        });
    } catch (error) {
        console.error(
            "Update Contact Message Status Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to update message status.",
            error: error.message,
        });
    }
};


/*
|--------------------------------------------------------------------------
| ADMIN - Mark Message As Read
|--------------------------------------------------------------------------
*/
export const markContactMessageAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(
            `
            UPDATE contact_messages
            SET
                is_read = 1,
                status = CASE
                    WHEN status = 'new' THEN 'read'
                    ELSE status
                END
            WHERE id = ?
            `,
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Contact message not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Message marked as read.",
        });
    } catch (error) {
        console.error(
            "Mark Contact Message Read Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to mark message as read.",
            error: error.message,
        });
    }
};


/*
|--------------------------------------------------------------------------
| ADMIN - Delete Contact Message
|--------------------------------------------------------------------------
*/
export const deleteContactMessage = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(
            `
            DELETE FROM contact_messages
            WHERE id = ?
            `,
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Contact message not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Contact message deleted successfully.",
        });
    } catch (error) {
        console.error(
            "Delete Contact Message Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to delete contact message.",
            error: error.message,
        });
    }
};