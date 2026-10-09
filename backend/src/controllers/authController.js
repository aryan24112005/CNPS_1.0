"use strict";
const crypto      = require("crypto");
const jwt         = require("jsonwebtoken");
const Admin       = require("../models/Admin");
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
// Generates a 1-hour reset token and delivers a reset link via the
// Gmail API over HTTPS (OAuth 2.0).  No SMTP — avoids Render port blocks.
const forgotPassword = async (req, res) => {
  const isDev = process.env.NODE_ENV !== "production";

  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: "Email address is required." });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });

    // Always respond generically for unknown emails — prevents account enumeration.
    if (!admin) {
      return res.json({
        success: true,
        message: "If that email is registered, a reset link has been sent.",
      });
    }

    // ── 1. Generate a secure reset token ─────────────────────
    const rawToken  = crypto.randomBytes(32).toString("hex");  // 256-bit random
    const hashed    = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);  // 1 hour from now

    // Persist hashed token — use findByIdAndUpdate to bypass select:false issues
    await Admin.findByIdAndUpdate(admin._id, {
      resetPasswordToken:   hashed,
      resetPasswordExpires: expiresAt,
    });

    // ── 2. Build the production reset URL ────────────────────
    // FRONTEND_URL is "https://cnpspublicschool.netlify.app" on Render.
    // Hard-code the production fallback so a misconfigured env var never
    // produces a localhost link in production emails.
    const rawFrontendUrl = (process.env.FRONTEND_URL || "").split(",")[0].trim();
    const frontendUrl    = rawFrontendUrl ||
      (isDev ? "http://localhost:5173" : "https://cnpspublicschool.netlify.app");
    const resetUrl = `${frontendUrl}/login?resetToken=${rawToken}`;

    // ── 3. Check Gmail API credentials ───────────────────────
    const missing = gmailService.missingCredentials();
    if (missing.length > 0) {
      console.error("[ForgotPassword] Gmail API credentials not configured:", missing.join(", "));

      if (isDev) {
        // Development without credentials — return the raw token so the
        // flow can be tested locally without a Google Cloud project.
        return res.json({
          success: true,
          message: "Gmail API not configured (dev mode). Use the token below.",
          resetToken: rawToken,
          resetUrl,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Email service is not configured. Please contact the administrator.",
      });
    }

    // ── 4. Send via Gmail API ────────────────────────────────
    // sendEmail() throws on any failure — the error is never swallowed.
    // rawToken is NOT included in the email body or any log line.
    console.log("[ForgotPassword] Requesting Gmail API send to:", admin.email);
    try {
      const result = await gmailService.sendEmail({
        to:      admin.email,
        subject: "Password Reset Request — CNPS Admin Portal",
        html: buildResetEmailHtml(admin.name, resetUrl),
      });

      console.log(
        "[ForgotPassword] Email delivered — Gmail ID:", result.messageId,
        "| recipient:", admin.email
      );

      return res.json({
        success: true,
        message: "A password reset link has been sent to your email address.",
      });
    } catch (sendErr) {
      // sendErr.message is safe to surface in logs (no secrets inside it).
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

    // Hash the incoming raw token and compare with the stored hash
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

    // Update the password — pre-save hook bcrypt-hashes it.
    // Clear the token fields so the link cannot be reused.
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

// ── Helpers ───────────────────────────────────────────────────

/**
 * Builds the HTML body for the password-reset email.
 * resetUrl contains the raw token — do not log it.
 *
 * @param {string} adminName
 * @param {string} resetUrl
 * @returns {string}
 */
function buildResetEmailHtml(adminName, resetUrl) {
  return `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f5f7fa;border-radius:12px;">
      <div style="background:#102A43;padding:20px;border-radius:8px 8px 0 0;text-align:center;">
        <h2 style="color:#fff;margin:0;font-size:1.3rem;">CNPS Public School</h2>
        <p style="color:rgba(255,255,255,0.65);margin:4px 0 0;font-size:0.85rem;">Admin Portal</p>
      </div>
      <div style="background:#fff;padding:32px 28px;border-radius:0 0 8px 8px;border:1px solid #D9EEF7;border-top:none;">
        <h3 style="color:#102A43;margin:0 0 12px;">Password Reset Request</h3>
        <p style="color:#52606D;line-height:1.6;">Hi <strong>${adminName}</strong>,</p>
        <p style="color:#52606D;line-height:1.6;">
          We received a request to reset your password. Click the button below to set a new password.
          This link is valid for <strong>1 hour</strong>.
        </p>
        <div style="text-align:center;margin:28px 0;">
          <a href="${resetUrl}"
             style="display:inline-block;background:#16A8E0;color:#fff;padding:13px 32px;border-radius:999px;font-weight:700;font-size:1rem;text-decoration:none;">
            Reset My Password
          </a>
        </div>
        <p style="color:#829AB1;font-size:0.82rem;line-height:1.6;">
          If you didn't request a password reset, you can safely ignore this email.
          Your password will not change.
        </p>
        <hr style="border:none;border-top:1px solid #D9EEF7;margin:20px 0;" />
        <p style="color:#829AB1;font-size:0.78rem;margin:0;">
          If the button doesn't work, copy and paste this link into your browser:<br/>
          <a href="${resetUrl}" style="color:#16A8E0;word-break:break-all;">${resetUrl}</a>
        </p>
      </div>
    </div>
  `;
}

module.exports = { login, getMe, changePassword, forgotPassword, resetPassword };
