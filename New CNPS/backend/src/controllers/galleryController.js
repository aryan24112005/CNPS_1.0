"use strict";
const GalleryAlbum = require("../models/GalleryAlbum");
const { uploadGalleryImage, deleteByPublicId } = require("../services/cloudinaryService");

const getAll = async (req, res) => {
  try {
    const items = await GalleryAlbum.find().sort({ sortOrder: 1, createdAt: -1 });
    return res.json({ success: true, data: items });
  } catch (err) { return res.status(500).json({ success: false, message: "Failed to fetch gallery." }); }
};

const getPublic = async (req, res) => {
  try {
    // Case-insensitive match so albums saved with "Active" or "active" both appear
    const items = await GalleryAlbum.find({ status: { $regex: /^active$/i } }).sort({ sortOrder: 1, createdAt: -1 });
    return res.json({ success: true, data: items });
  } catch (err) { return res.status(500).json({ success: false, message: "Failed to fetch gallery." }); }
};

const getOne = async (req, res) => {
  try {
    const item = await GalleryAlbum.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Album not found." });
    return res.json({ success: true, data: item });
  } catch (err) { return res.status(500).json({ success: false, message: "Failed to fetch album." }); }
};

const getBySlug = async (req, res) => {
  try {
    const item = await GalleryAlbum.findOne({ slug: req.params.slug, status: { $regex: /^active$/i } });
    if (!item) return res.status(404).json({ success: false, message: "Album not found." });
    return res.json({ success: true, data: item });
  } catch (err) { return res.status(500).json({ success: false, message: "Failed to fetch album." }); }
};

const create = async (req, res) => {
  try {
    const { title, description, category, status, sortOrder } = req.body;
    if (!title?.trim()) return res.status(400).json({ success: false, message: "Album title is required." });
    const item = await GalleryAlbum.create({
      title:       title.trim(),
      description: description || "",
      category:    (category || "general").toLowerCase(),
      status:      (status   || "active").toLowerCase(),
      sortOrder:   Number(sortOrder) || 0,
    });
    return res.status(201).json({ success: true, message: "Album created.", data: item });
  } catch (err) {
    console.error("[Gallery] Create album failed:", err.message, err.code || "");
    const isDev = process.env.NODE_ENV !== "production";
    const msg = isDev ? (err.message || "Failed to create album.") : "Failed to create album.";
    return res.status(500).json({ success: false, message: msg });
  }
};

const update = async (req, res) => {
  try {
    const item = await GalleryAlbum.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Album not found." });
    const { title, description, category, status, sortOrder } = req.body;
    if (!title?.trim()) return res.status(400).json({ success: false, message: "Album title is required." });
    Object.assign(item, {
      title:       title.trim(),
      description: description ?? item.description,
      category:    category  ? category.toLowerCase()  : item.category,
      status:      status    ? status.toLowerCase()    : item.status,
      sortOrder:   sortOrder !== undefined ? Number(sortOrder) : item.sortOrder,
    });
    await item.save();
    return res.json({ success: true, message: "Album updated.", data: item });
  } catch (err) {
    console.error("[Gallery] Update album failed:", err.message);
    return res.status(500).json({ success: false, message: err.message || "Failed to update album." });
  }
};

const remove = async (req, res) => {
  try {
    const item = await GalleryAlbum.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Album not found." });
    if (item.coverImage?.publicId) await deleteByPublicId(item.coverImage.publicId);
    for (const img of item.images) { if (img.publicId) await deleteByPublicId(img.publicId); }
    await item.deleteOne();
    return res.json({ success: true, message: "Album deleted." });
  } catch (err) { return res.status(500).json({ success: false, message: "Failed to delete album." }); }
};

const uploadCover = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No image provided." });
    const item = await GalleryAlbum.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Album not found." });
    if (item.coverImage?.publicId) await deleteByPublicId(item.coverImage.publicId);
    const { url, publicId } = await uploadGalleryImage(req.file.buffer, req.file.mimetype, req.file.originalname);
    item.coverImage = { url, publicId };
    await item.save();
    return res.json({ success: true, message: "Cover uploaded.", data: { url, publicId } });
  } catch (err) { return res.status(500).json({ success: false, message: err.message || "Failed to upload cover." }); }
};

const addImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ success: false, message: "No images provided." });
    const item = await GalleryAlbum.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Album not found." });
    const uploaded = [];
    for (const file of req.files) {
      const { url, publicId } = await uploadGalleryImage(file.buffer, file.mimetype, file.originalname);
      item.images.push({ url, publicId, caption: "", sortOrder: item.images.length + uploaded.length });
      uploaded.push({ url, publicId });
    }
    await item.save();
    return res.json({ success: true, message: `${uploaded.length} image(s) uploaded.`, data: uploaded });
  } catch (err) { return res.status(500).json({ success: false, message: err.message || "Failed to upload images." }); }
};

const deleteImage = async (req, res) => {
  try {
    const item = await GalleryAlbum.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Album not found." });
    const idx = item.images.findIndex((i) => i._id.toString() === req.params.imageId);
    if (idx === -1) return res.status(404).json({ success: false, message: "Image not found." });
    const [img] = item.images.splice(idx, 1);
    if (img.publicId) await deleteByPublicId(img.publicId);
    await item.save();
    return res.json({ success: true, message: "Image deleted." });
  } catch (err) { return res.status(500).json({ success: false, message: "Failed to delete image." }); }
};

module.exports = { getAll, getPublic, getOne, getBySlug, create, update, remove, uploadCover, addImages, deleteImage };
