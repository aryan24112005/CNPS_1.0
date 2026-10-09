"use strict";
const mongoose = require("mongoose");

const admissionEnquirySchema = new mongoose.Schema(
  {
    studentName:   { type: String, required: [true, "Student name is required"], trim: true },
    dob:           { type: String, trim: true, default: "" },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: [true, "Gender is required"],
    },
    className:     { type: String, required: [true, "Class is required"], trim: true },
    stream:        { type: String, trim: true, default: "" },
    scienceGroup:  { type: String, trim: true, default: "" },
    fatherName:    { type: String, trim: true, default: "" },
    motherName:    { type: String, trim: true, default: "" },
    mobile:        { type: String, required: [true, "Mobile number is required"], trim: true },
    email:         { type: String, trim: true, default: "" },
    address:       { type: String, required: [true, "Address is required"], trim: true },
    status: {
      type:    String,
      enum:    ["new", "reviewed", "contacted", "admitted", "rejected"],
      default: "new",
    },
    adminNotes: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdmissionEnquiry", admissionEnquirySchema);
