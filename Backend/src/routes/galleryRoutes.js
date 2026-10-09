import express from "express";

import {
    // Why Us gallery (gallery table)
    getGallery,
    getGalleryImageById,
    uploadGalleryImages,
    updateGalleryImage,
    deleteGalleryImage,
    getPublicGalleryImages,

    // Albums (gallery_albums + gallery_images)
    getAlbums,
    createAlbum,
    updateAlbum,
    deleteAlbum,
    getAlbumImages,
    uploadAlbumImages,
    deleteAlbumImage,
} from "../controllers/galleryController.js";

import { protect } from "../middleware/authMiddleware.js";
import galleryUpload from "../middleware/galleryUploadMiddleware.js";

const router = express.Router();


// ============================================================
// SPECIFIC PATHS FIRST (before /:id wildcards)
// ============================================================

// Upload Why Us images (bulk) — must be before /:id routes
router.post(
    "/images",
    protect,
    galleryUpload.array("images", 50),
    uploadGalleryImages
);

// ============================================================
// PHOTO ALBUMS (gallery_albums + gallery_images)
// All /albums/* routes must come before /:id wildcard
// ============================================================

// List all albums
router.get("/albums", protect, getAlbums);

// Create album
router.post("/albums", protect, createAlbum);

// Get images inside an album
router.get("/albums/:id/images", protect, getAlbumImages);

// Upload images to an album
router.post(
    "/albums/:id/images",
    protect,
    galleryUpload.array("images", 50),
    uploadAlbumImages
);

// Delete a single album image — specific path before /:id
router.delete("/albums/images/:imageId", protect, deleteAlbumImage);

// Update album
router.put("/albums/:id", protect, updateAlbum);

// Delete album (and all its images)
router.delete("/albums/:id", protect, deleteAlbum);


// ============================================================
// WHY US GALLERY — /:id wildcard routes (last)
// ============================================================

// Get all Why Us images
router.get("/", protect, getGallery);

// Get single Why Us image
router.get("/:id", protect, getGalleryImageById);

// Update Why Us image metadata
router.put("/:id", protect, updateGalleryImage);

// Delete Why Us image
router.delete("/:id", protect, deleteGalleryImage);


export default router;
