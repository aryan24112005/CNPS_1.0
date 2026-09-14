import express from "express";

import {
    getNotices,
    getNoticeById,
    createNotice,
    updateNotice,
    deleteNotice,
} from "../controllers/noticeController.js";

import { protect } from "../middleware/authMiddleware.js";

import {
    uploadNoticeFile,
} from "../controllers/noticeFileController.js";

import noticeUpload from "../middleware/noticeUploadMiddleware.js";

const router = express.Router();

// Get all notices
router.get("/", protect, getNotices);

// Get single notice
router.get("/:id", protect, getNoticeById);

// Create notice
router.post("/", protect, createNotice);

// Update notice
router.put("/:id", protect, updateNotice);

// Delete notice
router.delete("/:id", protect, deleteNotice);

// Upload / replace notice image or PDF
router.post(
    "/:id/file",
    protect,
    noticeUpload.single("file"),
    uploadNoticeFile
);

export default router;