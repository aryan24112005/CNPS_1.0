"use strict";
const cloudinary = require("../config/cloudinary");
const crypto     = require("crypto");
const path       = require("path");

// ── Allowed MIME types ────────────────────────────────────────
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const ALLOWED_DOC_TYPES   = new Set(["application/pdf"]);
const ALLOWED_ALL_TYPES   = new Set([...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES]);

// ── Cloudinary folder map ─────────────────────────────────────
const FOLDERS = {
  hero:         "cnps/hero",
  about:        "cnps/about",
  faculty:      "cnps/faculty",
  courses:      "cnps/courses",
  events:       "cnps/events",
  gallery:      "cnps/gallery",
  notices:      "cnps/notices",
  testimonials: "cnps/testimonials",
  settings:     "cnps/settings",
  media:        "cnps/media",
};

// ── Validate file ─────────────────────────────────────────────
function validateImage(mimetype, originalname) {
  if (!ALLOWED_IMAGE_TYPES.has(mimetype)) {
    return { valid: false, reason: "Only JPEG, PNG and WebP images are allowed." };
  }
  const ext = path.extname(originalname || "").toLowerCase();
  const allowed = [".jpg", ".jpeg", ".png", ".webp"];
  if (ext && !allowed.includes(ext)) {
    return { valid: false, reason: `File extension "${ext}" is not allowed.` };
  }
  return { valid: true };
}

function validateDocument(mimetype) {
  if (!ALLOWED_DOC_TYPES.has(mimetype)) {
    return { valid: false, reason: "Only PDF files are allowed for documents." };
  }
  return { valid: true };
}

// ── Generate a safe server-side public_id ─────────────────────
function generatePublicId(folder, prefix) {
  const rand = crypto.randomBytes(12).toString("hex");
  const ts   = Date.now();
  return `${folder}/${prefix}-${ts}-${rand}`;
}

// ── Core upload: streams buffer to Cloudinary ─────────────────
function uploadBuffer(buffer, folder, prefix, options = {}) {
  const publicId = generatePublicId(folder, prefix);

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        public_id:     publicId,
        resource_type: options.resource_type || "image",
        overwrite:     false,
        quality:       "auto:good",
        fetch_format:  "auto",
        ...options,
      },
      (err, result) => {
        if (err) return reject(new Error(`Cloudinary upload failed: ${err.message}`));
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

// ── Delete by public_id ───────────────────────────────────────
async function deleteByPublicId(publicId, resourceType = "image") {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    console.error(`[Cloudinary] Delete failed for "${publicId}": ${err.message}`);
  }
}

// ── Named upload helpers ──────────────────────────────────────

async function uploadHeroImage(buffer, mimetype, originalname) {
  const v = validateImage(mimetype, originalname);
  if (!v.valid) throw new Error(v.reason);
  const r = await uploadBuffer(buffer, FOLDERS.hero, "hero");
  return { url: r.secure_url, publicId: r.public_id };
}

async function uploadAboutImage(buffer, mimetype, originalname) {
  const v = validateImage(mimetype, originalname);
  if (!v.valid) throw new Error(v.reason);
  const r = await uploadBuffer(buffer, FOLDERS.about, "about");
  return { url: r.secure_url, publicId: r.public_id };
}

async function uploadFacultyPhoto(buffer, mimetype, originalname) {
  const v = validateImage(mimetype, originalname);
  if (!v.valid) throw new Error(v.reason);
  const r = await uploadBuffer(buffer, FOLDERS.faculty, "faculty");
  return { url: r.secure_url, publicId: r.public_id };
}

async function uploadCourseImage(buffer, mimetype, originalname) {
  const v = validateImage(mimetype, originalname);
  if (!v.valid) throw new Error(v.reason);
  const r = await uploadBuffer(buffer, FOLDERS.courses, "course");
  return { url: r.secure_url, publicId: r.public_id };
}

async function uploadCoursePdf(buffer, mimetype) {
  const v = validateDocument(mimetype);
  if (!v.valid) throw new Error(v.reason);
  const r = await uploadBuffer(buffer, FOLDERS.courses, "course-doc", {
    resource_type: "raw",
  });
  return { url: r.secure_url, publicId: r.public_id };
}

async function uploadEventImage(buffer, mimetype, originalname) {
  const v = validateImage(mimetype, originalname);
  if (!v.valid) throw new Error(v.reason);
  const r = await uploadBuffer(buffer, FOLDERS.events, "event");
  return { url: r.secure_url, publicId: r.public_id };
}

async function uploadGalleryImage(buffer, mimetype, originalname) {
  const v = validateImage(mimetype, originalname);
  if (!v.valid) throw new Error(v.reason);
  const r = await uploadBuffer(buffer, FOLDERS.gallery, "gallery");
  return { url: r.secure_url, publicId: r.public_id };
}

async function uploadNoticeFile(buffer, mimetype, originalname) {
  const isImage = ALLOWED_IMAGE_TYPES.has(mimetype);
  const isPdf   = ALLOWED_DOC_TYPES.has(mimetype);
  if (!isImage && !isPdf) {
    throw new Error("Only JPEG, PNG, WebP images or PDF files are allowed for notices.");
  }
  const r = await uploadBuffer(buffer, FOLDERS.notices, "notice", {
    resource_type: isPdf ? "raw" : "image",
  });
  return { url: r.secure_url, publicId: r.public_id };
}

async function uploadTestimonialAvatar(buffer, mimetype, originalname) {
  const v = validateImage(mimetype, originalname);
  if (!v.valid) throw new Error(v.reason);
  const r = await uploadBuffer(buffer, FOLDERS.testimonials, "avatar");
  return { url: r.secure_url, publicId: r.public_id };
}

async function uploadSettingsImage(buffer, mimetype, originalname) {
  const v = validateImage(mimetype, originalname);
  if (!v.valid) throw new Error(v.reason);
  const r = await uploadBuffer(buffer, FOLDERS.settings, "settings");
  return { url: r.secure_url, publicId: r.public_id };
}

async function uploadMediaLibraryFile(buffer, mimetype, originalname) {
  const isImage = ALLOWED_IMAGE_TYPES.has(mimetype);
  const isPdf   = ALLOWED_DOC_TYPES.has(mimetype);
  if (!isImage && !isPdf) {
    throw new Error("Only images (JPEG, PNG, WebP) or PDF files are allowed.");
  }
  const r = await uploadBuffer(buffer, FOLDERS.media, "media", {
    resource_type: isPdf ? "raw" : "image",
  });
  return { url: r.secure_url, publicId: r.public_id };
}

module.exports = {
  FOLDERS,
  deleteByPublicId,
  uploadHeroImage,
  uploadAboutImage,
  uploadFacultyPhoto,
  uploadCourseImage,
  uploadCoursePdf,
  uploadEventImage,
  uploadGalleryImage,
  uploadNoticeFile,
  uploadTestimonialAvatar,
  uploadSettingsImage,
  uploadMediaLibraryFile,
};
