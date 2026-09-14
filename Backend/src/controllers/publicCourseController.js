import pool from "../config/db.js";

// GET ACTIVE COURSES
export const getPublicCourses = async (req, res) => {
    try {
        const [courses] = await pool.query(
            `SELECT
                id,
                title,
                slug,
                category,
                class_name,
                image,
                short_description,
                description,
                class_teacher,
                timing,
                fee_pdf,
                timetable_pdf,
                sort_order
             FROM courses
             WHERE status = 'active'
             ORDER BY sort_order ASC, id ASC`
        );

        return res.json({
            success: true,
            courses,
        });
    } catch (error) {
        console.error("Get Public Courses Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch courses",
        });
    }
};


// GET SINGLE ACTIVE COURSE
export const getPublicCourseById = async (req, res) => {
    try {
        const { id } = req.params;

        const [courses] = await pool.query(
            `SELECT
                id,
                title,
                slug,
                category,
                class_name,
                image,
                short_description,
                description,
                class_teacher,
                timing,
                fee_pdf,
                timetable_pdf,
                sort_order
             FROM courses
             WHERE id = ?
             AND status = 'active'
             LIMIT 1`,
            [id]
        );

        if (courses.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        const course = courses[0];

        const [subjects] = await pool.query(
            `SELECT
                id,
                subject_name,
                sort_order
             FROM course_subjects
             WHERE course_id = ?
             ORDER BY sort_order ASC, id ASC`,
            [id]
        );

        const [books] = await pool.query(
            `SELECT
                id,
                book_name,
                publisher,
                image,
                sort_order
             FROM course_books
             WHERE course_id = ?
             ORDER BY sort_order ASC, id ASC`,
            [id]
        );

        return res.json({
            success: true,
            course: {
                ...course,
                subjects,
                books,
            },
        });
    } catch (error) {
        console.error("Get Public Course Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch course",
        });
    }
};