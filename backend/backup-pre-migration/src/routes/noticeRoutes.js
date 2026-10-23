"use strict";
const router = require("express").Router();
const c = require("../controllers/noticeController");
const { protect } = require("../middleware/auth");
const { uploadImageOrPdf } = require("../middleware/upload");

router.get("/public",           c.getPublic);
router.get("/public/:slug",     c.getBySlug);

router.get("/",                 protect, c.getAll);
router.get("/:id",              protect, c.getOne);
router.post("/",                protect, c.create);
router.put("/:id",              protect, c.update);
router.delete("/:id",           protect, c.remove);
router.post("/:id/file",        protect, uploadImageOrPdf.single("file"), c.uploadFile);

module.exports = router;
