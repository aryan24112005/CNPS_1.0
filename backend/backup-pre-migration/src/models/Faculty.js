"use strict";
const mongoose = require("mongoose");

const facultySchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, "Faculty name is required"],
      trim:     true,
    },
    designation: { type: String, trim: true, default: "" },
    qualification: { type: String, trim: true, default: "" },
    experience: { type: String, trim: true, default: "" },
    shortBio:   { type: String, trim: true, default: "" },
    bio:        { type: String, trim: true, default: "" },
    photo: {
      url:      { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    email:    { type: String, trim: true, default: "" },
    phone:    { type: String, trim: true, default: "" },
    facebook: { type: String, trim: true, default: "" },
    instagram:{ type: String, trim: true, default: "" },
    linkedin: { type: String, trim: true, default: "" },
    youtube:  { type: String, trim: true, default: "" },
    status: {
      type:    String,
      enum:    ["active", "inactive"],
      default: "active",
    },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Faculty", facultySchema);
