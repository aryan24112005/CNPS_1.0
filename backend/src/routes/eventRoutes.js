"use strict";
const router = require("express").Router();
const c = require("../controllers/eventController");
const { protect } = require("../middleware/auth");
const { uploadImage, uploadMultipleImages } = require("../middleware/upload");

router.get("/public",                           c.getPublic);
router.get("/public/:slug",                     c.getBySlug);

router.get("/",                                 protect, c.getAll);
router.get("/:id",                              protect, c.getOne);
router.post("/",                                protect, c.create);
router.put("/:id",                              protect, c.update);
router.delete("/:id",                           protect, c.remove);
router.post("/:id/cover",                       protect, uploadImage.single("image"),          c.uploadCover);
router.post("/:id/gallery",                     protect, uploadMultipleImages.array("images", 30), c.addGalleryImages);
router.delete("/:id/gallery/:imageId",          protect, c.deleteGalleryImage);

module.exports = router;
