"use strict";
const crypto     = require("crypto");
const jwt        = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const Admin      = require("../models/Admin");

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

// ── POST /api/auth/forgot-password ───────────────────────────
// Generates a 1-hour reset token. Sends it by email if SMTP is configured,
// otherwise returns the token in the response body (dev mode only).
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: "Email address is required." });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });

    // Always return 200 — don't reveal whether the email exists
    if (!admin) {
      return res.json({
        success: true,
        message: "If that email is registered, a reset link has been sent.",
      });
    }

    // Generate a secure random token
    const rawToken  = crypto.randomBytes(32).toString("hex");
    const hashed    = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    admin.resetPasswordToken   = hashed;
    admin.resetPasswordExpires = expiresAt;
    await admin.save({ validateBeforeSave: false });

    const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").split(",")[0].trim();
    const resetUrl    = `${frontendUrl}/login?resetToken=${rawToken}`;

    // ── Try to send email if SMTP is configured ───────────────
    const smtpConfigured =
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.SMTP_USER !== "your@gmail.com";

    if (smtpConfigured) {
      try {
        const transporter = nodemailer.createTransport({
          host:   process.env.SMTP_HOST,
          port:   Number(process.env.SMTP_PORT) || 587,
          secure: Number(process.env.SMTP_PORT) === 465,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        await transporter.sendMail({
          from:    `"${process.env.EMAIL_FROM_NAME || "CNPS School"}" <${process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_USER}>`,
          to:      admin.email,
          subject: "Password Reset Request — CNPS Admin Portal",
          html: `
            <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f5f7fa;border-radius:12px;">
              <div style="background:#102A43;padding:20px;border-radius:8px 8px 0 0;text-align:center;">
                <h2 style="color:#fff;margin:0;font-size:1.3rem;">CNPS Public School</h2>
                <p style="color:rgba(255,255,255,0.65);margin:4px 0 0;font-size:0.85rem;">Admin Portal</p>
              </div>
              <div style="background:#fff;padding:32px 28px;border-radius:0 0 8px 8px;border:1px solid #D9EEF7;border-top:none;">
                <h3 style="color:#102A43;margin:0 0 12px;">Password Reset Request</h3>
                <p style="color:#52606D;line-height:1.6;">Hi <strong>${admin.name}</strong>,</p>
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
          `,
        });

        return res.json({
          success: true,
          message: "A password reset link has been sent to your email address.",
        });
      } catch (mailErr) {
        console.error("[ForgotPassword] Email send failed:", mailErr.message);
        // Fall through to dev mode response
      }
    }

    // ── Dev mode — return token directly (no email configured) ─
    const isDev = process.env.NODE_ENV !== "production";
    return res.json({
      success: true,
      message: isDev
        ? "SMTP not configured. Use the reset token below (dev mode only)."
        : "If that email is registered, a reset link has been sent.",
      // Only expose the raw token in development
      ...(isDev && { resetToken: rawToken, resetUrl }),
    });
  } catch (err) {
    console.error("Forgot password error:", err);
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

    // Hash the incoming raw token to compare with stored hash
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

    // Set new password (pre-save hook will hash it)
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

module.exports = { login, getMe, changePassword, forgotPassword, resetPassword };
