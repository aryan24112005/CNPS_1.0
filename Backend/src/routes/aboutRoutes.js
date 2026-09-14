import express from "express";

import {
    getAbout,
    updateAbout,
} from "../controllers/aboutController.js";

import { protect } from "../middleware/authMiddleware.js";

import aboutUpload from "../middleware/aboutUploadMiddleware.js";

const router = express.Router();


/*
 * ==========================================
 * GET ABOUT PAGE
 * ==========================================
 * Admin only
 */
router.get(
    "/",
    protect,
    getAbout
);


/*
 * ==========================================
 * UPDATE ABOUT PAGE
 * ==========================================
 *
 * Supports 4 different images:
 *
 * 1. image          → Main About image
 * 2. vision_image   → Our Vision image
 * 3. mission_image  → Our Mission image
 * 4. values_image   → Our Values image
 *
 */
router.put(
    "/",
    protect,
    aboutUpload.fields([
        {
            name: "image",
            maxCount: 1,
        },
        {
            name: "vision_image",
            maxCount: 1,
        },
        {
            name: "mission_image",
            maxCount: 1,
        },
        {
            name: "values_image",
            maxCount: 1,
        },
    ]),
    updateAbout
);


export default router;