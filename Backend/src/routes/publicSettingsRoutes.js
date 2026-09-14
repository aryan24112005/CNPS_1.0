import express from "express";

import {
    getPublicSettings,
} from "../controllers/publicSettingsController.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Public Site Settings
|--------------------------------------------------------------------------
*/

// Get settings for public website
router.get("/", getPublicSettings);

export default router;