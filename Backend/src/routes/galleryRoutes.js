import express from "express";

import {
    getGallery,
    getGalleryImageById,
    uploadGalleryImages,
    updateGalleryImage,
    deleteGalleryImage,
} from "../controllers/galleryController.js";

import { protect } from "../middleware/authMiddleware.js";
import galleryUpload from "../middleware/galleryUploadMiddleware.js";
import {
    getPublicGalleryImages,
} from "../controllers/galleryController.js";

const router = express.Router();

// ========================================
// GET ALL GALLERY IMAGES
// ========================================

router.get(
    "/",
    protect,
    getGallery
);

// ========================================
// GET SINGLE GALLERY IMAGE
// ========================================

router.get(
    "/:id",
    protect,
    getGalleryImageById
);

// ========================================
// UPLOAD MULTIPLE GALLERY IMAGES
// ========================================

router.post(
    "/images",
    protect,
    galleryUpload.array("images", 50),
    uploadGalleryImages
);

// ========================================
// UPDATE GALLERY IMAGE
// ========================================

router.put(
    "/:id",
    protect,
    updateGalleryImage
);

// ========================================
// DELETE GALLERY IMAGE
// ========================================

router.delete(
    "/:id",
    protect,
    deleteGalleryImage
);

router.get(
    "/images",
    getPublicGalleryImages
);


export default router;