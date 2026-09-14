import express from "express";

import {
    getWebsiteSettings,
    updateWebsiteSettings,
} from "../controllers/websiteSettingsController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get settings
router.get("/", protect, getWebsiteSettings);

// Update settings
router.put("/", protect, updateWebsiteSettings);

export default router;