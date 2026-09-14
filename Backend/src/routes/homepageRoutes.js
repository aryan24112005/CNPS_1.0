import express from "express";

import {
    getHomepage,
    updateHomepage,
} from "../controllers/homepageController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin protected routes
router.get("/", protect, getHomepage);
router.put("/", protect, updateHomepage);

export default router;