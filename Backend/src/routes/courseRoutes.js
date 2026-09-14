import express from "express";

import {
    getCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
} from "../controllers/courseController.js";

import { protect } from "../middleware/authMiddleware.js";

import upload from "../middleware/uploadMiddleware.js";

import {
    uploadCourseFiles,
} from "../controllers/courseFileController.js";

import {
    uploadCourseBookImage,
} from "../controllers/courseBookImageController.js";

const router = express.Router();

// ==================== COURSES ====================

router.get("/", protect, getCourses);

router.get("/:id", protect, getCourseById);

router.post("/", protect, createCourse);

router.put("/:id", protect, updateCourse);

router.delete("/:id", protect, deleteCourse);


// ==================== COURSE FILES ====================

router.post(
    "/:id/files",
    protect,
    upload.fields([
        {
            name: "image",
            maxCount: 1,
        },
        {
            name: "fee_pdf",
            maxCount: 1,
        },
        {
            name: "timetable_pdf",
            maxCount: 1,
        },
    ]),
    uploadCourseFiles
);


// ==================== COURSE BOOK IMAGE ====================

router.post(
    "/:courseId/books/:bookId/image",
    protect,
    upload.single("image"),
    uploadCourseBookImage
);

export default router;