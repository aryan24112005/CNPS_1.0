import express from "express";

import {
    getPublicAlbums,
    getPublicAlbumBySlug,
    getPublicGalleryImages,
} from "../controllers/publicGalleryController.js";

const router = express.Router();

// =====================================================
// PUBLIC GALLERY ALBUMS
// =====================================================

router.get("/", getPublicAlbums);


// =====================================================
// WHY US GALLERY
// =====================================================

router.get(
    "/images",
    getPublicGalleryImages
);


// =====================================================
// PUBLIC SINGLE ALBUM BY SLUG
// =====================================================
// IMPORTANT:
// Keep this AFTER /images

router.get(
    "/:slug",
    getPublicAlbumBySlug
);

export default router;