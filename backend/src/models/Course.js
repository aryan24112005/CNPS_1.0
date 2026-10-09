"use strict";
const mongoose = require("mongoose");
const slugify  = require("slugify");

const bookSchema = new mongoose.Schema({
  name:      { type: String, trim: true },
  publisher: { type: String, trim: true, default: "" },
  image: {
    url:      { type: String, default: "" },
    publicId: { type: String, default: "" },
  },
  price:     { type: String, trim: true, default: "" },
  sortOrder: { type: Number, default: 0 },
});

const courseSchema = new mongoose.Schema(
  {
    title: {
      type:     String,
      required: [true, "Course title is required"],
      trim:     true,
    },
    slug: { type: String, unique: true, index: true },
    category: { type: String, trim: true, default: "" },
    className: { type: String, trim: true, default: "" },
    shortDescription: { type: String, trim: true, default: "" },
    description:      { type: String, trim: true, default: "" },
    classTeacher:     { type: String, trim: true, default: "" },
    timing:           { type: String, trim: true, default: "" },
    image: {
      url:      { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    feePdf: {
      url:      { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    timetablePdf: {
      url:      { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    subjects: [{ type: String, trim: true }],
    books:    [bookSchema],
    status: {
      type:    String,
      enum:    ["active", "inactive"],
      default: "active",
    },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Auto-generate slug from title
courseSchema.pre("validate", async function (next) {
  if (this.isNew || this.isModified("title")) {
    const base = slugify(this.title, { lower: true, strict: true });
    let slug = base;
    let count = 1;
    while (await mongoose.model("Course").exists({ slug, _id: { $ne: this._id } })) {
      slug = `${base}-${count++}`;
    }
    this.slug = slug;
  }
  next();
});

module.exports = mongoose.model("Course", courseSchema);
