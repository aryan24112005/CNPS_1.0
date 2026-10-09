"use strict";
const router = require("express").Router();
const c = require("../controllers/mediaController");
const { protect } = require("../middleware/auth");
const { uploadImageOrPdf } = require("../middleware/upload");

router.get("/",             protect, c.getAll);
router.post("/",            protect, uploadImageOrPdf.single("file"), c.upload);
router.delete("/:id",       protect, c.remove);

module.exports = router;
