import express from "express";

import {
    getPublicCourses,
    getPublicCourseById,
} from "../controllers/publicCourseController.js";

const router = express.Router();

router.get("/", getPublicCourses);
router.get("/:id", getPublicCourseById);

export default router;