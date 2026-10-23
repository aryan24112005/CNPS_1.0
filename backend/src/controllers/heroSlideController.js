"use strict";
const { HeroSlide } = require("../models/sql");
const { serializeHeroSlide } = require("../utils/serializers");
const { uploadHeroImage, deleteMediaByUrl } = require("../services/mediaService");

const getAll = async (req, res) => {
  try {
    const items = await HeroSlide.findAll({ order: [["sortOrder", "ASC"], ["createdAt", "ASC"]] });
    return res.json({ success: true, data: items.map(serializeHeroSlide) });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch hero slides." });
  }
};

const getPublic = async (req, res) => {
  try {
    const items = await HeroSlide.findAll({
      where: { status: "active" },
      order: [["sortOrder", "ASC"], ["createdAt", "ASC"]],
    });
    return res.json({ success: true, data: items.map(serializeHeroSlide) });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch hero slides." });
  }
};

const getOne = async (req, res) => {
  try {
    const item = await HeroSlide.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Slide not found." });
    return res.json({ success: true, data: serializeHeroSlide(item) });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch slide." });
  }
};

const create = async (req, res) => {
  try {
    const { title, subtitle, description, buttonText, buttonUrl, status, sortOrder } = req.body;
    const item = await HeroSlide.create({
      title, subtitle, description, buttonText,
      buttonUrl: buttonUrl || "/admission",
      status: status || "active",
      sortOrder: Number(sortOrder) || 0,
    });
    return res.status(201).json({ success: true, message: "Slide created.", data: serializeHeroSlide(item) });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to create slide." });
  }
};

const update = async (req, res) => {
  try {
    const item = await HeroSlide.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Slide not found." });
    const { title, subtitle, description, buttonText, buttonUrl, status, sortOrder } = req.body;
    await item.update({
      title, subtitle, description, buttonText,
      buttonUrl: buttonUrl || item.buttonUrl,
      status: status || item.status,
      sortOrder: sortOrder !== undefined ? Number(sortOrder) : item.sortOrder,
    });
    return res.json({ success: true, message: "Slide updated.", data: serializeHeroSlide(item) });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to update slide." });
  }
};

const remove = async (req, res) => {
  try {
    const item = await HeroSlide.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Slide not found." });
    if (item.imageUrl) await deleteMediaByUrl(item.imageUrl);
    await item.destroy();
    return res.json({ success: true, message: "Slide deleted." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to delete slide." });
  }
};

const uploadImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No image provided." });
    const item = await HeroSlide.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Slide not found." });
    if (item.imageUrl) await deleteMediaByUrl(item.imageUrl);
    const { url, publicId } = await uploadHeroImage(req.file.buffer, req.file.mimetype, req.file.originalname);
    await item.update({ imageUrl: url, imagePublicId: publicId });
    return res.json({ success: true, message: "Image uploaded.", data: { url, publicId } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || "Failed to upload image." });
  }
};

module.exports = { getAll, getPublic, getOne, create, update, remove, uploadImage };
