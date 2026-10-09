"use strict";
const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema(
  {
    name:        { type: String, required: [true, "Name is required"], trim: true },
    designation: { type: String, trim: true, default: "" },
    content:     { type: String, required: [true, "Testimonial content is required"], trim: true },
    rating: {
      type: Number,
      min:  1,
      max:  5,
      default: 5,
    },
    avatar: {
      url:      { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    status: {
      type:    String,
      enum:    ["pending", "approved", "rejected"],
      default: "pending",
    },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Testimonial", testimonialSchema);
