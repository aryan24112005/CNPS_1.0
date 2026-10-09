"use strict";
const HeroSlide = require("../models/HeroSlide");
const { uploadHeroImage, deleteByPublicId } = require("../services/cloudinaryService");

const getAll    = async (req, res) => { try { return res.json({ success: true, data: await HeroSlide.find().sort({ sortOrder: 1, createdAt: 1 }) }); } catch { return res.status(500).json({ success: false, message: "Failed to fetch hero slides." }); } };
const getPublic = async (req, res) => { try { return res.json({ success: true, data: await HeroSlide.find({ status: "active" }).sort({ sortOrder: 1, createdAt: 1 }) }); } catch { return res.status(500).json({ success: false, message: "Failed to fetch hero slides." }); } };
const getOne    = async (req, res) => { try { const item = await HeroSlide.findById(req.params.id); if (!item) return res.status(404).json({ success: false, message: "Slide not found." }); return res.json({ success: true, data: item }); } catch { return res.status(500).json({ success: false, message: "Failed to fetch slide." }); } };

const create = async (req, res) => {
  try {
    const { title, subtitle, description, buttonText, buttonUrl, status, sortOrder } = req.body;
    const item = await HeroSlide.create({ title, subtitle, description, buttonText, buttonUrl: buttonUrl || "/admission", status: status || "active", sortOrder: Number(sortOrder) || 0 });
    return res.status(201).json({ success: true, message: "Slide created.", data: item });
  } catch (err) { return res.status(500).json({ success: false, message: "Failed to create slide." }); }
};

const update = async (req, res) => {
  try {
    const item = await HeroSlide.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Slide not found." });
    const { title, subtitle, description, buttonText, buttonUrl, status, sortOrder } = req.body;
    Object.assign(item, { title, subtitle, description, buttonText, buttonUrl: buttonUrl || item.buttonUrl, status: status || item.status, sortOrder: sortOrder !== undefined ? Number(sortOrder) : item.sortOrder });
    await item.save();
    return res.json({ success: true, message: "Slide updated.", data: item });
  } catch (err) { return res.status(500).json({ success: false, message: "Failed to update slide." }); }
};

const remove = async (req, res) => {
  try {
    const item = await HeroSlide.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Slide not found." });
    if (item.image?.publicId) await deleteByPublicId(item.image.publicId);
    await item.deleteOne();
    return res.json({ success: true, message: "Slide deleted." });
  } catch (err) { return res.status(500).json({ success: false, message: "Failed to delete slide." }); }
};

const uploadImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No image provided." });
    const item = await HeroSlide.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Slide not found." });
    if (item.image?.publicId) await deleteByPublicId(item.image.publicId);
    const { url, publicId } = await uploadHeroImage(req.file.buffer, req.file.mimetype, req.file.originalname);
    item.image = { url, publicId };
    await item.save();
    return res.json({ success: true, message: "Image uploaded.", data: { url, publicId } });
  } catch (err) { return res.status(500).json({ success: false, message: err.message || "Failed to upload image." }); }
};

module.exports = { getAll, getPublic, getOne, create, update, remove, uploadImage };
