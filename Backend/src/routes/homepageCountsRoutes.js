import express from "express";

import {
    getHomepageCounts,
    getHomepageCountById,
    createHomepageCount,
    updateHomepageCount,
    deleteHomepageCount,
} from "../controllers/homepageCountsController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getHomepageCounts);

router.get("/:id", protect, getHomepageCountById);

router.post("/", protect, createHomepageCount);

router.put("/:id", protect, updateHomepageCount);

router.delete("/:id", protect, deleteHomepageCount);

export default router;