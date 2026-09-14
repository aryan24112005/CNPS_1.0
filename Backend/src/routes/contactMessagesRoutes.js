import express from "express";

import {
    createContactMessage,
    getContactMessages,
    getContactMessageById,
    updateContactMessageStatus,
    markContactMessageAsRead,
    deleteContactMessage,
} from "../controllers/contactMessagesController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| PUBLIC - Contact Form
|--------------------------------------------------------------------------
*/

// Anyone can send a message from the website
router.post("/", createContactMessage);


/*
|--------------------------------------------------------------------------
| ADMIN - Contact Messages
|--------------------------------------------------------------------------
*/

// Get all messages
router.get("/admin", protect, getContactMessages);

// Get single message
router.get("/admin/:id", protect, getContactMessageById);

// Update message status
router.patch(
    "/admin/:id/status",
    protect,
    updateContactMessageStatus
);

// Mark message as read
router.patch(
    "/admin/:id/read",
    protect,
    markContactMessageAsRead
);

// Delete message
router.delete(
    "/admin/:id",
    protect,
    deleteContactMessage
);

export default router;