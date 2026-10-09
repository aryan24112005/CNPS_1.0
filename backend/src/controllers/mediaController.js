"use strict";
const Media = require("../models/Media");
const { uploadMediaLibraryFile, deleteByPublicId } = require("../services/cloudinaryService");

const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 30, search } = req.query;
    const filter = search ? { originalName: { $regex: search, $options: "i" } } : {};
    const total = await Media.countDocuments(filter);
    const items = await Media.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
    return res.json({ success: true, data: items, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch { return res.status(500).json({ success: false, message: "Failed to fetch media." }); }
};

const upload = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file provided." });
    const { url, publicId } = await uploadMediaLibraryFile(req.file.buffer, req.file.mimetype, req.file.originalname);
    const isPdf = req.file.mimetype === "application/pdf";
    const item = await Media.create({
      originalName: req.file.originalname,
      url, publicId,
      resourceType: isPdf ? "raw" : "image",
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.admin?.id,
    });
    return res.status(201).json({ success: true, message: "File uploaded.", data: item });
  } catch (err) { return res.status(500).json({ success: false, message: err.message || "Failed to upload file." }); }
};

const remove = async (req, res) => {
  try {
    const item = await Media.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Media not found." });
    await deleteByPublicId(item.publicId, item.resourceType === "raw" ? "raw" : "image");
    await item.deleteOne();
    return res.json({ success: true, message: "Media deleted." });
  } catch { return res.status(500).json({ success: false, message: "Failed to delete media." }); }
};

module.exports = { getAll, upload, remove };
