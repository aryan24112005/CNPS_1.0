"use strict";
const multer = require("multer");

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ALLOWED_DOC_TYPES   = ["application/pdf"];

function imageFilter(req, file, cb) {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) return cb(null, true);
  cb(new Error("Only JPEG, PNG and WebP images are allowed."), false);
}

function imageOrPdfFilter(req, file, cb) {
  if ([...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES].includes(file.mimetype)) return cb(null, true);
  cb(new Error("Only JPEG, PNG, WebP images or PDF files are allowed."), false);
}

// All uploads use memory storage — file goes to Cloudinary from buffer
const storage = multer.memoryStorage();

// Standard image upload (5 MB)
const uploadImage = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// Document or image (20 MB — for PDFs)
const uploadImageOrPdf = multer({
  storage,
  fileFilter: imageOrPdfFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
});

// Multiple images (bulk gallery upload)
const uploadMultipleImages = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 10 * 1024 * 1024, files: 50 },
});

module.exports = { uploadImage, uploadImageOrPdf, uploadMultipleImages };
