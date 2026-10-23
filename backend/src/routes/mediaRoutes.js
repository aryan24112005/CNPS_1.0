"use strict";
const router = require("express").Router();
const c = require("../controllers/mediaController");
const { protect } = require("../middleware/auth");
const { uploadImageOrPdf } = require("../middleware/upload");

// Admin: list, upload  (must be registered BEFORE /:id)
router.get("/",             protect, c.getAll);
router.post("/",            protect, uploadImageOrPdf.single("file"), c.upload);

// Public: serve media binary (images accessible without auth)
router.get("/:id",  c.serveMedia);

// Admin: delete
router.delete("/:id",       protect, c.remove);

module.exports = router;
