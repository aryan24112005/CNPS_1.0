"use strict";
const mongoose = require("mongoose");
const slugify  = require("slugify");

const galleryImageSchema = new mongoose.Schema({
  url:      { type: String, required: true },
  publicId: { type: String, required: true },
  caption:  { type: String, trim: true, default: "" },
  sortOrder:{ type: Number, default: 0 },
});

const galleryAlbumSchema = new mongoose.Schema(
  {
    title: {
      type:     String,
      required: [true, "Album title is required"],
      trim:     true,
    },
    slug:        { type: String, unique: true, index: true },
    description: { type: String, trim: true, default: "" },
    category: {
      type:    String,
      enum:    ["academic", "development", "campus", "general"],
      default: "general",
    },
    coverImage: {
      url:      { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    images: [galleryImageSchema],
    status: {
      type:    String,
      enum:    ["active", "inactive"],
      default: "active",
    },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Auto-generate slug — runs before validation so the slug field is populated
galleryAlbumSchema.pre("validate", async function (next) {
  // Only regenerate if new document or title changed
  if (!this.isNew && !this.isModified("title")) return next();

  try {
    let base = slugify(this.title || "", { lower: true, strict: true });
    // Fallback for titles that slugify reduces to empty (all special chars)
    if (!base) base = "album";

    let slug  = base;
    let count = 1;
    const Model = mongoose.model("GalleryAlbum");

    // Keep trying until we find a unique slug
    while (await Model.exists({ slug, _id: { $ne: this._id } })) {
      slug = `${base}-${count++}`;
    }
    this.slug = slug;
  } catch (err) {
    // Don't block save — generate a random fallback slug
    console.error("[GalleryAlbum] Slug generation error:", err.message);
    this.slug = `album-${Date.now()}`;
  }
  next();
});

module.exports = mongoose.model("GalleryAlbum", galleryAlbumSchema);
