"use strict";
const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema(
  {
    originalName:  { type: String, trim: true, default: "" },
    url:           { type: String, required: true },
    publicId:      { type: String, required: true },
    resourceType:  { type: String, enum: ["image", "raw"], default: "image" },
    mimeType:      { type: String, trim: true, default: "" },
    size:          { type: Number, default: 0 },
    folder:        { type: String, trim: true, default: "media" },
    uploadedBy:    { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    tags:          [{ type: String, trim: true }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Media", mediaSchema);
