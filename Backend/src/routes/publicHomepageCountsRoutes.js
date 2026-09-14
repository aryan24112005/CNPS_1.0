import express from "express";
import {
    getPublicHomepageCounts,
} from "../controllers/publicHomepageCountsController.js";

const router = express.Router();

router.get("/", getPublicHomepageCounts);

export default router;