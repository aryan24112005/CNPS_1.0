"use strict";
const crypto       = require("crypto");
const jwt          = require("jsonwebtoken");
const Admin        = require("../models/Admin");
const gmailService = require("../services/gmailService");

// ── POST /api/auth/login ──────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (!admin) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    if (admin.status !== "active") {
      return res.status(403).json({ success: false, message: "Your account is inactive. Contact support." });
    }

    const match = await admin.comparePassword(password);
    if (!match) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    return res.json({
      success: true,
      message: "Login successful.",
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: "Login failed. Please try again." });
  }
};

// ── GET /api/auth/me ──────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id);
    if (!admin) return res.status(404).json({ success: false, message: "Admin not found." });
    return res.json({
      success: true,
      data: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch profile." });
  }
};

// ── PUT /api/auth/change-password ─────────────────────────────
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Both current and new password are required." });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: "New password must be at least 8 characters." });
    }

    const admin = await Admin.findById(req.admin.id).select("+password");
    if (!admin) return res.status(404).json({ success: false, message: "Admin not found." });

    const match = await admin.comparePassword(currentPassword);
    if (!match) return res.status(400).json({ success: false, message: "Current password is incorrect." });

    admin.password = newPassword;
    await admin.save();

    return res.json({ success: true, message: "Password changed successfully." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to change password." });
  }
};

// ── POST /api/auth/forgot-password ────────────────────────────
// Generates a 1-hour reset token, stores it hashed, and emails a reset link
// via the Gmail API over HTTPS (avoids Render's blocked SMTP ports).
//
// Reset URL format:  <FRONTEND_URL>/login?resetToken=<rawToken>
// Frontend reads:    searchParams.get("resetToken")  →  ResetPasswordForm
// Backend validates: SHA-256(rawToken) matches stored hash, expiry > now
const forgotPassword = async (req, res) => {
  const isDev = process.env.NODE_ENV !== "production";

  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: "Email address is required." });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });

    // Always return 200 for unknown addresses — prevents account enumeration.
    if (!admin) {
      return res.json({
        success: true,
        message: "If that email is registered, a reset link has been sent.",
      });
    }

    // ── 1. Generate a secure reset token ─────────────────────
    const rawToken  = crypto.randomBytes(32).toString("hex"); // 256-bit
    const hashed    = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Use findByIdAndUpdate to avoid select:false field issues on .save()
    await Admin.findByIdAndUpdate(admin._id, {
      resetPasswordToken:   hashed,
      resetPasswordExpires: expiresAt,
    });

    // ── 2. Build the reset URL ────────────────────────────────
    // FRONTEND_URL on Render = "https://cnpspublicschool.netlify.app"
    // Hard-code the production fallback so a blank env var never generates
    // a localhost link in a live reset email.
    const rawFrontendUrl = (process.env.FRONTEND_URL || "").split(",")[0].trim();
    const frontendUrl    = rawFrontendUrl ||
      (isDev ? "http://localhost:5173" : "https://cnpspublicschooll.netlify.app");
    const resetUrl = frontendUrl + "/login?resetToken=" + rawToken;
    // NOTE: rawToken is in resetUrl — resetUrl must never be logged.

    // ── 3. Check Gmail API credentials ───────────────────────
    const missing = gmailService.missingCredentials();
    if (missing.length > 0) {
      console.error("[ForgotPassword] Gmail API credentials not configured:", missing.join(", "));
      if (isDev) {
        // Dev-only: return the token directly so the flow can be tested
        // without a Google Cloud project.
        return res.json({
          success:    true,
          message:    "Gmail API not configured (dev mode). Use the token below.",
          resetToken: rawToken,
          resetUrl,
        });
      }
      return res.status(500).json({
        success: false,
        message: "Email service is not configured. Please contact the administrator.",
      });
    }

    // ── 4. Send the password-reset email via Gmail API ───────
    console.log("[ForgotPassword] Sending reset email via Gmail API | recipient:", admin.email);

    try {
      const result = await gmailService.sendEmail({
        to:      admin.email,
        subject: "Reset Your CNPS Admin Password",
        html:    buildResetEmailHtml(admin.name, resetUrl, expiresAt),
        text:    buildResetEmailText(admin.name, resetUrl),
      });

      console.log(
        "[ForgotPassword] Reset email accepted — Gmail ID:", result.messageId,
        "| recipient:", admin.email
      );

      return res.json({
        success: true,
        message: "A password reset link has been sent to your email address.",
      });
    } catch (sendErr) {
      // sendErr.message is safe (contains no credentials or tokens).
      console.error("[ForgotPassword] Gmail API send failed:", sendErr.message);
      return res.status(500).json({
        success: false,
        message: "Failed to send reset email. Please try again later or contact support.",
        ...(isDev && { debug: sendErr.message }),
      });
    }
  } catch (err) {
    console.error("[ForgotPassword] Unexpected error:", err.message);
    return res.status(500).json({ success: false, message: "Failed to process request. Please try again." });
  }
};

