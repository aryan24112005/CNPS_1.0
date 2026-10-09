"use strict";
const Faculty   = require("../models/Faculty");
const { uploadFacultyPhoto, deleteByPublicId } = require("../services/cloudinaryService");

// GET /api/faculty  (admin — all)
const getAll = async (req, res) => {
  try {
    const faculty = await Faculty.find().sort({ sortOrder: 1, createdAt: -1 });
    return res.json({ success: true, data: faculty });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch faculty." });
  }
};

// GET /api/public/faculty  (public — active only)
const getPublic = async (req, res) => {
  try {
    const faculty = await Faculty.find({ status: "active" }).sort({ sortOrder: 1, createdAt: -1 });
    return res.json({ success: true, data: faculty });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch faculty." });
  }
};

// GET /api/faculty/:id
const getOne = async (req, res) => {
  try {
    const item = await Faculty.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Faculty member not found." });
    return res.json({ success: true, data: item });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch faculty member." });
  }
};

// POST /api/faculty
const create = async (req, res) => {
  try {
    const { name, designation, qualification, experience, shortBio, bio,
            email, phone, facebook, instagram, linkedin, youtube, status, sortOrder } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Faculty name is required." });
    }

    const item = await Faculty.create({
      name: name.trim(), designation, qualification, experience,
      shortBio, bio, email, phone, facebook, instagram, linkedin, youtube,
      status: status || "active",
      sortOrder: Number(sortOrder) || 0,
    });

    return res.status(201).json({ success: true, message: "Faculty member created.", data: item });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to create faculty member." });
  }
};

// PUT /api/faculty/:id
const update = async (req, res) => {
  try {
    const item = await Faculty.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Faculty member not found." });

    const { name, designation, qualification, experience, shortBio, bio,
            email, phone, facebook, instagram, linkedin, youtube, status, sortOrder } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Faculty name is required." });
    }

    Object.assign(item, {
      name: name.trim(), designation, qualification, experience,
      shortBio, bio, email, phone, facebook, instagram, linkedin, youtube,
      status: status || item.status,
      sortOrder: sortOrder !== undefined ? Number(sortOrder) : item.sortOrder,
    });

    await item.save();
    return res.json({ success: true, message: "Faculty member updated.", data: item });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to update faculty member." });
  }
};

// DELETE /api/faculty/:id
const remove = async (req, res) => {
  try {
    const item = await Faculty.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Faculty member not found." });

    if (item.photo && item.photo.publicId) {
      await deleteByPublicId(item.photo.publicId);
    }

    await item.deleteOne();
    return res.json({ success: true, message: "Faculty member deleted." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to delete faculty member." });
  }
};

// POST /api/faculty/:id/photo
const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No image file provided." });

    const item = await Faculty.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Faculty member not found." });

    // Delete old photo from Cloudinary
    if (item.photo && item.photo.publicId) {
      await deleteByPublicId(item.photo.publicId);
    }

    const { url, publicId } = await uploadFacultyPhoto(req.file.buffer, req.file.mimetype, req.file.originalname);
    item.photo = { url, publicId };
    await item.save();

    return res.json({ success: true, message: "Photo uploaded.", data: { url, publicId } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || "Failed to upload photo." });
  }
};

module.exports = { getAll, getPublic, getOne, create, update, remove, uploadPhoto };
