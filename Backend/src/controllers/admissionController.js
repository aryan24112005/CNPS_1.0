import pool from "../config/db.js";

/*
|--------------------------------------------------------------------------
| Create Admission Enquiry - Public
|--------------------------------------------------------------------------
*/

export const createAdmission = async (req, res) => {
    try {
        const {
            student_name,
            dob,
            gender,
            class_name,
            stream,
            science_group,
            father_name,
            mother_name,
            mobile,
            email,
            address,
        } = req.body;

        // Required fields
        if (
            !student_name?.trim() ||
            !dob ||
            !gender ||
            !class_name ||
            !mobile?.trim() ||
            !email?.trim() ||
            !address?.trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Please fill all required admission details.",
            });
        }

        // Validate gender
        if (!["Male", "Female", "Other"].includes(gender)) {
            return res.status(400).json({
                success: false,
                message: "Invalid gender selected.",
            });
        }

        // Class 11/12 requires stream
        const isSeniorClass =
            class_name === "11" ||
            class_name === "12";

        if (isSeniorClass && !stream) {
            return res.status(400).json({
                success: false,
                message:
                    "Please select a stream for Class 11 or 12.",
            });
        }

        // Science requires science group
        if (
            isSeniorClass &&
            stream === "Science" &&
            !science_group
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Please select a Science group.",
            });
        }

        // Science group should only exist for Science
        const finalScienceGroup =
            stream === "Science"
                ? science_group || null
                : null;

        // Stream should only exist for Class 11/12
        const finalStream =
            isSeniorClass
                ? stream || null
                : null;

        // Address is stored in existing message column
        const [result] = await pool.query(
            `
            INSERT INTO admission_enquiries
            (
                student_name,
                dob,
                gender,
                parent_name,
                father_name,
                mother_name,
                email,
                phone,
                class_applying,
                stream,
                science_group,
                message,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')
            `,
            [
                student_name.trim(),
                dob,
                gender,
                father_name?.trim() ||
                mother_name?.trim() ||
                null,
                father_name?.trim() || null,
                mother_name?.trim() || null,
                email.trim().toLowerCase(),
                mobile.trim(),
                class_name,
                finalStream,
                finalScienceGroup,
                address.trim(),
            ]
        );

        return res.status(201).json({
            success: true,
            message:
                "Admission application submitted successfully. Our admission team will contact you soon.",
            data: {
                id: result.insertId,
            },
        });
    } catch (error) {
        console.error(
            "Create Admission Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to submit admission application.",
        });
    }
};


/*
|--------------------------------------------------------------------------
| Get All Admission Applications - Admin
|--------------------------------------------------------------------------
*/

export const getAdmissions = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `
            SELECT
                id,
                student_name,
                dob,
                gender,
                parent_name,
                father_name,
                mother_name,
                email,
                phone,
                class_applying,
                stream,
                science_group,
                message,
                status,
                admin_notes,
                created_at,
                updated_at
            FROM admission_enquiries
            ORDER BY created_at DESC, id DESC
            `
        );

        return res.status(200).json({
            success: true,
            data: rows,
        });
    } catch (error) {
        console.error(
            "Get Admissions Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch admission applications.",
        });
    }
};


/*
|--------------------------------------------------------------------------
| Get Single Admission Application - Admin
|--------------------------------------------------------------------------
*/

export const getAdmissionById = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await pool.query(
            `
            SELECT
                id,
                student_name,
                dob,
                gender,
                parent_name,
                father_name,
                mother_name,
                email,
                phone,
                class_applying,
                stream,
                science_group,
                message,
                status,
                admin_notes,
                created_at,
                updated_at
            FROM admission_enquiries
            WHERE id = ?
            LIMIT 1
            `,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message:
                    "Admission application not found.",
            });
        }

        return res.status(200).json({
            success: true,
            data: rows[0],
        });
    } catch (error) {
        console.error(
            "Get Admission Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch admission application.",
        });
    }
};


/*
|--------------------------------------------------------------------------
| Update Admission Status - Admin
|--------------------------------------------------------------------------
*/

export const updateAdmissionStatus = async (
    req,
    res
) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const allowedStatuses = [
            "new",
            "contacted",
            "under_review",
            "approved",
            "enrolled",
            "rejected",
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid admission status.",
            });
        }

        const [result] = await pool.query(
            `
            UPDATE admission_enquiries
            SET status = ?
            WHERE id = ?
            `,
            [status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message:
                    "Admission application not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Admission status updated successfully.",
        });
    } catch (error) {
        console.error(
            "Update Admission Status Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to update admission status.",
        });
    }
};


/*
|--------------------------------------------------------------------------
| Update Admin Notes - Admin
|--------------------------------------------------------------------------
*/

export const updateAdmissionNotes = async (
    req,
    res
) => {
    try {
        const { id } = req.params;
        const { admin_notes } = req.body;

        const [result] = await pool.query(
            `
            UPDATE admission_enquiries
            SET admin_notes = ?
            WHERE id = ?
            `,
            [
                admin_notes?.trim() || null,
                id,
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message:
                    "Admission application not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Admin notes updated successfully.",
        });
    } catch (error) {
        console.error(
            "Update Admission Notes Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to update admin notes.",
        });
    }
};


/*
|--------------------------------------------------------------------------
| Delete Admission Application - Admin
|--------------------------------------------------------------------------
*/

export const deleteAdmission = async (
    req,
    res
) => {
    try {
        const { id } = req.params;

        const [result] = await pool.query(
            `
            DELETE FROM admission_enquiries
            WHERE id = ?
            `,
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message:
                    "Admission application not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Admission application deleted successfully.",
        });
    } catch (error) {
        console.error(
            "Delete Admission Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to delete admission application.",
        });
    }
};