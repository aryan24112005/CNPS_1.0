import express from "express";

import {
    login,
    getMe,
    forgotPassword,
    verifyResetOtp,
    resetPassword,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public
router.post("/login", login);

router.post(
    "/forgot-password",
    forgotPassword
);

router.post(
    "/verify-reset-otp",
    verifyResetOtp
);

router.post(
    "/reset-password",
    resetPassword
);

// Protected
router.get("/me", protect, getMe);

export default router;