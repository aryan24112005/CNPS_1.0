import express from "express";

import {
    getPublicNotices,
    getPublicNoticeBySlug,
} from "../controllers/publicNoticeController.js";

const router = express.Router();

// Get all active notices
router.get("/", getPublicNotices);

// Get single active notice by slug
router.get("/:slug", getPublicNoticeBySlug);

export default router;