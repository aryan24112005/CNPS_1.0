"use strict";
const mongoose = require("mongoose");
const slugify  = require("slugify");

const eventImageSchema = new mongoose.Schema({
  url:      { type: String, required: true },
  publicId: { type: String, required: true },
  caption:  { type: String, trim: true, default: "" },
  sortOrder:{ type: Number, default: 0 },
});

const eventSchema = new mongoose.Schema(
  {
    title: {
      type:     String,
      required: [true, "Event title is required"],
      trim:     true,
    },
    slug:        { type: String, unique: true, index: true },
    description: { type: String, trim: true, default: "" },
    eventDate:   { type: Date },
    location:    { type: String, trim: true, default: "" },
    coverImage: {
      url:      { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    gallery: [eventImageSchema],
    status: {
      type:    String,
      enum:    ["active", "inactive"],
      default: "active",
    },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

eventSchema.pre("validate", async function (next) {
  if (this.isNew || this.isModified("title")) {
    const base = slugify(this.title, { lower: true, strict: true });
    let slug = base, count = 1;
    while (await mongoose.model("Event").exists({ slug, _id: { $ne: this._id } })) {
      slug = `${base}-${count++}`;
    }
    this.slug = slug;
  }
  next();
});

module.exports = mongoose.model("Event", eventSchema);
