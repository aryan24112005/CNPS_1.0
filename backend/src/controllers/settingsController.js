"use strict";
const { SiteSettings } = require("../models/sql");
const { serializeSettings, imgObj } = require("../utils/serializers");
const { uploadSettingsImage, deleteMediaByUrl } = require("../services/mediaService");

const getSingleton = async () => {
  let doc = await SiteSettings.findOne();
  if (!doc) {
    doc = await SiteSettings.create({ schoolName: "CNPS Public School" });
  }
  return doc;
};

/**
 * Safely extract the aboutImages array from a settings row.
 * Sequelize may return a JSON column as a string rather than a parsed array
 * depending on the MySQL2 driver version. We handle both cases here.
 */
function parseAboutImages(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

const get = async (req, res) => {
  try {
    const doc = await getSingleton();
    return res.json({ success: true, data: serializeSettings(doc) });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch settings." });
  }
};

const update = async (req, res) => {
  try {
    const doc = await getSingleton();
    const allowed = [
      "schoolName","tagline","description","address","phone","phone2","email","mapEmbedUrl",
      "principalName","principalMessage","footerAbout","footerCopyright",
      "aboutHeading","aboutDescription","aboutMission","aboutVision","aboutValues",
    ];

    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    });

    // Handle socialLinks nested object
    if (req.body.socialLinks !== undefined) {
      const sl = typeof req.body.socialLinks === "string" ? JSON.parse(req.body.socialLinks) : req.body.socialLinks;
      if (sl) {
        if (sl.facebook  !== undefined) updates.facebookUrl  = sl.facebook;
        if (sl.instagram !== undefined) updates.instagramUrl = sl.instagram;
        if (sl.youtube   !== undefined) updates.youtubeUrl   = sl.youtube;
        if (sl.twitter   !== undefined) updates.twitterUrl   = sl.twitter;
        if (sl.linkedin  !== undefined) updates.linkedinUrl  = sl.linkedin;
      }
    }

    if (Object.keys(updates).length > 0) {
      await doc.update(updates);
      await doc.reload();
    }

    return res.json({ success: true, message: "Settings updated.", data: serializeSettings(doc) });
  } catch (err) {
    console.error("Settings update error:", err.message);
    return res.status(500).json({ success: false, message: "Failed to update settings." });
  }
};

const uploadLogo = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No image provided." });
    const doc = await getSingleton();
    if (doc.logoUrl) await deleteMediaByUrl(doc.logoUrl);
    const { url, publicId } = await uploadSettingsImage(req.file.buffer, req.file.mimetype, req.file.originalname);
    await doc.update({ logoUrl: url, logoPublicId: publicId });
    return res.json({ success: true, message: "Logo uploaded.", data: { url, publicId } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || "Failed to upload logo." });
  }
};

const uploadFavicon = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No image provided." });
    const doc = await getSingleton();
    if (doc.faviconUrl) await deleteMediaByUrl(doc.faviconUrl);
    const { url, publicId } = await uploadSettingsImage(req.file.buffer, req.file.mimetype, req.file.originalname);
    await doc.update({ faviconUrl: url, faviconPublicId: publicId });
    return res.json({ success: true, message: "Favicon uploaded.", data: { url, publicId } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || "Failed to upload favicon." });
  }
};

const deleteAboutImage = async (req, res) => {
  try {
    const doc = await getSingleton();
    const field = req.params.field;

    if (field.startsWith("idx_")) {
      const idx = parseInt(field.replace("idx_", ""), 10);
      // Use parseAboutImages to handle both string and array returns from Sequelize
      const aboutImages = parseAboutImages(doc.aboutImages);
      if (isNaN(idx) || idx < 0 || idx >= aboutImages.length) {
        return res.status(400).json({
          success: false,
          message: `Invalid image index (${idx}). The gallery currently has ${aboutImages.length} image(s). Please refresh the page and try again.`,
        });
      }
      const img = aboutImages[idx];
      const imgUrl = typeof img === "string" ? img : (img.url || img.imageUrl || "");
      if (imgUrl) await deleteMediaByUrl(imgUrl);
      aboutImages.splice(idx, 1);
      await doc.update({ aboutImages });
    } else if (["aboutImage1","aboutImage2","aboutImage3"].includes(field)) {
      const urlField = field + "Url";
      const pidField = field + "PublicId";
      if (doc[urlField]) await deleteMediaByUrl(doc[urlField]);
      await doc.update({ [urlField]: "", [pidField]: "" });
    } else {
      return res.status(400).json({ success: false, message: "Invalid image field." });
    }

    await doc.reload();
    return res.json({ success: true, message: "Image removed." });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || "Failed to remove image." });
  }
};

const uploadAboutImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No image provided." });
    const doc = await getSingleton();
    const field = req.params.field;

    if (field === "new") {
      const aboutImages = parseAboutImages(doc.aboutImages);
      if (aboutImages.length >= 20) {
        return res.status(400).json({ success: false, message: "Maximum 20 about-page images allowed." });
      }
      const { url, publicId } = await uploadSettingsImage(req.file.buffer, req.file.mimetype, req.file.originalname);
      aboutImages.push({ url, publicId });
      await doc.update({ aboutImages });
      return res.json({ success: true, message: "Image uploaded.", data: { url, publicId, index: aboutImages.length - 1 } });
    } else if (["aboutImage1","aboutImage2","aboutImage3"].includes(field)) {
      const urlField = field + "Url";
      const pidField = field + "PublicId";
      if (doc[urlField]) await deleteMediaByUrl(doc[urlField]);
      const { url, publicId } = await uploadSettingsImage(req.file.buffer, req.file.mimetype, req.file.originalname);
      await doc.update({ [urlField]: url, [pidField]: publicId });
      return res.json({ success: true, message: "Image uploaded.", data: { url, publicId } });
    } else {
      return res.status(400).json({ success: false, message: "Invalid image field." });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || "Failed to upload image." });
  }
};

module.exports = { get, update, uploadLogo, uploadFavicon, uploadAboutImage, deleteAboutImage };
