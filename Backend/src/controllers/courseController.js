import pool from "../config/db.js";

// GET ALL COURSES
export const getCourses = async (req, res) => {
    try {
        const [courses] = await pool.query(
            `SELECT *
       FROM courses
       ORDER BY sort_order ASC, id ASC`
        );

        return res.json({
            success: true,
            data: courses,
        });
    } catch (error) {
        console.error("Get Courses Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};


// GET SINGLE COURSE
export const getCourseById = async (req, res) => {
    try {
        const { id } = req.params;

        const [courses] = await pool.query(
            `SELECT *
       FROM courses
       WHERE id = ?
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
            `SELECT id, subject_name, sort_order
       FROM course_subjects
       WHERE course_id = ?
       ORDER BY sort_order ASC, id ASC`,
            [id]
        );

        const [books] = await pool.query(
            `SELECT id, book_name, publisher, image, sort_order
            FROM course_books
            WHERE course_id = ?
            ORDER BY sort_order ASC, id ASC`,
            [id]
        );

        return res.json({
            success: true,
            data: {
                ...course,
                subjects,
                books,
            },
        });
    } catch (error) {
        console.error("Get Course Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};


// CREATE COURSE
export const createCourse = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const {
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
            status,
            sort_order,
            subjects,
            books,
        } = req.body;

        if (!title || !slug) {
            connection.release();

            return res.status(400).json({
                success: false,
                message: "Title and slug are required",
            });
        }

        await connection.beginTransaction();

        const [result] = await connection.query(
            `INSERT INTO courses (
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
        status,
        sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title,
                slug,
                category || null,
                class_name || null,
                image || null,
                short_description || null,
                description || null,
                class_teacher || null,
                timing || null,
                fee_pdf || null,
                timetable_pdf || null,
                status || "active",
                Number(sort_order) || 0,
            ]
        );

        const courseId = result.insertId;

        // Subjects
        if (Array.isArray(subjects)) {
            for (let i = 0; i < subjects.length; i++) {
                const subject = subjects[i];

                if (!subject?.subject_name?.trim()) continue;

                await connection.query(
                    `INSERT INTO course_subjects
            (course_id, subject_name, sort_order)
            VALUES (?, ?, ?)`,
                    [
                        id,
                        subject.subject_name.trim(),
                        Number(subject.sort_order) || i + 1,
                    ]
                );
            }
        }

        // Books
        if (Array.isArray(books)) {
            for (let i = 0; i < books.length; i++) {
                const book = books[i];

                if (!book?.book_name?.trim()) continue;

                await connection.query(
                    `INSERT INTO course_books
            (course_id, book_name, publisher, image, sort_order)
            VALUES (?, ?, ?, ?, ?)`,
                    [
                        id,
                        book.book_name.trim(),
                        book.publisher?.trim() || null,
                        book.image || null,
                        Number(book.sort_order) || i + 1,
                    ]
                );
            }
        }

        await connection.commit();

        return res.status(201).json({
            success: true,
            message: "Course created successfully",
            id: courseId,
        });
    } catch (error) {
        await connection.rollback();

        console.error("Create Course Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create course",
        });
    } finally {
        connection.release();
    }
};


// UPDATE COURSE
export const updateCourse = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const { id } = req.params;

        const {
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
            status,
            sort_order,
            subjects,
            books,
        } = req.body;

        await connection.beginTransaction();

        const [existing] = await connection.query(
            `SELECT id
       FROM courses
       WHERE id = ?
       LIMIT 1`,
            [id]
        );

        if (existing.length === 0) {
            await connection.rollback();
            connection.release();

            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        await connection.query(
            `UPDATE courses
       SET
        title = ?,
        slug = ?,
        category = ?,
        class_name = ?,
        image = ?,
        short_description = ?,
        description = ?,
        class_teacher = ?,
        timing = ?,
        fee_pdf = ?,
        timetable_pdf = ?,
        status = ?,
        sort_order = ?
       WHERE id = ?`,
            [
                title,
                slug,
                category || null,
                class_name || null,
                image || null,
                short_description || null,
                description || null,
                class_teacher || null,
                timing || null,
                fee_pdf || null,
                timetable_pdf || null,
                status || "active",
                Number(sort_order) || 0,
                id,
            ]
        );

        // Replace subjects
        await connection.query(
            `DELETE FROM course_subjects
       WHERE course_id = ?`,
            [id]
        );

        if (Array.isArray(subjects)) {
            for (let i = 0; i < subjects.length; i++) {
                const subject = subjects[i];

                const subjectName =
                    typeof subject === "string"
                        ? subject.trim()
                        : String(
                            subject?.subject_name ||
                            subject?.name ||
                            ""
                        ).trim();

                if (!subjectName) continue;

                await connection.query(
                    `INSERT INTO course_subjects
             (course_id, subject_name, sort_order)
             VALUES (?, ?, ?)`,
                    [id, subjectName, i]
                );
            }
        }

        // Replace books
        await connection.query(
            `DELETE FROM course_books
       WHERE course_id = ?`,
            [id]
        );

        if (Array.isArray(books)) {
            for (let i = 0; i < books.length; i++) {
                const book = books[i];

                if (!book?.book_name) continue;

                await connection.query(
                    `INSERT INTO course_books
(course_id, book_name, publisher, image, sort_order)
VALUES (?, ?, ?, ?, ?)`,
                    [
                        id,
                        book.book_name,
                        book.publisher || null,
                        book.image || null,
                        i,
                    ]
                );
            }
        }

        await connection.commit();

        return res.json({
            success: true,
            message: "Course updated successfully",
        });
    } catch (error) {
        await connection.rollback();

        console.error("Update Course Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update course",
        });
    } finally {
        connection.release();
    }
};


// DELETE COURSE
export const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.query(
            `DELETE FROM courses
       WHERE id = ?`,
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        return res.json({
            success: true,
            message: "Course deleted successfully",
        });
    } catch (error) {
        console.error("Delete Course Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete course",
        });
    }
};