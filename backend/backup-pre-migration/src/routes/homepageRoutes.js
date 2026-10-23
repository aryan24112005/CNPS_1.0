"use strict";
const router = require("express").Router();
const c = require("../controllers/homepageController");
const { protect } = require("../middleware/auth");
const { uploadImage } = require("../middleware/upload");

router.get("/",                     protect, c.get);
router.put("/",                     protect, c.update);
router.post("/about-image",         protect, uploadImage.single("image"), c.uploadAboutImg);

// Public endpoint
router.get("/public",               c.get);

module.exports = router;
