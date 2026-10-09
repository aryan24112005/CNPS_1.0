"use strict";
const mongoose = require("mongoose");
const slugify  = require("slugify");

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type:     String,
      required: [true, "Notice title is required"],
      trim:     true,
    },
    slug:    { type: String, unique: true, index: true },
    content: { type: String, trim: true, default: "" },
    file: {
      url:          { type: String, default: "" },
      publicId:     { type: String, default: "" },
      resourceType: { type: String, enum: ["image", "raw", ""], default: "" },
    },
    status: {
      type:    String,
      enum:    ["active", "inactive"],
      default: "active",
    },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

noticeSchema.pre("validate", async function (next) {
  if (this.isNew || this.isModified("title")) {
    const base = slugify(this.title, { lower: true, strict: true });
    let slug = base, count = 1;
    while (await mongoose.model("Notice").exists({ slug, _id: { $ne: this._id } })) {
      slug = `${base}-${count++}`;
    }
    this.slug = slug;
  }
  next();
});

module.exports = mongoose.model("Notice", noticeSchema);
