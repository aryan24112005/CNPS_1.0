"use strict";
const Testimonial = require("../models/Testimonial");
const { uploadTestimonialAvatar, deleteByPublicId } = require("../services/cloudinaryService");

const getAll    = async (req, res) => { try { const items = await Testimonial.find().sort({ sortOrder: 1, createdAt: -1 }); return res.json({ success: true, data: items }); } catch { return res.status(500).json({ success: false, message: "Failed to fetch testimonials." }); } };
const getPublic = async (req, res) => { try { const items = await Testimonial.find({ status: "approved" }).sort({ sortOrder: 1, createdAt: -1 }); return res.json({ success: true, data: items }); } catch { return res.status(500).json({ success: false, message: "Failed to fetch testimonials." }); } };
const getOne    = async (req, res) => { try { const item = await Testimonial.findById(req.params.id); if (!item) return res.status(404).json({ success: false, message: "Testimonial not found." }); return res.json({ success: true, data: item }); } catch { return res.status(500).json({ success: false, message: "Failed to fetch testimonial." }); } };

const create = async (req, res) => {
  try {
    const { name, designation, content, rating, status, sortOrder } = req.body;
    if (!name?.trim() || !content?.trim()) return res.status(400).json({ success: false, message: "Name and testimonial content are required." });
    const item = await Testimonial.create({ name: name.trim(), designation, content: content.trim(), rating: Number(rating) || 5, status: status || "pending", sortOrder: Number(sortOrder) || 0 });
    return res.status(201).json({ success: true, message: "Testimonial created.", data: item });
  } catch (err) { return res.status(500).json({ success: false, message: "Failed to create testimonial." }); }
};

const update = async (req, res) => {
  try {
    const item = await Testimonial.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Testimonial not found." });
    const { name, designation, content, rating, status, sortOrder } = req.body;
    if (!name?.trim() || !content?.trim()) return res.status(400).json({ success: false, message: "Name and content are required." });
    Object.assign(item, { name: name.trim(), designation, content: content.trim(), rating: Number(rating) || item.rating, status: status || item.status, sortOrder: sortOrder !== undefined ? Number(sortOrder) : item.sortOrder });
    await item.save();
    return res.json({ success: true, message: "Testimonial updated.", data: item });
  } catch (err) { return res.status(500).json({ success: false, message: "Failed to update testimonial." }); }
};

const remove = async (req, res) => {
  try {
    const item = await Testimonial.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Testimonial not found." });
    if (item.avatar?.publicId) await deleteByPublicId(item.avatar.publicId);
    await item.deleteOne();
    return res.json({ success: true, message: "Testimonial deleted." });
  } catch (err) { return res.status(500).json({ success: false, message: "Failed to delete testimonial." }); }
};

const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No image provided." });
    const item = await Testimonial.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Testimonial not found." });
    if (item.avatar?.publicId) await deleteByPublicId(item.avatar.publicId);
    const { url, publicId } = await uploadTestimonialAvatar(req.file.buffer, req.file.mimetype, req.file.originalname);
    item.avatar = { url, publicId };
    await item.save();
    return res.json({ success: true, message: "Avatar uploaded.", data: { url, publicId } });
  } catch (err) { return res.status(500).json({ success: false, message: err.message || "Failed to upload avatar." }); }
};

module.exports = { getAll, getPublic, getOne, create, update, remove, uploadAvatar };
