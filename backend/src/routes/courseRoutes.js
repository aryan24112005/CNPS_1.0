"use strict";
const router = require("express").Router();
const c = require("../controllers/courseController");
const { protect } = require("../middleware/auth");
const { uploadImage, uploadImageOrPdf } = require("../middleware/upload");

// Public
router.get("/public",              c.getPublic);
router.get("/public/:slug",        c.getBySlug);

// Admin
router.get("/",                    protect, c.getAll);
router.get("/:id",                 protect, c.getOne);
router.post("/",                   protect, c.create);
router.put("/:id",                 protect, c.update);
router.delete("/:id",              protect, c.remove);
router.post("/:id/image",          protect, uploadImage.single("image"),       c.uploadImage);
router.post("/:id/fee-pdf",        protect, uploadImageOrPdf.single("file"),   c.uploadFeePdf);
router.post("/:id/timetable-pdf",  protect, uploadImageOrPdf.single("file"),   c.uploadTimetablePdf);

module.exports = router;
