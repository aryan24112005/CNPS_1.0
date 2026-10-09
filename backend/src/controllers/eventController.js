"use strict";
const Event = require("../models/Event");
const { uploadEventImage, deleteByPublicId } = require("../services/cloudinaryService");

const getAll = async (req, res) => {
  try {
    const events = await Event.find().sort({ sortOrder: 1, eventDate: -1 });
    return res.json({ success: true, data: events });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch events." });
  }
};

const getPublic = async (req, res) => {
  try {
    const events = await Event.find({ status: "active" }).sort({ sortOrder: 1, eventDate: -1 });
    return res.json({ success: true, data: events });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch events." });
  }
};

const getOne = async (req, res) => {
  try {
    const item = await Event.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Event not found." });
    return res.json({ success: true, data: item });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch event." });
  }
};

const getBySlug = async (req, res) => {
  try {
    const item = await Event.findOne({ slug: req.params.slug, status: "active" });
    if (!item) return res.status(404).json({ success: false, message: "Event not found." });
    return res.json({ success: true, data: item });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch event." });
  }
};

const create = async (req, res) => {
  try {
    const { title, description, eventDate, location, status, sortOrder } = req.body;
    if (!title?.trim()) return res.status(400).json({ success: false, message: "Event title is required." });

    const item = await Event.create({
      title: title.trim(), description, location,
      eventDate: eventDate ? new Date(eventDate) : undefined,
      status: status || "active",
      sortOrder: Number(sortOrder) || 0,
    });
    return res.status(201).json({ success: true, message: "Event created.", data: item });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to create event." });
  }
};

const update = async (req, res) => {
  try {
    const item = await Event.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Event not found." });

    const { title, description, eventDate, location, status, sortOrder } = req.body;
    if (!title?.trim()) return res.status(400).json({ success: false, message: "Event title is required." });

    Object.assign(item, {
      title: title.trim(), description, location,
      eventDate: eventDate ? new Date(eventDate) : item.eventDate,
      status: status || item.status,
      sortOrder: sortOrder !== undefined ? Number(sortOrder) : item.sortOrder,
    });
    await item.save();
    return res.json({ success: true, message: "Event updated.", data: item });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to update event." });
  }
};

const remove = async (req, res) => {
  try {
    const item = await Event.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Event not found." });

    if (item.coverImage?.publicId) await deleteByPublicId(item.coverImage.publicId);
    for (const img of item.gallery) await deleteByPublicId(img.publicId);

    await item.deleteOne();
    return res.json({ success: true, message: "Event deleted." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to delete event." });
  }
};

// POST /api/events/:id/cover
const uploadCover = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No image provided." });
    const item = await Event.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Event not found." });

    if (item.coverImage?.publicId) await deleteByPublicId(item.coverImage.publicId);

    const { url, publicId } = await uploadEventImage(req.file.buffer, req.file.mimetype, req.file.originalname);
    item.coverImage = { url, publicId };
    await item.save();
    return res.json({ success: true, message: "Cover image uploaded.", data: { url, publicId } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || "Failed to upload image." });
  }
};

// POST /api/events/:id/gallery  (bulk)
const addGalleryImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No images provided." });
    }
    const item = await Event.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Event not found." });

    const uploaded = [];
    for (const file of req.files) {
      const { url, publicId } = await uploadEventImage(file.buffer, file.mimetype, file.originalname);
      const img = { url, publicId, caption: "", sortOrder: item.gallery.length + uploaded.length };
      item.gallery.push(img);
      uploaded.push({ url, publicId });
    }
    await item.save();
    return res.json({ success: true, message: `${uploaded.length} image(s) uploaded.`, data: uploaded });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || "Failed to upload gallery images." });
  }
};

// DELETE /api/events/:id/gallery/:imageId
const deleteGalleryImage = async (req, res) => {
  try {
    const item = await Event.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Event not found." });

    const imgIndex = item.gallery.findIndex((g) => g._id.toString() === req.params.imageId);
    if (imgIndex === -1) return res.status(404).json({ success: false, message: "Image not found." });

    const [img] = item.gallery.splice(imgIndex, 1);
    if (img.publicId) await deleteByPublicId(img.publicId);

    await item.save();
    return res.json({ success: true, message: "Gallery image deleted." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to delete gallery image." });
  }
};

module.exports = { getAll, getPublic, getOne, getBySlug, create, update, remove, uploadCover, addGalleryImages, deleteGalleryImage };
