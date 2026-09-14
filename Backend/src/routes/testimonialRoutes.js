import express from "express";

import {
    getTestimonials,
    getTestimonialById,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial,
} from "../controllers/testimonialController.js";

import { protect } from "../middleware/authMiddleware.js";

import testimonialUpload from "../middleware/testimonialUploadMiddleware.js";

import {
    uploadTestimonialAvatar,
} from "../controllers/testimonialAvatarController.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Admin Testimonial Routes
|--------------------------------------------------------------------------
*/

// Get all testimonials
router.get("/", protect, getTestimonials);

// Get single testimonial
router.get("/:id", protect, getTestimonialById);

// Create testimonial
router.post("/", protect, createTestimonial);

// Specific route first
router.post(
    "/:id/avatar",
    protect,
    testimonialUpload.single("avatar"),
    uploadTestimonialAvatar
);

// Update testimonial
router.put("/:id", protect, updateTestimonial);

// Delete testimonial
router.delete("/:id", protect, deleteTestimonial);


export default router;