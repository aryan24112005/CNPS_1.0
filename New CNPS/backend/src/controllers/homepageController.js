"use strict";
const HomepageContent = require("../models/HomepageContent");
const { uploadAboutImage, deleteByPublicId } = require("../services/cloudinaryService");

const getSingleton = async () => {
  let doc = await HomepageContent.findOne();
  if (!doc) doc = await HomepageContent.create({});
  return doc;
};

const get = async (req, res) => {
  try {
    const doc = await getSingleton();
    return res.json({ success: true, data: doc });
  } catch (err) { return res.status(500).json({ success: false, message: "Failed to fetch homepage content." }); }
};

const update = async (req, res) => {
  try {
    const doc = await getSingleton();
    const allowed = ["aboutHeading","aboutSubheading","aboutDescription","aboutPoints",
                     "whyUsHeading","whyUsDescription","countStats",
                     "ctaHeading","ctaDescription","ctaButtonText","ctaButtonUrl"];
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) {
        if ((key === "aboutPoints" || key === "countStats") && typeof req.body[key] === "string") {
          doc[key] = JSON.parse(req.body[key]);
        } else {
          doc[key] = req.body[key];
        }
      }
    });
    await doc.save();
    return res.json({ success: true, message: "Homepage content updated.", data: doc });
  } catch (err) { return res.status(500).json({ success: false, message: "Failed to update homepage content." }); }
};

const uploadAboutImg = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No image provided." });
    const doc = await getSingleton();
    if (doc.aboutImage?.publicId) await deleteByPublicId(doc.aboutImage.publicId);
    const { url, publicId } = await uploadAboutImage(req.file.buffer, req.file.mimetype, req.file.originalname);
    doc.aboutImage = { url, publicId };
    await doc.save();
    return res.json({ success: true, message: "About image uploaded.", data: { url, publicId } });
  } catch (err) { return res.status(500).json({ success: false, message: err.message || "Failed to upload image." }); }
};

module.exports = { get, update, uploadAboutImg };