// ── POST /api/auth/reset-password ────────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !token.trim()) {
      return res.status(400).json({ success: false, message: "Reset token is required." });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters." });
    }

    // Hash the incoming raw token and compare with the stored hash.
    const hashed = crypto.createHash("sha256").update(token.trim()).digest("hex");

    const admin = await Admin.findOne({
      resetPasswordToken:   hashed,
      resetPasswordExpires: { $gt: Date.now() },
    }).select("+resetPasswordToken +resetPasswordExpires");

    if (!admin) {
      return res.status(400).json({
        success: false,
        message: "This reset link is invalid or has expired. Please request a new one.",
      });
    }

    // Update the password — the pre-save hook bcrypt-hashes it.
    // Clear token fields so the link cannot be reused.
    admin.password             = password;
    admin.resetPasswordToken   = undefined;
    admin.resetPasswordExpires = undefined;
    await admin.save();

    return res.json({ success: true, message: "Password has been reset successfully. You can now log in." });
  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({ success: false, message: "Failed to reset password. Please try again." });
  }
};

// ── Email template helpers ────────────────────────────────────

/**
 * HTML body for the password-reset email.
 *
 * The resetUrl contains the raw token — do not log it anywhere.
 * The link opens /login?resetToken=<rawToken> on the frontend.
 * Login.jsx reads searchParams.get("resetToken") and renders ResetPasswordForm.
 *
 * @param {string} adminName
 * @param {string} resetUrl   — complete clickable URL (contains raw token)
 * @param {Date}   expiresAt  — token expiry Date object
 * @returns {string}
 */
function buildResetEmailHtml(adminName, resetUrl, expiresAt) {
  const expiryStr = expiresAt.toUTCString();
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Reset Your CNPS Admin Password</title>
</head>
<body style="margin:0;padding:0;background:#F5F7FA;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F7FA;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0"
               style="max-width:520px;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#102A43;padding:24px 28px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:1.25rem;font-weight:700;">CNPS Public School</h1>
              <p style="margin:4px 0 0;color:rgba(255,255,255,0.6);font-size:0.8rem;">Admin Portal</p>
            </td>
          </tr>
          <tr>
            <td style="background:#ffffff;padding:32px 28px;">
              <div style="text-align:center;margin-bottom:20px;">
                <div style="display:inline-block;width:56px;height:56px;background:#EAF7FC;
                            border-radius:50%;line-height:56px;text-align:center;">
                  <span style="font-size:1.6rem;">&#128273;</span>
                </div>
              </div>
              <h2 style="margin:0 0 10px;color:#102A43;font-size:1.15rem;text-align:center;">
                Password Reset Request
              </h2>
              <p style="color:#52606D;line-height:1.7;margin:0 0 12px;">
                Hi <strong>${adminName}</strong>,
              </p>
              <p style="color:#52606D;line-height:1.7;margin:0 0 24px;">
                We received a request to reset the password for your CNPS Admin account.
                Click the button below to choose a new password.
                This link will expire on <strong>${expiryStr}</strong> (1 hour).
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}"
                       style="display:inline-block;background:#16A8E0;color:#ffffff;
                              padding:14px 36px;border-radius:999px;font-weight:700;
                              font-size:1rem;text-decoration:none;">
                      Reset My Password
                    </a>
                  </td>
                </tr>
              </table>
              <hr style="border:none;border-top:1px solid #E4EDF5;margin:0 0 20px;" />
              <p style="color:#829AB1;font-size:0.82rem;line-height:1.6;margin:0 0 16px;">
                If the button above doesn't work, copy and paste this link into your browser:
              </p>
              <p style="margin:0 0 20px;word-break:break-all;">
                <a href="${resetUrl}" style="color:#16A8E0;font-size:0.8rem;">${resetUrl}</a>
              </p>
              <p style="color:#829AB1;font-size:0.8rem;line-height:1.6;margin:0;">
                If you did not request a password reset, you can safely ignore this email —
                your password will not change.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#F5F7FA;padding:16px 28px;text-align:center;border-top:1px solid #E4EDF5;">
              <p style="margin:0;color:#A0AEC0;font-size:0.75rem;">
                &copy; ${new Date().getFullYear()} CNPS Public School &middot; Automated message, please do not reply.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Plain-text body for the password-reset email (multipart/alternative fallback).
 * Must include the reset URL so users with text-only clients can still reset.
 *
 * @param {string} adminName
 * @param {string} resetUrl
 * @returns {string}
 */
function buildResetEmailText(adminName, resetUrl) {
  return [
    "CNPS Public School — Admin Portal",
    "Password Reset Request",
    "",
    "Hi " + adminName + ",",
    "",
    "We received a request to reset the password for your CNPS Admin account.",
    "Click or copy the link below to set a new password.",
    "This link is valid for 1 hour.",
    "",
    resetUrl,
    "",
    "If you did not request a password reset, you can safely ignore this email.",
    "Your password will not change.",
    "",
    "© " + new Date().getFullYear() + " CNPS Public School",
  ].join("\n");
}

module.exports = { login, getMe, changePassword, forgotPassword, resetPassword };
