"use strict";
/**
 * mediaService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Replaces cloudinaryService.js. Stores uploaded files as binary data (LONGBLOB)
 * in the MySQL `media` table. Serves them via GET /api/media/:id.
 *
 * No external image-hosting service is used. All binary data lives in MySQL.
 */

const crypto = require("crypto");
const path   = require("path");
const { Media } = require("../models/sql");

// ── Allowed MIME types ────────────────────────────────────────
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]);
const ALLOWED_DOC_TYPES   = new Set(["application/pdf"]);
const ALLOWED_ALL_TYPES   = new Set([...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES]);

// ── Backend URL for constructing absolute media URLs ──────────
const BACKEND_URL = (process.env.BACKEND_URL || "").replace(/\/+$/, "");

// ── Validate file ─────────────────────────────────────────────
function validateImage(mimetype, originalname) {
  if (!ALLOWED_IMAGE_TYPES.has(mimetype)) {
    return { valid: false, reason: "Only JPEG, PNG, WebP and GIF images are allowed." };
  }
  const ext = path.extname(originalname || "").toLowerCase();
  const allowed = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
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

// ── Generate a stable public_id (for compatibility with old Cloudinary fields) ──
function generatePublicId(folder, prefix) {
  const rand = crypto.randomBytes(12).toString("hex");
  const ts   = Date.now();
  return `${folder}/${prefix}-${ts}-${rand}`;
}

// ── Construct the media URL ───────────────────────────────────
function buildMediaUrl(mediaId) {
  return `${BACKEND_URL}/api/media/${mediaId}`;
}

// ── Core upload: store binary in MySQL ────────────────────────
async function storeMedia(buffer, mimetype, originalname, folder, prefix, resourceType) {
  const publicId = generatePublicId(folder, prefix);

  const media = await Media.create({
    originalName: originalname || "",
    fileData: buffer,
    url: "",            // filled after we know the id
    publicId,
    resourceType: resourceType || "image",
    mimeType: mimetype || "",
    size: buffer.length,
    folder,
  });

  // Now construct the URL and update the row
  const url = buildMediaUrl(media.id);
  await media.update({ url });

  return { url, publicId, mediaId: media.id };
}

// ── Delete by media id (removes the binary row) ──────────────
async function deleteMediaByUrl(url) {
  if (!url) return;
  try {
    // Extract media id from URL like .../api/media/123
    const match = url.match(/\/api\/media\/(\d+)/);
    if (match) {
      const mediaId = parseInt(match[1], 10);
      await Media.destroy({ where: { id: mediaId } });
      return;
    }
    // Also try deleting by URL match
    await Media.destroy({ where: { url } });
  } catch (err) {
    console.error(`[MediaService] Delete failed for URL "${url}": ${err.message}`);
  }
}

// Also support deletion by publicId for backward compatibility
async function deleteByPublicId(publicId) {
  if (!publicId) return;
  try {
    await Media.destroy({ where: { publicId } });
  } catch (err) {
    console.error(`[MediaService] Delete failed for publicId "${publicId}": ${err.message}`);
  }
}

// ── Named upload helpers (matching cloudinaryService interface) ──────────────

async function uploadHeroImage(buffer, mimetype, originalname) {
  const v = validateImage(mimetype, originalname);
  if (!v.valid) throw new Error(v.reason);
  return storeMedia(buffer, mimetype, originalname, "hero", "hero", "image");
}

async function uploadAboutImage(buffer, mimetype, originalname) {
  const v = validateImage(mimetype, originalname);
  if (!v.valid) throw new Error(v.reason);
  return storeMedia(buffer, mimetype, originalname, "about", "about", "image");
}

async function uploadFacultyPhoto(buffer, mimetype, originalname) {
  const v = validateImage(mimetype, originalname);
  if (!v.valid) throw new Error(v.reason);
  return storeMedia(buffer, mimetype, originalname, "faculty", "faculty", "image");
}

async function uploadCourseImage(buffer, mimetype, originalname) {
  const v = validateImage(mimetype, originalname);
  if (!v.valid) throw new Error(v.reason);
  return storeMedia(buffer, mimetype, originalname, "courses", "course", "image");
}

async function uploadCoursePdf(buffer, mimetype) {
  const v = validateDocument(mimetype);
  if (!v.valid) throw new Error(v.reason);
  return storeMedia(buffer, mimetype, "course-doc.pdf", "courses", "course-doc", "raw");
}

async function uploadEventImage(buffer, mimetype, originalname) {
  const v = validateImage(mimetype, originalname);
  if (!v.valid) throw new Error(v.reason);
  return storeMedia(buffer, mimetype, originalname, "events", "event", "image");
}

async function uploadGalleryImage(buffer, mimetype, originalname) {
  const v = validateImage(mimetype, originalname);
  if (!v.valid) throw new Error(v.reason);
  return storeMedia(buffer, mimetype, originalname, "gallery", "gallery", "image");
}

async function uploadNoticeFile(buffer, mimetype, originalname) {
  const isImage = ALLOWED_IMAGE_TYPES.has(mimetype);
  const isPdf   = ALLOWED_DOC_TYPES.has(mimetype);
  if (!isImage && !isPdf) {
    throw new Error("Only JPEG, PNG, WebP images or PDF files are allowed for notices.");
  }
  return storeMedia(buffer, mimetype, originalname, "notices", "notice", isPdf ? "raw" : "image");
}

async function uploadTestimonialAvatar(buffer, mimetype, originalname) {
  const v = validateImage(mimetype, originalname);
  if (!v.valid) throw new Error(v.reason);
  return storeMedia(buffer, mimetype, originalname, "testimonials", "avatar", "image");
}

async function uploadSettingsImage(buffer, mimetype, originalname) {
  const v = validateImage(mimetype, originalname);
  if (!v.valid) throw new Error(v.reason);
  return storeMedia(buffer, mimetype, originalname, "settings", "settings", "image");
}

async function uploadMediaLibraryFile(buffer, mimetype, originalname) {
  const isImage = ALLOWED_IMAGE_TYPES.has(mimetype);
  const isPdf   = ALLOWED_DOC_TYPES.has(mimetype);
  if (!isImage && !isPdf) {
    throw new Error("Only images (JPEG, PNG, WebP, GIF) or PDF files are allowed.");
  }
  return storeMedia(buffer, mimetype, originalname, "media", "media", isPdf ? "raw" : "image");
}

module.exports = {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_DOC_TYPES,
  BACKEND_URL,
  deleteMediaByUrl,
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
