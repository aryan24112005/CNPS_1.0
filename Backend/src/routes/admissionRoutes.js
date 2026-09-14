import express from "express";

import {
    createAdmission,
    getAdmissions,
    getAdmissionById,
    updateAdmissionStatus,
    updateAdmissionNotes,
    deleteAdmission,
} from "../controllers/admissionController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Public
|--------------------------------------------------------------------------
*/

// Submit admission application
router.post("/", createAdmission);


/*
|--------------------------------------------------------------------------
| Admin Protected
|--------------------------------------------------------------------------
*/

// Get all applications
router.get(
    "/admin",
    protect,
    getAdmissions
);

// Get single application
router.get(
    "/admin/:id",
    protect,
    getAdmissionById
);

// Update status
router.patch(
    "/admin/:id/status",
    protect,
    updateAdmissionStatus
);

// Update admin notes
router.patch(
    "/admin/:id/notes",
    protect,
    updateAdmissionNotes
);

// Delete application
router.delete(
    "/admin/:id",
    protect,
    deleteAdmission
);

export default router;
