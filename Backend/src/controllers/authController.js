import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import pool from "../config/db.js";

import { sendPasswordResetOTP } from "../utils/emailService.js";

export const login = async (req, res) => {
    try {
        console.log("REQUEST BODY:", req.body);
        const { email, password } = req.body;

        // Basic validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        // Find admin
        const [admins] = await pool.query(
            `SELECT id, name, email, password, role, status
       FROM cms_admins
       WHERE email = ?
       LIMIT 1`,
            [email]
        );

        if (admins.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        const admin = admins[0];

        // Check account status
        if (admin.status !== "active") {
            return res.status(403).json({
                success: false,
                message: "Your account is inactive",
            });
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(
            password,
            admin.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Create JWT
        const token = jwt.sign(
            {
                id: admin.id,
                email: admin.email,
                role: admin.role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || "1d",
            }
        );

        return res.json({
            success: true,
            message: "Login successful",
            token,
            admin: {
                id: admin.id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
            },
        });
    } catch (error) {
        console.error("Login Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const getMe = async (req, res) => {
    try {
        const [admins] = await pool.query(
            `SELECT id, name, email, role, status, created_at
       FROM cms_admins
       WHERE id = ?
       LIMIT 1`,
            [req.admin.id]
        );

        if (admins.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Admin not found",
            });
        }

        const admin = admins[0];

        if (admin.status !== "active") {
            return res.status(403).json({
                success: false,
                message: "Your account is inactive",
            });
        }

        return res.json({
            success: true,
            admin,
        });
    } catch (error) {
        console.error("Get Admin Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

/*
|--------------------------------------------------------------------------
| Forgot Password - Send OTP
|--------------------------------------------------------------------------
*/

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Find admin
        const [admins] = await pool.query(
            `
            SELECT id, name, email, status
            FROM cms_admins
            WHERE email = ?
            LIMIT 1
            `,
            [normalizedEmail]
        );

        /*
        Security:
        Don't reveal whether an email exists or not.
        */

        if (admins.length === 0) {
            return res.status(200).json({
                success: true,
                message:
                    "If an account exists with this email, an OTP has been sent.",
            });
        }

        const admin = admins[0];

        if (admin.status !== "active") {
            return res.status(200).json({
                success: true,
                message:
                    "If an account exists with this email, an OTP has been sent.",
            });
        }

        // Generate 6 digit OTP
        const otp = crypto
            .randomInt(100000, 1000000)
            .toString();

        // Hash OTP before storing
        const otpHash = await bcrypt.hash(otp, 10);

        // OTP valid for 10 minutes
        const expiresAt = new Date(
            Date.now() + 10 * 60 * 1000
        );

        // Remove previous unused OTPs
        await pool.query(
            `
            DELETE FROM password_reset_otps
            WHERE admin_id = ?
            AND used_at IS NULL
            `,
            [admin.id]
        );

        // Store hashed OTP
        await pool.query(
            `
            INSERT INTO password_reset_otps
            (
                admin_id,
                email,
                otp_hash,
                expires_at
            )
            VALUES (?, ?, ?, ?)
            `,
            [
                admin.id,
                admin.email,
                otpHash,
                expiresAt,
            ]
        );

        // Send OTP email
        await sendPasswordResetOTP(
            admin.email,
            otp
        );

        return res.status(200).json({
            success: true,
            message:
                "If an account exists with this email, an OTP has been sent.",
        });
    } catch (error) {
        console.error(
            "Forgot Password Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to process password reset request.",
        });
    }
};


/*
|--------------------------------------------------------------------------
| Verify Password Reset OTP
|--------------------------------------------------------------------------
*/

export const verifyResetOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message:
                    "Email and OTP are required.",
            });
        }

        const normalizedEmail =
            email.trim().toLowerCase();

        const cleanOtp = otp.trim();

        // OTP must be 6 digits
        if (!/^\d{6}$/.test(cleanOtp)) {
            return res.status(400).json({
                success: false,
                message:
                    "OTP must be a 6-digit number.",
            });
        }

        const [records] = await pool.query(
            `
            SELECT *
            FROM password_reset_otps
            WHERE email = ?
            AND used_at IS NULL
            ORDER BY id DESC
            LIMIT 1
            `,
            [normalizedEmail]
        );

        if (records.length === 0) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid or expired OTP.",
            });
        }

        const resetRecord = records[0];

        // Check expiry
        if (
            new Date(resetRecord.expires_at) <
            new Date()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "OTP has expired. Please request a new OTP.",
            });
        }

        // Maximum 5 attempts
        if (resetRecord.attempts >= 5) {
            return res.status(429).json({
                success: false,
                message:
                    "Too many incorrect attempts. Please request a new OTP.",
            });
        }

        // Verify OTP
        const otpMatch = await bcrypt.compare(
            cleanOtp,
            resetRecord.otp_hash
        );

        if (!otpMatch) {
            await pool.query(
                `
                UPDATE password_reset_otps
                SET attempts = attempts + 1
                WHERE id = ?
                `,
                [resetRecord.id]
            );

            return res.status(400).json({
                success: false,
                message:
                    "Invalid or expired OTP.",
            });
        }

        /*
        Generate a short-lived reset token.
        This token is used only for setting the new password.
        */

        const resetToken = jwt.sign(
            {
                resetId: resetRecord.id,
                adminId: resetRecord.admin_id,
                purpose: "password-reset",
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "10m",
            }
        );

        // Mark OTP as verified
        await pool.query(
            `
            UPDATE password_reset_otps
            SET verified_at = NOW()
            WHERE id = ?
            `,
            [resetRecord.id]
        );

        return res.status(200).json({
            success: true,
            message:
                "OTP verified successfully.",
            resetToken,
        });
    } catch (error) {
        console.error(
            "Verify OTP Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to verify OTP.",
        });
    }
};


