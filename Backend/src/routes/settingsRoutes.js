import express from "express";

import {
    getSettings,
    updateSettings,
} from "../controllers/settingsController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Admin Settings
|--------------------------------------------------------------------------
*/

// Get current site settings
router.get("/", protect, getSettings);

// Update site settings
router.put("/", protect, updateSettings);

export default router;