"use strict";
const mongoose = require("mongoose");

const socialLinksSchema = new mongoose.Schema({
  facebook:  { type: String, default: "" },
  instagram: { type: String, default: "" },
  youtube:   { type: String, default: "" },
  twitter:   { type: String, default: "" },
  linkedin:  { type: String, default: "" },
}, { _id: false });

const siteSettingsSchema = new mongoose.Schema(
  {
    schoolName:   { type: String, trim: true, default: "CNPS Public School" },
    tagline:      { type: String, trim: true, default: "" },
    logo: {
      url:      { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    favicon: {
      url:      { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    // Contact info
    address:    { type: String, trim: true, default: "" },
    phone:      { type: String, trim: true, default: "" },
    phone2:     { type: String, trim: true, default: "" },
    email:      { type: String, trim: true, default: "" },
    mapEmbedUrl:{ type: String, trim: true, default: "" },
    // Principal
    principalName:        { type: String, trim: true, default: "" },
    principalMessage:     { type: String, trim: true, default: "" },
    // Social links
    socialLinks: { type: socialLinksSchema, default: () => ({}) },
    // Footer
    footerAbout:     { type: String, trim: true, default: "" },
    footerCopyright: { type: String, trim: true, default: "" },
    // About page content
    aboutHeading:     { type: String, trim: true, default: "" },
    aboutDescription: { type: String, trim: true, default: "" },
    aboutMission:     { type: String, trim: true, default: "" },
    aboutVision:      { type: String, trim: true, default: "" },
    aboutValues:      { type: String, trim: true, default: "" },
    aboutImage1: { url: { type: String, default: "" }, publicId: { type: String, default: "" } },
    aboutImage2: { url: { type: String, default: "" }, publicId: { type: String, default: "" } },
    aboutImage3: { url: { type: String, default: "" }, publicId: { type: String, default: "" } },
    // Extended gallery: supports any number of about-page images.
    // aboutImages supersedes aboutImage1/2/3 when populated.
    // Maximum 20 images for performance.
    aboutImages: [{
      url:      { type: String, default: "" },
      publicId: { type: String, default: "" },
      _id: false,
    }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("SiteSettings", siteSettingsSchema);
