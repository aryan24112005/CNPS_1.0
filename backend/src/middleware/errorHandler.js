"use strict";
const multer = require("multer");

function errorHandler(err, req, res, next) {
  console.error("[Error]", err);

  // Multer file size/count errors
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ success: false, message: "File is too large. Please upload a smaller file." });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({ success: false, message: "Too many files selected at once." });
    }
    return res.status(400).json({ success: false, message: "File upload error: " + err.message });
  }

  // Cloudinary / validation errors
  if (err.message && (err.message.includes("Only") || err.message.includes("allowed"))) {
    return res.status(400).json({ success: false, message: err.message });
  }

  // Mongoose validation errors
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message).join(", ");
    return res.status(400).json({ success: false, message: messages });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    return res.status(400).json({ success: false, message: "A record with this information already exists." });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ success: false, message: "Invalid or expired session. Please log in again." });
  }

  const status = err.status || err.statusCode || 500;
  const message = status === 500 ? "Something went wrong. Please try again." : (err.message || "An error occurred.");

  res.status(status).json({ success: false, message });
}

module.exports = { errorHandler };
