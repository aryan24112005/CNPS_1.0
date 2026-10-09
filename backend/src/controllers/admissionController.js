"use strict";
const AdmissionEnquiry = require("../models/AdmissionEnquiry");

// POST /api/admissions  (public)
const submit = async (req, res) => {
  try {
    const { studentName, dob, gender, className, stream, scienceGroup,
            fatherName, motherName, mobile, email, address } = req.body;

    if (!studentName?.trim() || !gender || !className?.trim() || !mobile?.trim() || !address?.trim()) {
      return res.status(400).json({ success: false, message: "Please fill all required fields." });
    }
    if (!["Male","Female","Other"].includes(gender)) {
      return res.status(400).json({ success: false, message: "Invalid gender." });
    }

    const isSenior = className === "11" || className === "12";
    if (isSenior && !stream) {
      return res.status(400).json({ success: false, message: "Stream is required for Class 11 and 12." });
    }

    await AdmissionEnquiry.create({
      studentName: studentName.trim(), dob, gender, className: className.trim(),
      stream: stream || "", scienceGroup: scienceGroup || "",
      fatherName: fatherName || "", motherName: motherName || "",
      mobile: mobile.trim(), email: email || "", address: address.trim(),
    });
    return res.status(201).json({ success: true, message: "Admission enquiry submitted successfully. We will contact you shortly." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to submit admission enquiry." });
  }
};

// GET /api/admissions/admin
const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;

    // Build filter — status filter + optional text search
    const filter = {};
    if (status) filter.status = status;

    if (search && search.trim()) {
      const re = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [
        { studentName: re },
        { fatherName:  re },
        { motherName:  re },
        { mobile:      re },
        { email:       re },
        { className:   re },
        { address:     re },
      ];
    }

    const total = await AdmissionEnquiry.countDocuments(filter);
    const items = await AdmissionEnquiry.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    return res.json({
      success: true,
      data: items,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch admission enquiries." });
  }
};

const getOne = async (req, res) => {
  try {
    const item = await AdmissionEnquiry.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Enquiry not found." });
    return res.json({ success: true, data: item });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to fetch enquiry." });
  }
};

const updateStatus = async (req, res) => {
  try {
    const item = await AdmissionEnquiry.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Enquiry not found." });
    const { status, adminNotes } = req.body;
    if (status) item.status = status;
    if (adminNotes !== undefined) item.adminNotes = adminNotes;
    await item.save();
    return res.json({ success: true, message: "Enquiry updated.", data: item });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to update enquiry." });
  }
};

const remove = async (req, res) => {
  try {
    const item = await AdmissionEnquiry.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Enquiry not found." });
    await item.deleteOne();
    return res.json({ success: true, message: "Enquiry deleted." });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to delete enquiry." });
  }
};

module.exports = { submit, getAll, getOne, updateStatus, remove };
