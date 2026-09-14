import express from "express";

import {
    getPublicHeroSlides,
} from "../controllers/publicHeroController.js";

const router = express.Router();

router.get("/", getPublicHeroSlides);

export default router;