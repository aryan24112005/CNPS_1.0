import express from "express";
import {
    getPublicAboutSections,
} from "../controllers/publicAboutSectionsController.js";

const router = express.Router();

router.get("/", getPublicAboutSections);

export default router;