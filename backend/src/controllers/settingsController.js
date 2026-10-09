"use strict";
const SiteSettings = require("../models/SiteSettings");
const { uploadSettingsImage, deleteByPublicId } = require("../services/cloudinaryService");

const getSingleton = async () => {
  let doc = await SiteSettings.findOne();
  if (!doc) doc = await SiteSettings.create({});
  return doc;
};

const get = async (req, res) => {
  try { return res.json({ success: true, data: await getSingleton() }); }
  catch (err) { return res.status(500).json({ success: false, message: "Failed to fetch settings." }); }
};

const update = async (req, res) => {
  try {
    const doc = await getSingleton();
    const allowed = [
      "schoolName","tagline","address","phone","phone2","email","mapEmbedUrl",
      "principalName","principalMessage","socialLinks","footerAbout","footerCopyright",
      "aboutHeading","aboutDescription","aboutMission","aboutVision","aboutValues",
    ];
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) {
        if (key === "socialLinks" && typeof req.body[key] === "string") {
          doc[key] = JSON.parse(req.body[key]);
        } else {
          doc[key] = req.body[key];
        }
      }
    });
    await doc.save();
    return res.json({ success: true, message: "Settings updated.", data: doc });
  } catch (err) { return res.status(500).json({ success: false, message: "Failed to update settings." }); }
};

const uploadLogo = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No image provided." });
    const doc = await getSingleton();
    if (doc.logo?.publicId) await deleteByPublicId(doc.logo.publicId);
    const { url, publicId } = await uploadSettingsImage(req.file.buffer, req.file.mimetype, req.file.originalname);
    doc.logo = { url, publicId };
    await doc.save();
    return res.json({ success: true, message: "Logo uploaded.", data: { url, publicId } });
  } catch (err) { return res.status(500).json({ success: false, message: err.message || "Failed to upload logo." }); }
};

const uploadFavicon = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No image provided." });
    const doc = await getSingleton();
    if (doc.favicon?.publicId) await deleteByPublicId(doc.favicon.publicId);
    const { url, publicId } = await uploadSettingsImage(req.file.buffer, req.file.mimetype, req.file.originalname);
    doc.favicon = { url, publicId };
    await doc.save();
    return res.json({ success: true, message: "Favicon uploaded.", data: { url, publicId } });
  } catch (err) { return res.status(500).json({ success: false, message: err.message || "Failed to upload favicon." }); }
};

const deleteAboutImage = async (req, res) => {
  try {
    const doc = await getSingleton();
    const field = req.params.field;
    if (!["aboutImage1","aboutImage2","aboutImage3"].includes(field)) {
      return res.status(400).json({ success: false, message: "Invalid image field." });
    }
    if (doc[field]?.publicId) await deleteByPublicId(doc[field].publicId);
    doc[field] = { url: "", publicId: "" };
    await doc.save();
    return res.json({ success: true, message: "Image removed." });
  } catch (err) { return res.status(500).json({ success: false, message: err.message || "Failed to remove image." }); }
};

const uploadAboutImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No image provided." });
    const doc = await getSingleton();
    const field = req.params.field; // aboutImage1, aboutImage2, aboutImage3
    if (!["aboutImage1","aboutImage2","aboutImage3"].includes(field)) {
      return res.status(400).json({ success: false, message: "Invalid image field." });
    }
    if (doc[field]?.publicId) await deleteByPublicId(doc[field].publicId);
    const { url, publicId } = await uploadSettingsImage(req.file.buffer, req.file.mimetype, req.file.originalname);
    doc[field] = { url, publicId };
    await doc.save();
    return res.json({ success: true, message: "Image uploaded.", data: { url, publicId } });
  } catch (err) { return res.status(500).json({ success: false, message: err.message || "Failed to upload image." }); }
};

module.exports = { get, update, uploadLogo, uploadFavicon, uploadAboutImage, deleteAboutImage };
