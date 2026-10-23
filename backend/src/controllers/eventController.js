"use strict";
const { Event, EventGallery } = require("../models/sql");
const { serializeEvent } = require("../utils/serializers");
const { generateUniqueSlug } = require("../utils/slug");
const { uploadEventImage, deleteMediaByUrl } = require("../services/mediaService");
const { sequelize } = require("../models/sql");

const getAll = async (req, res) => {
  try {
    const events = await Event.findAll({
      include: [{ model: EventGallery, as: "gallery" }],
      order: [["sortOrder", "ASC"], ["eventDate", "DESC"]],
    });
    return res.json({ success: true, data: events.map(serializeEvent) });
  } catch (err) { return res.status(500).json({ success: false, message: "Failed to fetch events." }); }
};

const getPublic = async (req, res) => {
  try {
    const events = await Event.findAll({
      where: { status: "active" },
      include: [{ model: EventGallery, as: "gallery" }],
      order: [["sortOrder", "ASC"], ["eventDate", "DESC"]],
    });
    return res.json({ success: true, data: events.map(serializeEvent) });
  } catch (err) { return res.status(500).json({ success: false, message: "Failed to fetch events." }); }
};

const getOne = async (req, res) => {
  try {
    const item = await Event.findByPk(req.params.id, { include: [{ model: EventGallery, as: "gallery" }] });
    if (!item) return res.status(404).json({ success: false, message: "Event not found." });
    return res.json({ success: true, data: serializeEvent(item) });
  } catch (err) { return res.status(500).json({ success: false, message: "Failed to fetch event." }); }
};

const getBySlug = async (req, res) => {
  try {
    const item = await Event.findOne({
      where: { slug: req.params.slug, status: "active" },
      include: [{ model: EventGallery, as: "gallery" }],
    });
    if (!item) return res.status(404).json({ success: false, message: "Event not found." });
    return res.json({ success: true, data: serializeEvent(item) });
  } catch (err) { return res.status(500).json({ success: false, message: "Failed to fetch event." }); }
};

const create = async (req, res) => {
  try {
    const { title, description, eventDate, location, status, sortOrder } = req.body;
    if (!title?.trim()) return res.status(400).json({ success: false, message: "Event title is required." });
    const slug = await generateUniqueSlug(Event, title.trim());
    const item = await Event.create({
      title: title.trim(), slug, description, location,
      eventDate: eventDate ? new Date(eventDate) : null,
      status: status || "active", sortOrder: Number(sortOrder) || 0,
    });
    const full = await Event.findByPk(item.id, { include: [{ model: EventGallery, as: "gallery" }] });
    return res.status(201).json({ success: true, message: "Event created.", data: serializeEvent(full) });
  } catch (err) { return res.status(500).json({ success: false, message: "Failed to create event." }); }
};

const update = async (req, res) => {
  try {
    const item = await Event.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Event not found." });
    const { title, description, eventDate, location, status, sortOrder } = req.body;
    if (!title?.trim()) return res.status(400).json({ success: false, message: "Event title is required." });
    let slug = item.slug;
    if (title.trim() !== item.title) slug = await generateUniqueSlug(Event, title.trim(), item.id);
    await item.update({
      title: title.trim(), slug, description, location,
      eventDate: eventDate ? new Date(eventDate) : item.eventDate,
      status: status || item.status,
      sortOrder: sortOrder !== undefined ? Number(sortOrder) : item.sortOrder,
    });
    const full = await Event.findByPk(item.id, { include: [{ model: EventGallery, as: "gallery" }] });
    return res.json({ success: true, message: "Event updated.", data: serializeEvent(full) });
  } catch (err) { return res.status(500).json({ success: false, message: "Failed to update event." }); }
};

const remove = async (req, res) => {
  try {
    const item = await Event.findByPk(req.params.id, { include: [{ model: EventGallery, as: "gallery" }] });
    if (!item) return res.status(404).json({ success: false, message: "Event not found." });
    if (item.coverImageUrl) await deleteMediaByUrl(item.coverImageUrl);
    for (const img of item.gallery) { if (img.url) await deleteMediaByUrl(img.url); }
    await item.destroy();
    return res.json({ success: true, message: "Event deleted." });
  } catch (err) { return res.status(500).json({ success: false, message: "Failed to delete event." }); }
};

const uploadCover = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No image provided." });
    const item = await Event.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Event not found." });
    if (item.coverImageUrl) await deleteMediaByUrl(item.coverImageUrl);
    const { url, publicId } = await uploadEventImage(req.file.buffer, req.file.mimetype, req.file.originalname);
    await item.update({ coverImageUrl: url, coverImagePublicId: publicId });
    return res.json({ success: true, message: "Cover image uploaded.", data: { url, publicId } });
  } catch (err) { return res.status(500).json({ success: false, message: err.message || "Failed to upload image." }); }
};

const addGalleryImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ success: false, message: "No images provided." });
    const item = await Event.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Event not found." });
    const existingCount = await EventGallery.count({ where: { eventId: item.id } });
    const uploaded = [];
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const { url, publicId } = await uploadEventImage(file.buffer, file.mimetype, file.originalname);
      const eg = await EventGallery.create({ eventId: item.id, url, publicId, caption: "", sortOrder: existingCount + i });
      uploaded.push({ url, publicId });
    }
    return res.json({ success: true, message: `${uploaded.length} image(s) uploaded.`, data: uploaded });
  } catch (err) { return res.status(500).json({ success: false, message: err.message || "Failed to upload gallery images." }); }
};

const deleteGalleryImage = async (req, res) => {
  try {
    const img = await EventGallery.findOne({ where: { id: req.params.imageId, eventId: req.params.id } });
    if (!img) return res.status(404).json({ success: false, message: "Image not found." });
    if (img.url) await deleteMediaByUrl(img.url);
    await img.destroy();
    return res.json({ success: true, message: "Gallery image deleted." });
  } catch (err) { return res.status(500).json({ success: false, message: "Failed to delete gallery image." }); }
};

module.exports = { getAll, getPublic, getOne, getBySlug, create, update, remove, uploadCover, addGalleryImages, deleteGalleryImage };
