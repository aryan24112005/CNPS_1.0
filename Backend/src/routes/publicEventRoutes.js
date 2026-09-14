import express from "express";

import {
    getPublicEvents,
    getPublicEventBySlug,
} from "../controllers/publicEventController.js";

const router = express.Router();

router.get("/", getPublicEvents);
router.get("/:slug", getPublicEventBySlug);

export default router;