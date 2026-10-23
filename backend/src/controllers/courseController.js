"use strict";
const { Course, CourseBook } = require("../models/sql");
const { serializeCourse } = require("../utils/serializers");
const { generateUniqueSlug } = require("../utils/slug");
const { uploadCourseImage, uploadCoursePdf, deleteMediaByUrl } = require("../services/mediaService");
const { sequelize } = require("../models/sql");

const getAll = async (req, res) => {
  try {
    const courses = await Course.findAll({
      include: [{ model: CourseBook, as: "books" }],
      order: [["sortOrder", "ASC"], ["createdAt", "DESC"]],
    });
    return res.json({ success: true, data: courses.map(serializeCourse) });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch courses." });
  }
};

const getPublic = async (req, res) => {
  try {
    const courses = await Course.findAll({
      where: { status: "active" },
      include: [{ model: CourseBook, as: "books" }],
      order: [["sortOrder", "ASC"], ["createdAt", "DESC"]],
    });
    return res.json({ success: true, data: courses.map(serializeCourse) });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch courses." });
  }
};

const getOne = async (req, res) => {
  try {
    const item = await Course.findByPk(req.params.id, {
      include: [{ model: CourseBook, as: "books" }],
    });
    if (!item) return res.status(404).json({ success: false, message: "Course not found." });
    return res.json({ success: true, data: serializeCourse(item) });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch course." });
  }
};

const getBySlug = async (req, res) => {
  try {
    const item = await Course.findOne({
      where: { slug: req.params.slug, status: "active" },
      include: [{ model: CourseBook, as: "books" }],
    });
    if (!item) return res.status(404).json({ success: false, message: "Course not found." });
    return res.json({ success: true, data: serializeCourse(item) });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch course." });
  }
};

const create = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { title, category, className, shortDescription, description,
            classTeacher, timing, subjects, books, status, sortOrder } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: "Course title is required." });
    }

    const parsedSubjects = typeof subjects === "string" ? JSON.parse(subjects) : (subjects || []);
    const parsedBooks    = typeof books    === "string" ? JSON.parse(books)    : (books    || []);

    const slug = await generateUniqueSlug(Course, title.trim());

    const item = await Course.create({
      title: title.trim(), slug, category, className, shortDescription, description,
      classTeacher, timing, subjects: parsedSubjects,
      status: status || "active",
      sortOrder: Number(sortOrder) || 0,
    }, { transaction: t });

    // Create books
    if (Array.isArray(parsedBooks) && parsedBooks.length > 0) {
      for (let i = 0; i < parsedBooks.length; i++) {
        const b = parsedBooks[i];
        await CourseBook.create({
          courseId: item.id,
          name: b.name || "",
          publisher: b.publisher || "",
          price: b.price || "",
          sortOrder: Number(b.sortOrder) || i,
        }, { transaction: t });
      }
    }

    await t.commit();
    const fullItem = await Course.findByPk(item.id, { include: [{ model: CourseBook, as: "books" }] });
    return res.status(201).json({ success: true, message: "Course created.", data: serializeCourse(fullItem) });
  } catch (err) {
    await t.rollback();
    return res.status(500).json({ success: false, message: "Failed to create course." });
  }
};

const update = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const item = await Course.findByPk(req.params.id, { include: [{ model: CourseBook, as: "books" }] });
    if (!item) return res.status(404).json({ success: false, message: "Course not found." });

    const { title, category, className, shortDescription, description,
            classTeacher, timing, subjects, books, status, sortOrder } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: "Course title is required." });
    }

    const parsedSubjects = typeof subjects === "string" ? JSON.parse(subjects) : (subjects || item.subjects);
    const parsedBooks    = typeof books    === "string" ? JSON.parse(books)    : (books    || null);

    // Regenerate slug if title changed
    let slug = item.slug;
    if (title.trim() !== item.title) {
      slug = await generateUniqueSlug(Course, title.trim(), item.id);
    }

    await item.update({
      title: title.trim(), slug, category, className, shortDescription, description,
      classTeacher, timing, subjects: parsedSubjects,
      status: status || item.status,
      sortOrder: sortOrder !== undefined ? Number(sortOrder) : item.sortOrder,
    }, { transaction: t });

    // Replace books if provided
    if (parsedBooks !== null) {
      await CourseBook.destroy({ where: { courseId: item.id }, transaction: t });
      for (let i = 0; i < parsedBooks.length; i++) {
        const b = parsedBooks[i];
        await CourseBook.create({
          courseId: item.id,
          name: b.name || "",
          publisher: b.publisher || "",
          price: b.price || "",
          imageUrl: b.image?.url || b.imageUrl || "",
          imagePublicId: b.image?.publicId || b.imagePublicId || "",
          sortOrder: Number(b.sortOrder) || i,
        }, { transaction: t });
      }
    }

    await t.commit();
    const fullItem = await Course.findByPk(item.id, { include: [{ model: CourseBook, as: "books" }] });
    return res.json({ success: true, message: "Course updated.", data: serializeCourse(fullItem) });
  } catch (err) {
    await t.rollback();
    return res.status(500).json({ success: false, message: "Failed to update course." });
  }
};

const remove = async (req, res) => {
  try {
    const item = await Course.findByPk(req.params.id, { include: [{ model: CourseBook, as: "books" }] });
    if (!item) return res.status(404).json({ success: false, message: "Course not found." });

    // Clean up media
    if (item.imageUrl)        await deleteMediaByUrl(item.imageUrl);
    if (item.feePdfUrl)       await deleteMediaByUrl(item.feePdfUrl);
    if (item.timetablePdfUrl) await deleteMediaByUrl(item.timetablePdfUrl);
    for (const book of item.books) {
      if (book.imageUrl) await deleteMediaByUrl(book.imageUrl);
    }

    await item.destroy(); // CASCADE will remove course_books
    return res.json({ success: true, message: "Course deleted." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to delete course." });
  }
};

const uploadImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No image provided." });
    const item = await Course.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Course not found." });

    if (item.imageUrl) await deleteMediaByUrl(item.imageUrl);

    const { url, publicId } = await uploadCourseImage(req.file.buffer, req.file.mimetype, req.file.originalname);
    await item.update({ imageUrl: url, imagePublicId: publicId });
    return res.json({ success: true, message: "Image uploaded.", data: { url, publicId } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || "Failed to upload image." });
  }
};

const uploadFeePdf = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No PDF provided." });
    const item = await Course.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Course not found." });

    if (item.feePdfUrl) await deleteMediaByUrl(item.feePdfUrl);

    const { url, publicId } = await uploadCoursePdf(req.file.buffer, req.file.mimetype);
    await item.update({ feePdfUrl: url, feePdfPublicId: publicId });
    return res.json({ success: true, message: "Fee PDF uploaded.", data: { url, publicId } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || "Failed to upload PDF." });
  }
};

const uploadTimetablePdf = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No PDF provided." });
    const item = await Course.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Course not found." });

    if (item.timetablePdfUrl) await deleteMediaByUrl(item.timetablePdfUrl);

    const { url, publicId } = await uploadCoursePdf(req.file.buffer, req.file.mimetype);
    await item.update({ timetablePdfUrl: url, timetablePdfPublicId: publicId });
    return res.json({ success: true, message: "Timetable PDF uploaded.", data: { url, publicId } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || "Failed to upload PDF." });
  }
};

module.exports = { getAll, getPublic, getOne, getBySlug, create, update, remove, uploadImage, uploadFeePdf, uploadTimetablePdf };
