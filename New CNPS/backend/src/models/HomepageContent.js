"use strict";
const mongoose = require("mongoose");

const countStatSchema = new mongoose.Schema({
  icon:      { type: String, default: "bi-people" },
  value:     { type: Number, default: 0 },
  label:     { type: String, trim: true, default: "" },
  suffix:    { type: String, trim: true, default: "+" },
  sortOrder: { type: Number, default: 0 },
});

const homepageContentSchema = new mongoose.Schema(
  {
    // About section on homepage
    aboutHeading:     { type: String, trim: true, default: "About CNPS Public School" },
    aboutSubheading:  { type: String, trim: true, default: "" },
    aboutDescription: { type: String, trim: true, default: "" },
    aboutImage: {
      url:      { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    aboutPoints:       [{ type: String, trim: true }],
    // Why Choose Us section
    whyUsHeading:     { type: String, trim: true, default: "Why Choose CNPS?" },
    whyUsDescription: { type: String, trim: true, default: "" },
    // Count stats
    countStats: [countStatSchema],
    // Call to action
    ctaHeading:     { type: String, trim: true, default: "Ready to Join CNPS?" },
    ctaDescription: { type: String, trim: true, default: "" },
    ctaButtonText:  { type: String, trim: true, default: "Apply for Admission" },
    ctaButtonUrl:   { type: String, trim: true, default: "/admission" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HomepageContent", homepageContentSchema);
