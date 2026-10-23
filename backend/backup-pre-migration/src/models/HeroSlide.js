"use strict";
const mongoose = require("mongoose");

const heroSlideSchema = new mongoose.Schema(
  {
    title:       { type: String, trim: true, default: "" },
    subtitle:    { type: String, trim: true, default: "" },
    description: { type: String, trim: true, default: "" },
    buttonText:  { type: String, trim: true, default: "" },
    buttonUrl:   { type: String, trim: true, default: "/admission" },
    image: {
      url:      { type: String, default: "" },
      publicId: { type: String, default: "" },
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

module.exports = mongoose.model("HeroSlide", heroSlideSchema);
