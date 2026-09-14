import express from "express";

import {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
} from "../controllers/eventController.js";

import { uploadEventImage } from "../controllers/eventFileController.js";
import { protect } from "../middleware/authMiddleware.js";
import eventUpload from "../middleware/eventUploadMiddleware.js";

import {
    uploadEventGalleryImages,
    updateEventGalleryImage,
    deleteEventGalleryImage,
} from "../controllers/eventGalleryController.js";

import eventGalleryUpload from "../middleware/eventGalleryUploadMiddleware.js";
const router = express.Router();

// Get all events
router.get("/", protect, getEvents);

// Get single event
router.get("/:id", protect, getEventById);

// Create event
router.post("/", protect, createEvent);

// Upload multiple event gallery images
router.post(
    "/:id/images",
    protect,
    eventGalleryUpload.array("images", 50),
    uploadEventGalleryImages
);

// Update event gallery image caption and sort order
router.put(
    "/images/:imageId",
    protect,
    updateEventGalleryImage
);

// Delete single event gallery image
router.delete(
    "/images/:imageId",
    protect,
    deleteEventGalleryImage
);

// Update event
router.put("/:id", protect, updateEvent);

// Delete event
router.delete("/:id", protect, deleteEvent);

router.post(
    "/:id/image",
    protect,
    eventUpload.single("image"),
    uploadEventImage
);

export default router;