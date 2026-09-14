import express from "express";

import {
    getHeroSlides,
    getHeroSlideById,
    createHeroSlide,
    createHeroSlidesBulk,
    updateHeroSlide,
    deleteHeroSlide,
} from "../controllers/heroController.js";

import { protect } from "../middleware/authMiddleware.js";
import heroUpload from "../middleware/heroUploadMiddleware.js";

const router = express.Router();

/* Admin Hero Routes */

router.get("/", protect, getHeroSlides);

router.get("/:id", protect, getHeroSlideById);


router.post(
    "/bulk",
    protect,
    heroUpload.array("media", 20),
    createHeroSlidesBulk
);

router.post(
    "/",
    protect,
    heroUpload.single("media"),
    createHeroSlide
);

router.put(
    "/:id",
    protect,
    heroUpload.single("media"),
    updateHeroSlide
);

router.delete(
    "/:id",
    protect,
    deleteHeroSlide
);

export default router;