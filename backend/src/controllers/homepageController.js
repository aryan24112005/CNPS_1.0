"use strict";
const { HomepageContent, CountStat } = require("../models/sql");
const { serializeHomepageContent } = require("../utils/serializers");
const { uploadAboutImage, deleteMediaByUrl } = require("../services/mediaService");
const { sequelize } = require("../models/sql");

const ICON_MAP = {
  Students: "bi-people-fill",
  Events:   "bi-calendar-event-fill",
  Faculty:  "bi-mortarboard-fill",
  Courses:  "bi-book-fill",
};

const getSingleton = async () => {
  let doc = await HomepageContent.findOne();
  if (!doc) {
    doc = await HomepageContent.create({});
  }
  return doc;
};

const get = async (req, res) => {
  try {
    const doc = await getSingleton();
    const countStats = await CountStat.findAll({
      where: { homepageContentId: doc.id },
      order: [["sortOrder", "ASC"]],
    });
    return res.json({ success: true, data: serializeHomepageContent(doc, countStats) });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch homepage content." });
  }
};

const update = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const doc = await getSingleton();
    const allowed = ["aboutHeading","aboutSubheading","aboutDescription","aboutPoints",
                     "whyUsHeading","whyUsDescription",
                     "ctaHeading","ctaDescription","ctaButtonText","ctaButtonUrl"];

    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) {
        if (key === "aboutPoints" && typeof req.body[key] === "string") {
          updates[key] = JSON.parse(req.body[key]);
        } else {
          updates[key] = req.body[key];
        }
      }
    });

    if (Object.keys(updates).length > 0) {
      await doc.update(updates, { transaction: t });
    }

    // Handle countStats — replace all stats
    if (req.body.countStats !== undefined) {
      const stats = typeof req.body.countStats === "string" ? JSON.parse(req.body.countStats) : req.body.countStats;

      if (Array.isArray(stats)) {
        // Delete existing stats
        await CountStat.destroy({ where: { homepageContentId: doc.id }, transaction: t });

        // Insert new stats
        for (const s of stats) {
          const cat = s.category || "";
          const icon = ICON_MAP[cat] || s.icon || "bi-star-fill";
          await CountStat.create({
            homepageContentId: doc.id,
            category: cat || "Students",
            icon,
            value: Math.max(0, Number(s.value) || 0),
            label: s.label || "",
            suffix: s.suffix || "+",
            sortOrder: Number(s.sortOrder) || 0,
          }, { transaction: t });
        }
      }
    }

    await t.commit();
    await doc.reload();
    const countStats = await CountStat.findAll({
      where: { homepageContentId: doc.id },
      order: [["sortOrder", "ASC"]],
    });
    return res.json({ success: true, message: "Homepage content updated.", data: serializeHomepageContent(doc, countStats) });
  } catch (err) {
    await t.rollback();
    console.error("Homepage update error:", err.message);
    return res.status(500).json({ success: false, message: "Failed to update homepage content." });
  }
};

const uploadAboutImg = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No image provided." });
    const doc = await getSingleton();
    if (doc.aboutImageUrl) await deleteMediaByUrl(doc.aboutImageUrl);
    const { url, publicId } = await uploadAboutImage(req.file.buffer, req.file.mimetype, req.file.originalname);
    await doc.update({ aboutImageUrl: url, aboutImagePublicId: publicId });
    return res.json({ success: true, message: "About image uploaded.", data: { url, publicId } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || "Failed to upload image." });
  }
};

module.exports = { get, update, uploadAboutImg };
