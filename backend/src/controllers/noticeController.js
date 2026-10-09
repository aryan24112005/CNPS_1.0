"use strict";
const Notice = require("../models/Notice");
const { uploadNoticeFile, deleteByPublicId } = require("../services/cloudinaryService");

const getAll = async (req, res) => {
  try {
    const items = await Notice.find().sort({ sortOrder: 1, createdAt: -1 });
    return res.json({ success: true, data: items });
  } catch (err) { return res.status(500).json({ success: false, message: "Failed to fetch notices." }); }
};

const getPublic = async (req, res) => {
  try {
    const items = await Notice.find({ status: "active" }).sort({ sortOrder: 1, createdAt: -1 });
    return res.json({ success: true, data: items });
  } catch (err) { return res.status(500).json({ success: false, message: "Failed to fetch notices." }); }
};

const getBySlug = async (req, res) => {
  try {
    const item = await Notice.findOne({ slug: req.params.slug, status: "active" });
    if (!item) return res.status(404).json({ success: false, message: "Notice not found." });
    return res.json({ success: true, data: item });
  } catch (err) { return res.status(500).json({ success: false, message: "Failed to fetch notice." }); }
};

const getOne = async (req, res) => {
  try {
    const item = await Notice.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Notice not found." });
    return res.json({ success: true, data: item });
  } catch (err) { return res.status(500).json({ success: false, message: "Failed to fetch notice." }); }
};

const create = async (req, res) => {
  try {
    const { title, content, status, sortOrder } = req.body;
    if (!title?.trim()) return res.status(400).json({ success: false, message: "Notice title is required." });
    const item = await Notice.create({ title: title.trim(), content, status: status || "active", sortOrder: Number(sortOrder) || 0 });
    return res.status(201).json({ success: true, message: "Notice created.", data: item });
  } catch (err) { return res.status(500).json({ success: false, message: "Failed to create notice." }); }
};

const update = async (req, res) => {
  try {
    const item = await Notice.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Notice not found." });
    const { title, content, status, sortOrder } = req.body;
    if (!title?.trim()) return res.status(400).json({ success: false, message: "Notice title is required." });
    Object.assign(item, { title: title.trim(), content, status: status || item.status, sortOrder: sortOrder !== undefined ? Number(sortOrder) : item.sortOrder });
    await item.save();
    return res.json({ success: true, message: "Notice updated.", data: item });
  } catch (err) { return res.status(500).json({ success: false, message: "Failed to update notice." }); }
};

const remove = async (req, res) => {
  try {
    const item = await Notice.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Notice not found." });
    if (item.file?.publicId) await deleteByPublicId(item.file.publicId, item.file.resourceType === "raw" ? "raw" : "image");
    await item.deleteOne();
    return res.json({ success: true, message: "Notice deleted." });
  } catch (err) { return res.status(500).json({ success: false, message: "Failed to delete notice." }); }
};

const uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file provided." });
    const item = await Notice.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Notice not found." });
    if (item.file?.publicId) await deleteByPublicId(item.file.publicId, item.file.resourceType === "raw" ? "raw" : "image");
    const { url, publicId } = await uploadNoticeFile(req.file.buffer, req.file.mimetype, req.file.originalname);
    const isPdf = req.file.mimetype === "application/pdf";
    item.file = { url, publicId, resourceType: isPdf ? "raw" : "image" };
    await item.save();
    return res.json({ success: true, message: "File uploaded.", data: { url, publicId } });
  } catch (err) { return res.status(500).json({ success: false, message: err.message || "Failed to upload file." }); }
};

module.exports = { getAll, getPublic, getOne, getBySlug, create, update, remove, uploadFile };
