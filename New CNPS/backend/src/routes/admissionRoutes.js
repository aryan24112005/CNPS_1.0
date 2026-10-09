"use strict";
const router = require("express").Router();
const c = require("../controllers/admissionController");
const { protect } = require("../middleware/auth");

router.post("/",            c.submit);          // public form submission

router.get("/admin",        protect, c.getAll);
router.get("/admin/:id",    protect, c.getOne);
router.patch("/admin/:id",  protect, c.updateStatus);
router.delete("/admin/:id", protect, c.remove);

module.exports = router;
