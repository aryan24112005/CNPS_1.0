"use strict";
const { ContactMessage } = require("../models/sql");
const { serializeContact } = require("../utils/serializers");
const { Op } = require("sequelize");

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
  } catch (err) { return res.status(500).json({ success: false, message: "Failed to send message." }); }
};

const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const where = {};
    if (status) where.status = status;
    if (search && search.trim()) {
      const s = `%${search.trim()}%`;
      where[Op.or] = [
        { name:    { [Op.like]: s } },
        { email:   { [Op.like]: s } },
        { phone:   { [Op.like]: s } },
        { subject: { [Op.like]: s } },
        { message: { [Op.like]: s } },
      ];
    }
    const total = await ContactMessage.count({ where });
    const items = await ContactMessage.findAll({
      where,
      order: [["createdAt", "DESC"]],
      offset: (Number(page) - 1) * Number(limit),
      limit: Number(limit),
    });
    return res.json({ success: true, data: items.map(serializeContact), total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (err) { return res.status(500).json({ success: false, message: "Failed to fetch messages." }); }
};

const getOne = async (req, res) => {
  try {
    const item = await ContactMessage.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Message not found." });
    if (!item.isRead) { await item.update({ isRead: true, status: item.status === "new" ? "read" : item.status }); }
    return res.json({ success: true, data: serializeContact(item) });
  } catch { return res.status(500).json({ success: false, message: "Failed to fetch message." }); }
};

const updateStatus = async (req, res) => {
  try {
    const item = await ContactMessage.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Message not found." });
    const { status, adminNotes } = req.body;
    const updates = {};
    if (status) updates.status = status;
    if (adminNotes !== undefined) updates.adminNotes = adminNotes;
    await item.update(updates);
    return res.json({ success: true, message: "Message updated.", data: serializeContact(item) });
  } catch { return res.status(500).json({ success: false, message: "Failed to update message." }); }
};

const remove = async (req, res) => {
  try {
    const item = await ContactMessage.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Message not found." });
    await item.destroy();
    return res.json({ success: true, message: "Message deleted." });
  } catch { return res.status(500).json({ success: false, message: "Failed to delete message." }); }
};

module.exports = { submit, getAll, getOne, updateStatus, remove };
