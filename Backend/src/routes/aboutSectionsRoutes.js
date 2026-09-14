import express from "express";

import {
    getAboutSections,
    getAboutSectionById,
    createAboutSection,
    updateAboutSection,
    deleteAboutSection,
} from "../controllers/aboutSectionsController.js";

import { protect } from "../middleware/authMiddleware.js";
import aboutUpload from "../middleware/aboutUploadMiddleware.js";

const router = express.Router();

router.get("/", protect, getAboutSections);

router.get("/:id", protect, getAboutSectionById);

router.post(
    "/",
    protect,
    aboutUpload.single("image"),
    createAboutSection
);

router.put(
    "/:id",
    protect,
    aboutUpload.single("image"),
    updateAboutSection
);

router.delete(
    "/:id",
    protect,
    deleteAboutSection
);

export default router;