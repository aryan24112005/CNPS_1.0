"use strict";
const { GalleryAlbum, GalleryImage } = require("../models/sql");
const { serializeAlbum } = require("../utils/serializers");
const { generateUniqueSlug } = require("../utils/slug");
const { uploadGalleryImage, deleteMediaByUrl } = require("../services/mediaService");
const { Op } = require("sequelize");

const getAll = async (req, res) => {
  try {
    const items = await GalleryAlbum.findAll({
      include: [{ model: GalleryImage, as: "images" }],
      order: [["sortOrder", "ASC"], ["createdAt", "DESC"]],
    });
    return res.json({ success: true, data: items.map(serializeAlbum) });
  } catch (err) { return res.status(500).json({ success: false, message: "Failed to fetch gallery." }); }
};

const getPublic = async (req, res) => {
  try {
    const items = await GalleryAlbum.findAll({
      where: { status: "active" },
      include: [{ model: GalleryImage, as: "images" }],
      order: [["sortOrder", "ASC"], ["createdAt", "DESC"]],
    });
    return res.json({ success: true, data: items.map(serializeAlbum) });
  } catch (err) { return res.status(500).json({ success: false, message: "Failed to fetch gallery." }); }
};

const getOne = async (req, res) => {
  try {
    const item = await GalleryAlbum.findByPk(req.params.id, { include: [{ model: GalleryImage, as: "images" }] });
    if (!item) return res.status(404).json({ success: false, message: "Album not found." });
    return res.json({ success: true, data: serializeAlbum(item) });
  } catch (err) { return res.status(500).json({ success: false, message: "Failed to fetch album." }); }
};

const getBySlug = async (req, res) => {
  try {
    const item = await GalleryAlbum.findOne({
      where: { slug: req.params.slug, status: "active" },
      include: [{ model: GalleryImage, as: "images" }],
    });
    if (!item) return res.status(404).json({ success: false, message: "Album not found." });
    return res.json({ success: true, data: serializeAlbum(item) });
  } catch (err) { return res.status(500).json({ success: false, message: "Failed to fetch album." }); }
};

const create = async (req, res) => {
  try {
    const { title, description, category, status, sortOrder } = req.body;
    if (!title?.trim()) return res.status(400).json({ success: false, message: "Album title is required." });
    const slug = await generateUniqueSlug(GalleryAlbum, title.trim());
    const item = await GalleryAlbum.create({
      title: title.trim(), slug, description: description || "",
      category: (category || "general").toLowerCase(),
      status: (status || "active").toLowerCase(),
      sortOrder: Number(sortOrder) || 0,
    });
    const full = await GalleryAlbum.findByPk(item.id, { include: [{ model: GalleryImage, as: "images" }] });
    return res.status(201).json({ success: true, message: "Album created.", data: serializeAlbum(full) });
  } catch (err) {
    const isDev = process.env.NODE_ENV !== "production";
    return res.status(500).json({ success: false, message: isDev ? (err.message || "Failed to create album.") : "Failed to create album." });
  }
};

const update = async (req, res) => {
  try {
    const item = await GalleryAlbum.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Album not found." });
    const { title, description, category, status, sortOrder } = req.body;
    if (!title?.trim()) return res.status(400).json({ success: false, message: "Album title is required." });
    let slug = item.slug;
    if (title.trim() !== item.title) slug = await generateUniqueSlug(GalleryAlbum, title.trim(), item.id);
    await item.update({
      title: title.trim(), slug,
      description: description ?? item.description,
      category: category ? category.toLowerCase() : item.category,
      status: status ? status.toLowerCase() : item.status,
      sortOrder: sortOrder !== undefined ? Number(sortOrder) : item.sortOrder,
    });
    const full = await GalleryAlbum.findByPk(item.id, { include: [{ model: GalleryImage, as: "images" }] });
    return res.json({ success: true, message: "Album updated.", data: serializeAlbum(full) });
  } catch (err) { return res.status(500).json({ success: false, message: err.message || "Failed to update album." }); }
};

const remove = async (req, res) => {
  try {
    const item = await GalleryAlbum.findByPk(req.params.id, { include: [{ model: GalleryImage, as: "images" }] });
    if (!item) return res.status(404).json({ success: false, message: "Album not found." });
    if (item.coverImageUrl) await deleteMediaByUrl(item.coverImageUrl);
    for (const img of item.images) { if (img.url) await deleteMediaByUrl(img.url); }
    await item.destroy();
    return res.json({ success: true, message: "Album deleted." });
  } catch (err) { return res.status(500).json({ success: false, message: "Failed to delete album." }); }
};

const uploadCover = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No image provided." });
    const item = await GalleryAlbum.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Album not found." });
    if (item.coverImageUrl) await deleteMediaByUrl(item.coverImageUrl);
    const { url, publicId } = await uploadGalleryImage(req.file.buffer, req.file.mimetype, req.file.originalname);
    await item.update({ coverImageUrl: url, coverImagePublicId: publicId });
    return res.json({ success: true, message: "Cover uploaded.", data: { url, publicId } });
  } catch (err) { return res.status(500).json({ success: false, message: err.message || "Failed to upload cover." }); }
};

const addImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ success: false, message: "No images provided." });
    const item = await GalleryAlbum.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Album not found." });
    const existingCount = await GalleryImage.count({ where: { albumId: item.id } });
    const uploaded = [];
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const { url, publicId } = await uploadGalleryImage(file.buffer, file.mimetype, file.originalname);
      await GalleryImage.create({ albumId: item.id, url, publicId, caption: "", sortOrder: existingCount + i });
      uploaded.push({ url, publicId });
    }
    return res.json({ success: true, message: `${uploaded.length} image(s) uploaded.`, data: uploaded });
  } catch (err) { return res.status(500).json({ success: false, message: err.message || "Failed to upload images." }); }
};

const deleteImage = async (req, res) => {
  try {
    const img = await GalleryImage.findOne({ where: { id: req.params.imageId, albumId: req.params.id } });
    if (!img) return res.status(404).json({ success: false, message: "Image not found." });
    if (img.url) await deleteMediaByUrl(img.url);
    await img.destroy();
    return res.json({ success: true, message: "Image deleted." });
  } catch (err) { return res.status(500).json({ success: false, message: "Failed to delete image." }); }
};

module.exports = { getAll, getPublic, getOne, getBySlug, create, update, remove, uploadCover, addImages, deleteImage };
