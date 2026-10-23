"use strict";
const Course = require("../models/Course");
const { uploadCourseImage, uploadCoursePdf, deleteByPublicId } = require("../services/cloudinaryService");

const getAll = async (req, res) => {
  try {
    const courses = await Course.find().sort({ sortOrder: 1, createdAt: -1 });
    return res.json({ success: true, data: courses });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch courses." });
  }
};

const getPublic = async (req, res) => {
  try {
    const courses = await Course.find({ status: "active" }).sort({ sortOrder: 1, createdAt: -1 });
    return res.json({ success: true, data: courses });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch courses." });
  }
};

const getOne = async (req, res) => {
  try {
    const item = await Course.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Course not found." });
    return res.json({ success: true, data: item });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch course." });
  }
};

const getBySlug = async (req, res) => {
  try {
    const item = await Course.findOne({ slug: req.params.slug, status: "active" });
    if (!item) return res.status(404).json({ success: false, message: "Course not found." });
    return res.json({ success: true, data: item });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch course." });
  }
};

const create = async (req, res) => {
  try {
    const { title, category, className, shortDescription, description,
            classTeacher, timing, subjects, books, status, sortOrder } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: "Course title is required." });
    }

    const parsedSubjects = typeof subjects === "string" ? JSON.parse(subjects) : (subjects || []);
    const parsedBooks    = typeof books    === "string" ? JSON.parse(books)    : (books    || []);

    const item = await Course.create({
      title: title.trim(), category, className, shortDescription, description,
      classTeacher, timing, subjects: parsedSubjects, books: parsedBooks,
      status: status || "active",
      sortOrder: Number(sortOrder) || 0,
    });

    return res.status(201).json({ success: true, message: "Course created.", data: item });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to create course." });
  }
};

const update = async (req, res) => {
  try {
    const item = await Course.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Course not found." });

    const { title, category, className, shortDescription, description,
            classTeacher, timing, subjects, books, status, sortOrder } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: "Course title is required." });
    }

    const parsedSubjects = typeof subjects === "string" ? JSON.parse(subjects) : (subjects || item.subjects);
    const parsedBooks    = typeof books    === "string" ? JSON.parse(books)    : (books    || item.books);

    Object.assign(item, {
      title: title.trim(), category, className, shortDescription, description,
      classTeacher, timing, subjects: parsedSubjects, books: parsedBooks,
      status: status || item.status,
      sortOrder: sortOrder !== undefined ? Number(sortOrder) : item.sortOrder,
    });

    await item.save();
    return res.json({ success: true, message: "Course updated.", data: item });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to update course." });
  }
};

const remove = async (req, res) => {
  try {
    const item = await Course.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Course not found." });

    // Clean up Cloudinary assets
    if (item.image?.publicId)        await deleteByPublicId(item.image.publicId);
    if (item.feePdf?.publicId)       await deleteByPublicId(item.feePdf.publicId, "raw");
    if (item.timetablePdf?.publicId) await deleteByPublicId(item.timetablePdf.publicId, "raw");
    for (const book of item.books) {
      if (book.image?.publicId) await deleteByPublicId(book.image.publicId);
    }

    await item.deleteOne();
    return res.json({ success: true, message: "Course deleted." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to delete course." });
  }
};

// POST /api/courses/:id/image
const uploadImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No image provided." });
    const item = await Course.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Course not found." });

    if (item.image?.publicId) await deleteByPublicId(item.image.publicId);

    const { url, publicId } = await uploadCourseImage(req.file.buffer, req.file.mimetype, req.file.originalname);
    item.image = { url, publicId };
    await item.save();
    return res.json({ success: true, message: "Image uploaded.", data: { url, publicId } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || "Failed to upload image." });
  }
};

// POST /api/courses/:id/fee-pdf
const uploadFeePdf = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No PDF provided." });
    const item = await Course.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Course not found." });

    if (item.feePdf?.publicId) await deleteByPublicId(item.feePdf.publicId, "raw");

    const { url, publicId } = await uploadCoursePdf(req.file.buffer, req.file.mimetype);
    item.feePdf = { url, publicId };
    await item.save();
    return res.json({ success: true, message: "Fee PDF uploaded.", data: { url, publicId } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || "Failed to upload PDF." });
  }
};

// POST /api/courses/:id/timetable-pdf
const uploadTimetablePdf = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No PDF provided." });
    const item = await Course.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Course not found." });

    if (item.timetablePdf?.publicId) await deleteByPublicId(item.timetablePdf.publicId, "raw");

    const { url, publicId } = await uploadCoursePdf(req.file.buffer, req.file.mimetype);
    item.timetablePdf = { url, publicId };
    await item.save();
    return res.json({ success: true, message: "Timetable PDF uploaded.", data: { url, publicId } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || "Failed to upload PDF." });
  }
};

module.exports = { getAll, getPublic, getOne, getBySlug, create, update, remove, uploadImage, uploadFeePdf, uploadTimetablePdf };
