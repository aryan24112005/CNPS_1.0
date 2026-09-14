import express from "express";

import {
    getFaculty,
    getFacultyById,
    createFaculty,
    updateFaculty,
    deleteFaculty,
} from "../controllers/facultyController.js";

import { protect } from "../middleware/authMiddleware.js";

import facultyUpload from "../middleware/facultyUploadMiddleware.js";
import { uploadFacultyPhoto } from "../controllers/facultyFileController.js";

const router = express.Router();

// Get all faculty
router.get("/", protect, getFaculty);

// Get single faculty
router.get("/:id", protect, getFacultyById);

// Create faculty
router.post("/", protect, createFaculty);

// Update faculty
router.put("/:id", protect, updateFaculty);

// Delete faculty
router.delete("/:id", protect, deleteFaculty);

// Upload faculty photo
router.post(
    "/:id/photo",
    protect,
    facultyUpload.single("photo"),
    uploadFacultyPhoto
);

export default router;