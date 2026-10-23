"use strict";
const router = require("express").Router();
const c = require("../controllers/facultyController");
const { protect } = require("../middleware/auth");
const { uploadImage } = require("../middleware/upload");

// Public
router.get("/public",       c.getPublic);

// Admin
router.get("/",             protect, c.getAll);
router.get("/:id",          protect, c.getOne);
router.post("/",            protect, c.create);
router.put("/:id",          protect, c.update);
router.delete("/:id",       protect, c.remove);
router.post("/:id/photo",   protect, uploadImage.single("photo"), c.uploadPhoto);

module.exports = router;
