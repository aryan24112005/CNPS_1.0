"use strict";
const { Faculty } = require("../models/sql");
const { serializeFaculty } = require("../utils/serializers");
const { uploadFacultyPhoto, deleteMediaByUrl } = require("../services/mediaService");

const getAll = async (req, res) => {
  try {
    const faculty = await Faculty.findAll({ order: [["sortOrder", "ASC"], ["createdAt", "DESC"]] });
    return res.json({ success: true, data: faculty.map(serializeFaculty) });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch faculty." });
  }
};

const getPublic = async (req, res) => {
  try {
    const faculty = await Faculty.findAll({
      where: { status: "active" },
      order: [["sortOrder", "ASC"], ["createdAt", "DESC"]],
    });
    return res.json({ success: true, data: faculty.map(serializeFaculty) });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch faculty." });
  }
};

const getOne = async (req, res) => {
  try {
    const item = await Faculty.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Faculty member not found." });
    return res.json({ success: true, data: serializeFaculty(item) });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch faculty member." });
  }
};

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

    return res.status(201).json({ success: true, message: "Faculty member created.", data: serializeFaculty(item) });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to create faculty member." });
  }
};

const update = async (req, res) => {
  try {
    const item = await Faculty.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Faculty member not found." });

    const { name, designation, qualification, experience, shortBio, bio,
            email, phone, facebook, instagram, linkedin, youtube, status, sortOrder } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Faculty name is required." });
    }

    await item.update({
      name: name.trim(), designation, qualification, experience,
      shortBio, bio, email, phone, facebook, instagram, linkedin, youtube,
      status: status || item.status,
      sortOrder: sortOrder !== undefined ? Number(sortOrder) : item.sortOrder,
    });

    return res.json({ success: true, message: "Faculty member updated.", data: serializeFaculty(item) });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to update faculty member." });
  }
};

const remove = async (req, res) => {
  try {
    const item = await Faculty.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Faculty member not found." });

    if (item.photoUrl) await deleteMediaByUrl(item.photoUrl);
    await item.destroy();
    return res.json({ success: true, message: "Faculty member deleted." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to delete faculty member." });
  }
};

const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No image file provided." });

    const item = await Faculty.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Faculty member not found." });

    if (item.photoUrl) await deleteMediaByUrl(item.photoUrl);

    const { url, publicId } = await uploadFacultyPhoto(req.file.buffer, req.file.mimetype, req.file.originalname);
    await item.update({ photoUrl: url, photoPublicId: publicId });

    return res.json({ success: true, message: "Photo uploaded.", data: { url, publicId } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || "Failed to upload photo." });
  }
};

module.exports = { getAll, getPublic, getOne, create, update, remove, uploadPhoto };
