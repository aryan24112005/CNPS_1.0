"use strict";
const router = require("express").Router();
const c = require("../controllers/heroSlideController");
const { protect } = require("../middleware/auth");
const { uploadImage } = require("../middleware/upload");

router.get("/public",           c.getPublic);

router.get("/",                 protect, c.getAll);
router.get("/:id",              protect, c.getOne);
router.post("/",                protect, c.create);
router.put("/:id",              protect, c.update);
router.delete("/:id",           protect, c.remove);
router.post("/:id/image",       protect, uploadImage.single("image"), c.uploadImage);

module.exports = router;
