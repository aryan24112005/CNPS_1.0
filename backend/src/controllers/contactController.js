"use strict";
const ContactMessage = require("../models/ContactMessage");

const submit = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(400).json({ success: false, message: "Name, email, and message are required." });
    }
    await ContactMessage.create({
      name: name.trim(), email: email.trim(),
      phone: phone || "", subject: subject || "", message: message.trim(),
    });
    return res.status(201).json({ success: true, message: "Your message has been sent. We will get back to you soon." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to send message." });
  }
};

// GET /api/contact/admin
const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;

    const filter = {};
    if (status) filter.status = status;

    if (search && search.trim()) {
      const re = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [
        { name:    re },
        { email:   re },
        { phone:   re },
        { subject: re },
        { message: re },
      ];
    }

    const total = await ContactMessage.countDocuments(filter);
    const items = await ContactMessage.find(filter)
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
  } catch {
    return res.status(500).json({ success: false, message: "Failed to fetch messages." });
  }
};

const getOne = async (req, res) => {
  try {
    const item = await ContactMessage.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Message not found." });
    if (!item.isRead) {
      item.isRead = true;
      item.status = item.status === "new" ? "read" : item.status;
      await item.save();
    }
    return res.json({ success: true, data: item });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to fetch message." });
  }
};

const updateStatus = async (req, res) => {
  try {
    const item = await ContactMessage.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Message not found." });
    const { status, adminNotes } = req.body;
    if (status) item.status = status;
    if (adminNotes !== undefined) item.adminNotes = adminNotes;
    await item.save();
    return res.json({ success: true, message: "Message updated.", data: item });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to update message." });
  }
};

const remove = async (req, res) => {
  try {
    const item = await ContactMessage.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Message not found." });
    await item.deleteOne();
    return res.json({ success: true, message: "Message deleted." });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to delete message." });
  }
};

module.exports = { submit, getAll, getOne, updateStatus, remove };
