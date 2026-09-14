import express from "express";

import {
    getPublicTestimonials,
    getPublicTestimonialById,
} from "../controllers/publicTestimonialController.js";

const router = express.Router();

router.get("/", getPublicTestimonials);

router.get("/:id", getPublicTestimonialById);

export default router;