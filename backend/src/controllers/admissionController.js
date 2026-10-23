"use strict";
const { AdmissionEnquiry } = require("../models/sql");
const { serializeAdmission } = require("../utils/serializers");
const { Op } = require("sequelize");

// Current policy version — increment this string when the policy changes
const POLICY_VERSION = "1.0";

const submit = async (req, res) => {
  try {
    const {
      studentName, dob, gender, className, stream, scienceGroup,
      fatherName, motherName, mobile, email, address,
      consentAccepted,
    } = req.body;

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

    // ── Server-side consent validation ──────────────────────
    const accepted = consentAccepted === true ||
                     consentAccepted === "true" ||
                     consentAccepted === 1 ||
                     consentAccepted === "1";
    if (!accepted) {
      return res.status(400).json({
        success: false,
        message: "You must accept the Terms & Conditions and Privacy Policy to submit an application.",
      });
    }

    await AdmissionEnquiry.create({
      studentName:     studentName.trim(),
      dob,
      gender,
      className:       className.trim(),
      stream:          stream       || "",
      scienceGroup:    scienceGroup || "",
      fatherName:      fatherName   || "",
      motherName:      motherName   || "",
      mobile:          mobile.trim(),
      email:           email        || "",
      address:         address.trim(),
      consentAccepted: 1,
      consentVersion:  POLICY_VERSION,
      consentAt:       new Date(),
    });
    return res.status(201).json({ success: true, message: "Admission enquiry submitted successfully. We will contact you shortly." });
  } catch (err) { return res.status(500).json({ success: false, message: "Failed to submit admission enquiry." }); }
};

const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const where = {};
    if (status) where.status = status;
    if (search && search.trim()) {
      const s = `%${search.trim()}%`;
      where[Op.or] = [
        { studentName: { [Op.like]: s } },
        { fatherName:  { [Op.like]: s } },
        { motherName:  { [Op.like]: s } },
        { mobile:      { [Op.like]: s } },
        { email:       { [Op.like]: s } },
        { className:   { [Op.like]: s } },
        { address:     { [Op.like]: s } },
      ];
    }
    const total = await AdmissionEnquiry.count({ where });
    const items = await AdmissionEnquiry.findAll({
      where,
      order: [["createdAt", "DESC"]],
      offset: (Number(page) - 1) * Number(limit),
      limit: Number(limit),
    });
    return res.json({ success: true, data: items.map(serializeAdmission), total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (err) { return res.status(500).json({ success: false, message: "Failed to fetch admission enquiries." }); }
};

const getOne = async (req, res) => {
  try {
    const item = await AdmissionEnquiry.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Enquiry not found." });
    return res.json({ success: true, data: serializeAdmission(item) });
  } catch { return res.status(500).json({ success: false, message: "Failed to fetch enquiry." }); }
};

const updateStatus = async (req, res) => {
  try {
    const item = await AdmissionEnquiry.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Enquiry not found." });
    const { status, adminNotes } = req.body;
    const updates = {};
    if (status) updates.status = status;
    if (adminNotes !== undefined) updates.adminNotes = adminNotes;
    await item.update(updates);
    return res.json({ success: true, message: "Enquiry updated.", data: serializeAdmission(item) });
  } catch { return res.status(500).json({ success: false, message: "Failed to update enquiry." }); }
};

const remove = async (req, res) => {
  try {
    const item = await AdmissionEnquiry.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Enquiry not found." });
    await item.destroy();
    return res.json({ success: true, message: "Enquiry deleted." });
  } catch { return res.status(500).json({ success: false, message: "Failed to delete enquiry." }); }
};

module.exports = { submit, getAll, getOne, updateStatus, remove };
