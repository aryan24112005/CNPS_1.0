"use strict";
const { Media } = require("../models/sql");
const { serializeMedia } = require("../utils/serializers");
const { uploadMediaLibraryFile, deleteMediaByUrl } = require("../services/mediaService");
const { Op } = require("sequelize");

// GET /api/media  — list media metadata (no binary data returned)
const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 30, search } = req.query;
    const where = {};
    if (search && search.trim()) {
      where.originalName = { [Op.like]: `%${search.trim()}%` };
    }
    const total = await Media.count({ where });
    const items = await Media.findAll({
      where,
      order: [["createdAt", "DESC"]],
      offset: (Number(page) - 1) * Number(limit),
      limit: Number(limit),
      attributes: { exclude: ["fileData"] }, // Don't load BLOB in list
    });
    return res.json({ success: true, data: items.map(serializeMedia), total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (err) { return res.status(500).json({ success: false, message: "Failed to fetch media." }); }
};

// POST /api/media  — upload file to MySQL BLOB
const upload = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file provided." });
    const { url, publicId, mediaId } = await uploadMediaLibraryFile(req.file.buffer, req.file.mimetype, req.file.originalname);
    const isPdf = req.file.mimetype === "application/pdf";
    const item = await Media.findByPk(mediaId, { attributes: { exclude: ["fileData"] } });
    return res.status(201).json({ success: true, message: "File uploaded.", data: serializeMedia(item) });
  } catch (err) { return res.status(500).json({ success: false, message: err.message || "Failed to upload file." }); }
};

// DELETE /api/media/:id
const remove = async (req, res) => {
  try {
    const item = await Media.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Media not found." });
    await item.destroy();
    return res.json({ success: true, message: "Media deleted." });
  } catch (err) { return res.status(500).json({ success: false, message: "Failed to delete media." }); }
};

// GET /api/media/:id  — serve binary data (public endpoint for images)
const serveMedia = async (req, res) => {
  try {
    const item = await Media.findByPk(req.params.id, { attributes: ["id", "fileData", "mimeType", "originalName", "resourceType"] });
    if (!item || !item.fileData) return res.status(404).json({ success: false, message: "Media not found." });

    const mimeType = item.mimeType || "application/octet-stream";
    res.setHeader("Content-Type", mimeType);
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.setHeader("X-Content-Type-Options", "nosniff");

    // For PDFs, suggest download; for images, inline display
    if (item.resourceType === "raw" || mimeType === "application/pdf") {
      res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(item.originalName || "file.pdf")}"`);
    }

    return res.send(item.fileData);
  } catch (err) {
    return res.status(404).json({ success: false, message: "Media not found." });
  }
};

module.exports = { getAll, upload, remove, serveMedia };
