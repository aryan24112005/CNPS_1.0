"use strict";
const mongoose = require("mongoose");

const contactMessageSchema = new mongoose.Schema(
  {
    name:    { type: String, required: [true, "Name is required"], trim: true },
    email:   { type: String, required: [true, "Email is required"], trim: true },
    phone:   { type: String, trim: true, default: "" },
    subject: { type: String, trim: true, default: "" },
    message: { type: String, required: [true, "Message is required"], trim: true },
    isRead:  { type: Boolean, default: false },
    status: {
      type:    String,
      enum:    ["new", "read", "replied", "archived"],
      default: "new",
    },
    adminNotes: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ContactMessage", contactMessageSchema);
