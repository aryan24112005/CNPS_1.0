"use strict";
const router = require("express").Router();
const c = require("../controllers/settingsController");
const { protect } = require("../middleware/auth");
const { uploadImage } = require("../middleware/upload");

router.get("/public",                       c.get);

router.get("/",                             protect, c.get);
router.put("/",                             protect, c.update);
router.post("/logo",                        protect, uploadImage.single("image"), c.uploadLogo);
router.post("/favicon",                     protect, uploadImage.single("image"), c.uploadFavicon);
router.post("/about-image/:field",          protect, uploadImage.single("image"), c.uploadAboutImage);
router.delete("/about-image/:field",        protect, c.deleteAboutImage);

module.exports = router;
