"use strict";
const { Notice } = require("../models/sql");
const { serializeNotice } = require("../utils/serializers");
const { generateUniqueSlug } = require("../utils/slug");
const { uploadNoticeFile, deleteMediaByUrl } = require("../services/mediaService");

const getAll = async (req, res) => {
  try {
    const items = await Notice.findAll({ order: [["sortOrder", "ASC"], ["createdAt", "DESC"]] });
    return res.json({ success: true, data: items.map(serializeNotice) });
  } catch (err) { return res.status(500).json({ success: false, message: "Failed to fetch notices." }); }
};

const getPublic = async (req, res) => {
  try {
    const items = await Notice.findAll({ where: { status: "active" }, order: [["sortOrder", "ASC"], ["createdAt", "DESC"]] });
    return res.json({ success: true, data: items.map(serializeNotice) });
  } catch (err) { return res.status(500).json({ success: false, message: "Failed to fetch notices." }); }
};

const getBySlug = async (req, res) => {
  try {
    const item = await Notice.findOne({ where: { slug: req.params.slug, status: "active" } });
    if (!item) return res.status(404).json({ success: false, message: "Notice not found." });
    return res.json({ success: true, data: serializeNotice(item) });
  } catch (err) { return res.status(500).json({ success: false, message: "Failed to fetch notice." }); }
};

const getOne = async (req, res) => {
  try {
    const item = await Notice.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Notice not found." });
    return res.json({ success: true, data: serializeNotice(item) });
  } catch (err) { return res.status(500).json({ success: false, message: "Failed to fetch notice." }); }
};

const create = async (req, res) => {
  try {
    const { title, content, status, sortOrder } = req.body;
    if (!title?.trim()) return res.status(400).json({ success: false, message: "Notice title is required." });
    const slug = await generateUniqueSlug(Notice, title.trim());
    const item = await Notice.create({ title: title.trim(), slug, content, status: status || "active", sortOrder: Number(sortOrder) || 0 });
    return res.status(201).json({ success: true, message: "Notice created.", data: serializeNotice(item) });
  } catch (err) { return res.status(500).json({ success: false, message: "Failed to create notice." }); }
};

const update = async (req, res) => {
  try {
    const item = await Notice.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Notice not found." });
    const { title, content, status, sortOrder } = req.body;
    if (!title?.trim()) return res.status(400).json({ success: false, message: "Notice title is required." });
    let slug = item.slug;
    if (title.trim() !== item.title) slug = await generateUniqueSlug(Notice, title.trim(), item.id);
    await item.update({ title: title.trim(), slug, content, status: status || item.status, sortOrder: sortOrder !== undefined ? Number(sortOrder) : item.sortOrder });
    return res.json({ success: true, message: "Notice updated.", data: serializeNotice(item) });
  } catch (err) { return res.status(500).json({ success: false, message: "Failed to update notice." }); }
};

const remove = async (req, res) => {
  try {
    const item = await Notice.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Notice not found." });
    if (item.fileUrl) await deleteMediaByUrl(item.fileUrl);
    await item.destroy();
    return res.json({ success: true, message: "Notice deleted." });
  } catch (err) { return res.status(500).json({ success: false, message: "Failed to delete notice." }); }
};

const uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file provided." });
    const item = await Notice.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Notice not found." });
    if (item.fileUrl) await deleteMediaByUrl(item.fileUrl);
    const { url, publicId } = await uploadNoticeFile(req.file.buffer, req.file.mimetype, req.file.originalname);
    const isPdf = req.file.mimetype === "application/pdf";
    await item.update({ fileUrl: url, filePublicId: publicId, fileResourceType: isPdf ? "raw" : "image" });
    return res.json({ success: true, message: "File uploaded.", data: { url, publicId } });
  } catch (err) { return res.status(500).json({ success: false, message: err.message || "Failed to upload file." }); }
};

module.exports = { getAll, getPublic, getOne, getBySlug, create, update, remove, uploadFile };
