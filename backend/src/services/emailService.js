"use strict";
/**
 * emailService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Sends email via Nodemailer SMTP (Gmail App Password).
 *
 * Required environment variables:
 *   SMTP_HOST         — e.g. smtp.gmail.com
 *   SMTP_PORT         — e.g. 587
 *   SMTP_USER         — Gmail address used for sending
 *   SMTP_PASS         — Gmail App Password (16-char, no spaces)
 *   SMTP_FROM_NAME    — Display name in From header
 *   SMTP_FROM_EMAIL   — From email address
 */

const nodemailer = require("nodemailer");

/**
 * Returns an array of required env var names that are missing or empty.
 * Empty array means all credentials are present.
 *
 * @returns {string[]}
 */
function missingCredentials() {
  return ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"].filter(
    (k) => !process.env[k] || !process.env[k].trim()
  );
}

/**
 * Build and verify the SMTP transporter.
 *
 * @returns {import('nodemailer').Transporter}
 */
function buildTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST.trim(),
    port: parseInt(process.env.SMTP_PORT.trim(), 10),
    secure: parseInt(process.env.SMTP_PORT.trim(), 10) === 465, // true for 465, false for 587
    auth: {
      user: process.env.SMTP_USER.trim(),
      // Gmail App Passwords contain spaces for readability — strip them
      pass: process.env.SMTP_PASS.trim().replace(/\s+/g, ""),
    },
  });
}

/**
 * Send an email via SMTP.
 *
 * @param {object} opts
 * @param {string} opts.to       — recipient address
 * @param {string} opts.subject  — email subject
 * @param {string} opts.html     — HTML body
 * @param {string} [opts.text]   — plain-text body (auto-stripped from html if omitted)
 * @returns {Promise<{ messageId: string }>}
 * @throws {Error} — descriptive message, no secrets included
 */
async function sendEmail({ to, subject, html, text }) {
  // 1. Validate configuration
  const missing = missingCredentials();
  if (missing.length > 0) {
    console.error("[EmailService] Missing SMTP env vars:", missing.join(", "));
    throw new Error("Email service not configured. Missing: " + missing.join(", "));
  }

  const fromName  = (process.env.SMTP_FROM_NAME  || "CNPS Public School").trim();
  const fromEmail = (process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER).trim();
  const from      = `"${fromName}" <${fromEmail}>`;

  // Plain-text fallback: strip HTML tags
  const plainText =
    text ||
    html
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s{2,}/g, " ")
      .trim();

  // 2. Build transporter
  const transporter = buildTransporter();

  // 3. Send
  let info;
  try {
    info = await transporter.sendMail({
      from,
      to,
      subject,
      text: plainText,
      html,
    });
  } catch (err) {
    console.error("[EmailService] SMTP send failed:", err.message);

    if (err.code === "EAUTH") {
      throw new Error(
        "SMTP authentication failed. Check SMTP_USER and SMTP_PASS in your .env file."
      );
    }
    if (err.code === "ECONNREFUSED" || err.code === "ETIMEDOUT") {
      throw new Error(
        "Could not connect to SMTP server. Check SMTP_HOST and SMTP_PORT."
      );
    }
    throw new Error("SMTP send error: " + err.message);
  }

  console.log(
    "[EmailService] Message sent — messageId:",
    info.messageId,
    "| to:",
    to
  );
  return { messageId: info.messageId };
}

module.exports = { sendEmail, missingCredentials };