/*
|--------------------------------------------------------------------------
| Reset Password
|--------------------------------------------------------------------------
*/

export const resetPassword = async (req, res) => {
    try {
        const {
            resetToken,
            password,
            confirmPassword,
        } = req.body;

        if (
            !resetToken ||
            !password ||
            !confirmPassword
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Reset token, password and confirm password are required.",
            });
        }

        // Password match
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message:
                    "Passwords do not match.",
            });
        }

        // Password length
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must be at least 8 characters long.",
            });
        }

        let decoded;

        try {
            decoded = jwt.verify(
                resetToken,
                process.env.JWT_SECRET
            );
        } catch (error) {
            return res.status(400).json({
                success: false,
                message:
                    "Reset session has expired. Please start again.",
            });
        }

        // Check token purpose
        if (
            decoded.purpose !==
            "password-reset"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid password reset token.",
            });
        }

        // Find reset record
        const [records] = await pool.query(
            `
            SELECT *
            FROM password_reset_otps
            WHERE id = ?
            AND admin_id = ?
            LIMIT 1
            `,
            [
                decoded.resetId,
                decoded.adminId,
            ]
        );

        if (records.length === 0) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid password reset request.",
            });
        }

        const resetRecord = records[0];

        // OTP must have been verified
        if (!resetRecord.verified_at) {
            return res.status(400).json({
                success: false,
                message:
                    "Please verify the OTP first.",
            });
        }

        // Reset request can only be used once
        if (resetRecord.used_at) {
            return res.status(400).json({
                success: false,
                message:
                    "This password reset request has already been used.",
            });
        }

        // Hash new password
        const hashedPassword =
            await bcrypt.hash(password, 12);

        // Update admin password
        const [result] = await pool.query(
            `
            UPDATE cms_admins
            SET password = ?
            WHERE id = ?
            AND status = 'active'
            `,
            [
                hashedPassword,
                decoded.adminId,
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message:
                    "Admin account not found.",
            });
        }

        // Mark reset request as used
        await pool.query(
            `
            UPDATE password_reset_otps
            SET used_at = NOW()
            WHERE id = ?
            `,
            [resetRecord.id]
        );

        return res.status(200).json({
            success: true,
            message:
                "Password reset successfully. You can now login with your new password.",
        });
    } catch (error) {
        console.error(
            "Reset Password Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to reset password.",
        });
    }
};