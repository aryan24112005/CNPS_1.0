import express from "express";

import {
    getPublicFaculty,
    getPublicFacultyById,
} from "../controllers/publicFacultyController.js";

const router = express.Router();

// Get all active faculty
router.get("/", getPublicFaculty);

// Get single active faculty
router.get("/:id", getPublicFacultyById);

export default router;