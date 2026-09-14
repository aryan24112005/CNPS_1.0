import { useEffect, useState } from "react";
import {
    getAdminCourses,
    getAdminCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    uploadCourseFiles,
    uploadCourseBookImage,
    getCourseFileUrl,
} from "../services/adminCourseService";
const emptyForm = {
    title: "",
    slug: "",
    category: "Early Education",
    class_name: "",
    short_description: "",
    description: "",
    class_teacher: "",
    timing: "",
    status: "active",
    sort_order: 0,
    subjects: [],
    books: [],
};

const categories = [
    "Early Education",
    "Primary",
    "Middle",
    "Secondary",
    "Senior Secondary",
];

function AdminCourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [form, setForm] = useState(emptyForm);

    const [imageFile, setImageFile] = useState(null);
    const [feePdfFile, setFeePdfFile] = useState(null);
    const [timetablePdfFile, setTimetablePdfFile] = useState(null);

    const [imagePreview, setImagePreview] = useState("");

    // Book image upload state
    const [bookImageFiles, setBookImageFiles] = useState({});
    const [bookImagePreviews, setBookImagePreviews] = useState({});

    const [deleteId, setDeleteId] = useState(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        loadCourses();
    }, []);

    const loadCourses = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getAdminCourses();
            setCourses(data || []);
        } catch (err) {
            setError(err.message || "Failed to load courses.");
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = () => {
        setEditingId(null);
        setForm(emptyForm);
        setImageFile(null);
        setFeePdfFile(null);
        setTimetablePdfFile(null);
        setImagePreview("");
        setError("");
        setShowModal(true);
        setBookImageFiles({});
        setBookImagePreviews({});
    };

    const openEditModal = async (id) => {
        try {
            setError("");

            const course = await getAdminCourseById(id);

            setEditingId(id);

            setForm({
                title: course.title || "",
                slug: course.slug || "",
                category: course.category || "Early Education",
                class_name: course.class_name || "",
                short_description: course.short_description || "",
                description: course.description || "",
                class_teacher: course.class_teacher || "",
                timing: course.timing || "",
                status: course.status || "active",
                sort_order: course.sort_order ?? 0,

                subjects: (course.subjects || []).map((subject) => ({
                    subject_name: subject.subject_name || "",
                    sort_order: subject.sort_order ?? 0,
                })),

                books: (course.books || []).map((book) => ({
                    book_name: book.book_name || "",
                    publisher: book.publisher || "",
                    image: book.image || "",
                    sort_order: book.sort_order ?? 0,
                })),
            });

            const previews = {};
            (course.books || []).forEach((book, index) => {
                if (book.image) {
                    previews[index] = getCourseFileUrl(book.image);
                }
            });

            setBookImageFiles({});
            setBookImagePreviews(previews);

            setImageFile(null);
            setFeePdfFile(null);
            setTimetablePdfFile(null);

            setImagePreview(
                course.image ? getCourseFileUrl(course.image) : ""
            );

            setShowModal(true);
        } catch (err) {
            setError(err.message || "Failed to load course.");
        }
    };

    const closeModal = () => {
        if (saving) return;

        setShowModal(false);
        setEditingId(null);
        setForm(emptyForm);
        setImageFile(null);
        setFeePdfFile(null);
        setTimetablePdfFile(null);
        setImagePreview("");
        setBookImageFiles({});
        setBookImagePreviews({});
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const generateSlug = () => {
        const slug = form.title
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

        setForm((prev) => ({
            ...prev,
            slug,
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    // ---------------- SUBJECTS ----------------

    const addSubject = () => {
        setForm((prev) => ({
            ...prev,
            subjects: [
                ...prev.subjects,
                {
                    subject_name: "",
                    sort_order: prev.subjects.length + 1,
                },
            ],
        }));
    };

    const updateSubject = (index, field, value) => {
        setForm((prev) => {
            const subjects = [...prev.subjects];

            subjects[index] = {
                ...subjects[index],
                [field]:
                    field === "sort_order" ? Number(value) : value,
            };

            return {
                ...prev,
                subjects,
            };
        });
    };

    const removeSubject = (index) => {
        setForm((prev) => ({
            ...prev,
            subjects: prev.subjects.filter(
                (_, subjectIndex) => subjectIndex !== index
            ),
        }));
    };

    // ---------------- BOOKS ----------------

    const addBook = () => {
        setForm((prev) => ({
            ...prev,
            books: [
                ...prev.books,
                {
                    book_name: "",
                    publisher: "",
                    image: "",
                    sort_order: prev.books.length + 1,
                },
            ],
        }));
    };

    const updateBook = (index, field, value) => {
        setForm((prev) => {
            const books = [...prev.books];

            books[index] = {
                ...books[index],
                [field]:
                    field === "sort_order" ? Number(value) : value,
            };

            return {
                ...prev,
                books,
            };
        });
    };

    const handleBookImageChange = (index, e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {
            setError("Book image must be JPG, PNG or WEBP.");
            e.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("Book image must be smaller than 5MB.");
            e.target.value = "";
            return;
        }

        setError("");

        setBookImageFiles((prev) => ({
            ...prev,
            [index]: file,
        }));

        setBookImagePreviews((prev) => ({
            ...prev,
            [index]: URL.createObjectURL(file),
        }));
    };

    const removeBook = (index) => {
        setForm((prev) => ({
            ...prev,
            books: prev.books.filter(
                (_, bookIndex) => bookIndex !== index
            ),
        }));

        const reindex = (prev) => {
            const next = {};

            Object.entries(prev).forEach(([key, value]) => {
                const oldIndex = Number(key);

                if (oldIndex < index) {
                    next[oldIndex] = value;
                } else if (oldIndex > index) {
                    next[oldIndex - 1] = value;
                }
            });

            return next;
        };

        setBookImageFiles(reindex);
        setBookImagePreviews(reindex);
    };

    // ---------------- SAVE ----------------

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");

            if (!form.title.trim()) {
                throw new Error("Course title is required.");
            }

            if (!form.slug.trim()) {
                throw new Error("Course slug is required.");
            }

            const payload = {
                title: form.title.trim(),
                slug: form.slug.trim(),
                category: form.category,
                class_name: form.class_name.trim(),
                short_description: form.short_description.trim(),
                description: form.description.trim(),
                class_teacher: form.class_teacher.trim(),
                timing: form.timing.trim(),
                status: form.status,
                sort_order: Number(form.sort_order) || 0,

                subjects: form.subjects
                    .filter((subject) => subject.subject_name.trim())
                    .map((subject, index) => ({
                        subject_name: subject.subject_name.trim(),
                        sort_order:
                            Number(subject.sort_order) || index + 1,
                    })),

                books: form.books
                    .filter((book) => book.book_name.trim())
                    .map((book, index) => ({
                        book_name: book.book_name.trim(),
                        publisher: book.publisher.trim(),
                        image: book.image || null,
                        sort_order:
                            Number(book.sort_order) || index + 1,
                    })),
            };

            let courseId;

            if (editingId) {
                await updateCourse(editingId, payload);
                courseId = editingId;
            } else {
                const response = await createCourse(payload);

                courseId =
                    response?.data?.id ||
                    response?.course?.id ||
                    response?.id;

                if (!courseId) {
                    throw new Error(
                        "Course created but course ID was not returned."
                    );
                }
            }

            // Upload course image / PDFs separately.
            if (imageFile || feePdfFile || timetablePdfFile) {
                await uploadCourseFiles(courseId, {
                    image: imageFile,
                    fee_pdf: feePdfFile,
                    timetable_pdf: timetablePdfFile,
                });
            }

            // The course save creates/replaces course_books first.
            // Then we upload each selected image against its real book ID.
            const bookFilesToUpload = Object.entries(bookImageFiles);

            if (bookFilesToUpload.length > 0) {
                const savedCourse = await getAdminCourseById(courseId);
                const savedBooks = savedCourse?.books || [];

                for (const [indexString, file] of bookFilesToUpload) {
                    const index = Number(indexString);
                    const savedBook = savedBooks[index];

                    if (!savedBook?.id) {
                        throw new Error(
                            `Book image could not be linked for book #${index + 1}.`
                        );
                    }

                    await uploadCourseBookImage(
                        courseId,
                        savedBook.id,
                        file
                    );
                }
            }

            await loadCourses();
            closeModal();

        } catch (err) {
            setError(err.message || "Failed to save course.");
        } finally {
            setSaving(false);
        }
    };

    // ---------------- DELETE ----------------

    const handleDelete = async () => {
        if (!deleteId) return;

        try {
            setDeleting(true);
            setError("");

            await deleteCourse(deleteId);

            setDeleteId(null);
            await loadCourses();
        } catch (err) {
            setError(err.message || "Failed to delete course.");
        } finally {
            setDeleting(false);
        }
    };

    // ---------------- UI ----------------

    return (
        <div className="container-fluid py-4">

            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="mb-1">Courses Management</h3>
                    <p className="text-muted mb-0">
                        Manage academic programs, classes, subjects and books.
                    </p>
                </div>

                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={openAddModal}
                >
                    <i className="bi bi-plus-lg me-2"></i>
                    Add Course
                </button>
            </div>

            {/* ERROR */}
            {error && !showModal && (
                <div className="alert alert-danger">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                </div>
            )}

            {/* TABLE */}
            <div className="card border-0 shadow-sm">
                <div className="card-body">

                    {loading ? (
                        <div className="text-center py-5">
                            <div
                                className="spinner-border text-primary"
                                role="status"
                            ></div>

                            <p className="text-muted mt-3 mb-0">
                                Loading courses...
                            </p>
                        </div>
                    ) : courses.length === 0 ? (
                        <div className="text-center py-5">
                            <i
                                className="bi bi-mortarboard"
                                style={{ fontSize: "48px" }}
                            ></i>

                            <h5 className="mt-3">
                                No courses found
                            </h5>

                            <p className="text-muted">
                                Start by adding your first course.
                            </p>

                            <button
                                className="btn btn-primary"
                                onClick={openAddModal}
                            >
                                <i className="bi bi-plus-lg me-2"></i>
                                Add Course
                            </button>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">

                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Course</th>
                                        <th>Category</th>
                                        <th>Class</th>
                                        <th>Status</th>
                                        <th>Order</th>
                                        <th className="text-end">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {courses.map((course, index) => (
                                        <tr key={course.id}>

                                            <td>
                                                {index + 1}
                                            </td>

                                            <td>
                                                <div className="d-flex align-items-center">

                                                    {course.image ? (
                                                        <img
                                                            src={getCourseFileUrl(
                                                                course.image
                                                            )}
                                                            alt={course.title}
                                                            style={{
                                                                width: "55px",
                                                                height: "55px",
                                                                objectFit: "cover",
                                                                borderRadius: "8px",
                                                            }}
                                                            className="me-3"
                                                        />
                                                    ) : (
                                                        <div
                                                            className="bg-light d-flex align-items-center justify-content-center me-3"
                                                            style={{
                                                                width: "55px",
                                                                height: "55px",
                                                                borderRadius: "8px",
                                                            }}
                                                        >
                                                            <i className="bi bi-mortarboard fs-4 text-muted"></i>
                                                        </div>
                                                    )}

                                                    <div>
                                                        <strong>
                                                            {course.title}
                                                        </strong>

                                                        <div className="small text-muted">
                                                            {course.slug}
                                                        </div>
                                                    </div>

                                                </div>
                                            </td>

                                            <td>
                                                <span className="badge bg-light text-dark">
                                                    {course.category || "-"}
                                                </span>
                                            </td>

                                            <td>
                                                {course.class_name || "-"}
                                            </td>

                                            <td>
                                                {course.status === "active" ? (
                                                    <span className="badge bg-success">
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="badge bg-secondary">
                                                        Inactive
                                                    </span>
                                                )}
                                            </td>

                                            <td>
                                                {course.sort_order ?? 0}
                                            </td>

                                            <td className="text-end">

                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-primary me-2"
                                                    onClick={() =>
                                                        openEditModal(course.id)
                                                    }
                                                    title="Edit"
                                                >
                                                    <i className="bi bi-pencil"></i>
                                                </button>

                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() =>
                                                        setDeleteId(course.id)
                                                    }
                                                    title="Delete"
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>

                                            </td>

                                        </tr>
                                    ))}
                                </tbody>

                            </table>
                        </div>
                    )}

                </div>
            </div>

            {/* ================= ADD / EDIT MODAL ================= */}

            {showModal && (
                <div
                    className="modal d-block"
                    tabIndex="-1"
                    style={{
                        backgroundColor: "rgba(0,0,0,0.5)",
                        position: "fixed",
                        inset: 0,
                        overflowY: "auto",
                        padding: "20px 0",
                        zIndex: 1055,
                    }}
                >
                    <div
                        className="modal-dialog modal-xl"
                        style={{
                            maxHeight: "calc(100vh - 40px)",
                            margin: "0 auto",
                        }}
                    >
                        <div
                            className="modal-content"
                            style={{
                                maxHeight: "calc(100vh - 40px)",
                                overflow: "hidden",
                            }}
                        >

                            {/* MODAL HEADER */}
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="bi bi-mortarboard me-2"></i>

                                    {editingId
                                        ? "Edit Course"
                                        : "Add New Course"}
                                </h5>

                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={closeModal}
                                ></button>
                            </div>

                            {/* MODAL BODY */}
                            <form onSubmit={handleSubmit}>

                                <div
                                    className="modal-body"
                                    style={{
                                        overflowY: "auto",
                                        maxHeight:
                                            "calc(100vh - 180px)",
                                    }}
                                >

                                    {error && (
                                        <div className="alert alert-danger">
                                            {error}
                                        </div>
                                    )}

                                    {/* BASIC INFORMATION */}

                                    <h6 className="fw-bold mb-3">
                                        <i className="bi bi-info-circle me-2"></i>
                                        Basic Information
                                    </h6>

                                    <div className="row g-3">

                                        <div className="col-md-8">
                                            <label className="form-label">
                                                Course Title *
                                            </label>

                                            <input
                                                type="text"
                                                name="title"
                                                className="form-control"
                                                value={form.title}
                                                onChange={handleChange}
                                                placeholder="e.g. Primary Classes"
                                                required
                                            />
                                        </div>

                                        <div className="col-md-4">
                                            <label className="form-label">
                                                Category *
                                            </label>

                                            <select
                                                name="category"
                                                className="form-select"
                                                value={form.category}
                                                onChange={handleChange}
                                            >
                                                {categories.map(
                                                    (category) => (
                                                        <option
                                                            key={category}
                                                            value={category}
                                                        >
                                                            {category}
                                                        </option>
                                                    )
                                                )}
                                            </select>
                                        </div>

                                        <div className="col-md-8">
                                            <label className="form-label">
                                                Slug *
                                            </label>

                                            <div className="input-group">
                                                <input
                                                    type="text"
                                                    name="slug"
                                                    className="form-control"
                                                    value={form.slug}
                                                    onChange={handleChange}
                                                    placeholder="primary-classes"
                                                    required
                                                />

                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary"
                                                    onClick={generateSlug}
                                                >
                                                    Generate
                                                </button>
                                            </div>

                                            <small className="text-muted">
                                                Used in the course URL.
                                            </small>
                                        </div>

                                        <div className="col-md-4">
                                            <label className="form-label">
                                                Class Name
                                            </label>

                                            <input
                                                type="text"
                                                name="class_name"
                                                className="form-control"
                                                value={form.class_name}
                                                onChange={handleChange}
                                                placeholder="e.g. Class 1"
                                            />
                                        </div>

                                        <div className="col-md-12">
                                            <label className="form-label">
                                                Short Description
                                            </label>

                                            <textarea
                                                name="short_description"
                                                className="form-control"
                                                rows="2"
                                                value={
                                                    form.short_description
                                                }
                                                onChange={handleChange}
                                                placeholder="Short description shown on course cards..."
                                            ></textarea>
                                        </div>

                                        <div className="col-md-12">
                                            <label className="form-label">
                                                Description
                                            </label>

                                            <textarea
                                                name="description"
                                                className="form-control"
                                                rows="5"
                                                value={form.description}
                                                onChange={handleChange}
                                                placeholder="Complete course description..."
                                            ></textarea>
                                        </div>

                                    </div>

                                    <hr className="my-4" />

                                    {/* CLASS DETAILS */}

                                    <h6 className="fw-bold mb-3">
                                        <i className="bi bi-person-video3 me-2"></i>
                                        Class Details
                                    </h6>

                                    <div className="row g-3">

                                        <div className="col-md-6">
                                            <label className="form-label">
                                                Class Teacher
                                            </label>

                                            <input
                                                type="text"
                                                name="class_teacher"
                                                className="form-control"
                                                value={
                                                    form.class_teacher
                                                }
                                                onChange={handleChange}
                                                placeholder="Teacher name"
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label">
                                                Timing
                                            </label>

                                            <input
                                                type="text"
                                                name="timing"
                                                className="form-control"
                                                value={form.timing}
                                                onChange={handleChange}
                                                placeholder="e.g. 8:00 AM - 2:00 PM"
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label">
                                                Status
                                            </label>

                                            <select
                                                name="status"
                                                className="form-select"
                                                value={form.status}
                                                onChange={handleChange}
                                            >
                                                <option value="active">
                                                    Active
                                                </option>

                                                <option value="inactive">
                                                    Inactive
                                                </option>
                                            </select>
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label">
                                                Sort Order
                                            </label>

                                            <input
                                                type="number"
                                                name="sort_order"
                                                className="form-control"
                                                value={form.sort_order}
                                                onChange={handleChange}
                                                min="0"
                                            />
                                        </div>

                                    </div>

                                    <hr className="my-4" />

                                    {/* FILES */}

                                    <h6 className="fw-bold mb-3">
                                        <i className="bi bi-file-earmark me-2"></i>
                                        Course Files
                                    </h6>

                                    <div className="row g-4">

                                        <div className="col-md-4">

                                            <label className="form-label">
                                                Course Image
                                            </label>

                                            {imagePreview && (
                                                <div className="mb-2">
                                                    <img
                                                        src={imagePreview}
                                                        alt="Course preview"
                                                        style={{
                                                            width: "100%",
                                                            height: "160px",
                                                            objectFit: "cover",
                                                            borderRadius: "8px",
                                                        }}
                                                    />
                                                </div>
                                            )}

                                            <input
                                                type="file"
                                                className="form-control"
                                                accept="image/jpeg,image/png,image/webp"
                                                onChange={
                                                    handleImageChange
                                                }
                                            />

                                            <small className="text-muted">
                                                JPG, PNG or WEBP
                                            </small>

                                        </div>

                                        <div className="col-md-4">

                                            <label className="form-label">
                                                Fee PDF
                                            </label>

                                            <input
                                                type="file"
                                                className="form-control"
                                                accept="application/pdf"
                                                onChange={(e) =>
                                                    setFeePdfFile(
                                                        e.target.files?.[0] ||
                                                        null
                                                    )
                                                }
                                            />

                                            <small className="text-muted">
                                                PDF only
                                            </small>

                                        </div>

                                        <div className="col-md-4">

                                            <label className="form-label">
                                                Timetable PDF
                                            </label>

                                            <input
                                                type="file"
                                                className="form-control"
                                                accept="application/pdf"
                                                onChange={(e) =>
                                                    setTimetablePdfFile(
                                                        e.target.files?.[0] ||
                                                        null
                                                    )
                                                }
                                            />

                                            <small className="text-muted">
                                                PDF only
                                            </small>

                                        </div>

                                    </div>

                                    <hr className="my-4" />

                                    {/* SUBJECTS */}

                                    <div className="d-flex justify-content-between align-items-center mb-3">

                                        <h6 className="fw-bold mb-0">
                                            <i className="bi bi-journal-text me-2"></i>
                                            Subjects
                                        </h6>

                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={addSubject}
                                        >
                                            <i className="bi bi-plus-lg me-1"></i>
                                            Add Subject
                                        </button>

                                    </div>

                                    {form.subjects.length === 0 ? (
                                        <div className="text-muted small mb-3">
                                            No subjects added.
                                        </div>
                                    ) : (
                                        form.subjects.map(
                                            (subject, index) => (
                                                <div
                                                    className="row g-2 mb-2"
                                                    key={index}
                                                >

                                                    <div className="col-md-9">
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="Subject name"
                                                            value={
                                                                subject.subject_name
                                                            }
                                                            onChange={(e) =>
                                                                updateSubject(
                                                                    index,
                                                                    "subject_name",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                        />
                                                    </div>

                                                    <div className="col-md-2">
                                                        <input
                                                            type="number"
                                                            className="form-control"
                                                            min="0"
                                                            placeholder="Order"
                                                            value={
                                                                subject.sort_order
                                                            }
                                                            onChange={(e) =>
                                                                updateSubject(
                                                                    index,
                                                                    "sort_order",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                        />
                                                    </div>

                                                    <div className="col-md-1">
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-danger w-100"
                                                            onClick={() =>
                                                                removeSubject(
                                                                    index
                                                                )
                                                            }
                                                        >
                                                            <i className="bi bi-trash"></i>
                                                        </button>
                                                    </div>

                                                </div>
                                            )
                                        )
                                    )}

                                    <hr className="my-4" />

                                    {/* BOOKS */}

                                    <div className="d-flex justify-content-between align-items-center mb-3">

                                        <h6 className="fw-bold mb-0">
                                            <i className="bi bi-book me-2"></i>
                                            Books
                                        </h6>

                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={addBook}
                                        >
                                            <i className="bi bi-plus-lg me-1"></i>
                                            Add Book
                                        </button>

                                    </div>

                                    {form.books.length === 0 ? (
                                        <div className="text-muted small">
                                            No books added.
                                        </div>
                                    ) : (
                                        form.books.map((book, index) => (
                                            <div
                                                className="border rounded p-3 mb-3"
                                                key={index}
                                            >
                                                <div className="row g-3 align-items-end">

                                                    {/* BOOK IMAGE */}
                                                    <div className="col-md-3">

                                                        <label className="form-label">
                                                            Book Image
                                                        </label>

                                                        {bookImagePreviews[index] ? (
                                                            <div className="mb-2">
                                                                <img
                                                                    src={
                                                                        bookImagePreviews[
                                                                        index
                                                                        ]
                                                                    }
                                                                    alt={
                                                                        book.book_name ||
                                                                        "Book"
                                                                    }
                                                                    style={{
                                                                        width: "100%",
                                                                        height: "140px",
                                                                        objectFit:
                                                                            "contain",
                                                                        border:
                                                                            "1px solid #ddd",
                                                                        borderRadius:
                                                                            "8px",
                                                                        padding:
                                                                            "6px",
                                                                        backgroundColor:
                                                                            "#fff",
                                                                    }}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div
                                                                className="d-flex align-items-center justify-content-center mb-2"
                                                                style={{
                                                                    width: "100%",
                                                                    height: "140px",
                                                                    border:
                                                                        "1px dashed #ccc",
                                                                    borderRadius:
                                                                        "8px",
                                                                    backgroundColor:
                                                                        "#f8f9fa",
                                                                    color: "#999",
                                                                }}
                                                            >
                                                                <div className="text-center">
                                                                    <i
                                                                        className="bi bi-image"
                                                                        style={{
                                                                            fontSize:
                                                                                "32px",
                                                                        }}
                                                                    ></i>
                                                                    <div className="small">
                                                                        No image
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        <input
                                                            type="file"
                                                            className="form-control"
                                                            accept="image/jpeg,image/png,image/webp"
                                                            onChange={(e) =>
                                                                handleBookImageChange(
                                                                    index,
                                                                    e
                                                                )
                                                            }
                                                        />

                                                        <small className="text-muted">
                                                            JPG, PNG or WEBP • Max 5MB
                                                        </small>

                                                    </div>

                                                    {/* BOOK NAME */}
                                                    <div className="col-md-4">

                                                        <label className="form-label">
                                                            Book Name *
                                                        </label>

                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="e.g. Mathematics"
                                                            value={
                                                                book.book_name
                                                            }
                                                            onChange={(e) =>
                                                                updateBook(
                                                                    index,
                                                                    "book_name",
                                                                    e.target.value
                                                                )
                                                            }
                                                        />

                                                    </div>

                                                    {/* PUBLISHER */}
                                                    <div className="col-md-3">

                                                        <label className="form-label">
                                                            Publisher
                                                        </label>

                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="Publisher"
                                                            value={
                                                                book.publisher
                                                            }
                                                            onChange={(e) =>
                                                                updateBook(
                                                                    index,
                                                                    "publisher",
                                                                    e.target.value
                                                                )
                                                            }
                                                        />

                                                    </div>

                                                    {/* ORDER */}
                                                    <div className="col-md-1">

                                                        <label className="form-label">
                                                            Order
                                                        </label>

                                                        <input
                                                            type="number"
                                                            className="form-control"
                                                            min="0"
                                                            value={
                                                                book.sort_order
                                                            }
                                                            onChange={(e) =>
                                                                updateBook(
                                                                    index,
                                                                    "sort_order",
                                                                    e.target.value
                                                                )
                                                            }
                                                        />

                                                    </div>

                                                    {/* DELETE */}
                                                    <div className="col-md-1">

                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-danger w-100"
                                                            onClick={() =>
                                                                removeBook(
                                                                    index
                                                                )
                                                            }
                                                            title="Remove Book"
                                                        >
                                                            <i className="bi bi-trash"></i>
                                                        </button>

                                                    </div>

                                                </div>
                                            </div>
                                        ))
                                    )}

                                    <hr className="my-4" />

                                </div>{/* close modal-body */}

                                {/* FOOTER */}

                                <div
                                    className="modal-footer"
                                    style={{ flexShrink: 0 }}
                                >

                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={closeModal}
                                        disabled={saving}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={saving}
                                    >
                                        {saving ? (
                                            <>
                                                <span
                                                    className="spinner-border spinner-border-sm me-2"
                                                    role="status"
                                                ></span>

                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-check-lg me-2"></i>

                                                {editingId
                                                    ? "Update Course"
                                                    : "Create Course"}
                                            </>
                                        )}
                                    </button>

                                </div>

                            </form>

                        </div>
                    </div>
                </div>
            )}

            {/* ================= DELETE MODAL ================= */}

            {deleteId && (
                <div
                    className="modal d-block"
                    tabIndex="-1"
                    style={{
                        backgroundColor: "rgba(0,0,0,0.5)",
                        position: "fixed",
                        inset: 0,
                        zIndex: 1060,
                    }}
                >
                    <div className="modal-dialog modal-dialog-centered">

                        <div className="modal-content">

                            <div className="modal-header">
                                <h5 className="modal-title">
                                    Confirm Delete
                                </h5>

                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() =>
                                        setDeleteId(null)
                                    }
                                    disabled={deleting}
                                ></button>
                            </div>

                            <div className="modal-body text-center py-4">

                                <i
                                    className="bi bi-exclamation-triangle text-danger"
                                    style={{ fontSize: "48px" }}
                                ></i>

                                <h5 className="mt-3">
                                    Delete this course?
                                </h5>

                                <p className="text-muted mb-0">
                                    This action cannot be undone.
                                </p>

                            </div>

                            <div className="modal-footer">

                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() =>
                                        setDeleteId(null)
                                    }
                                    disabled={deleting}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={handleDelete}
                                    disabled={deleting}
                                >
                                    {deleting ? (
                                        <>
                                            <span
                                                className="spinner-border spinner-border-sm me-2"
                                            ></span>
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-trash me-2"></i>
                                            Delete
                                        </>
                                    )}
                                </button>

                            </div>

                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}

export default AdminCourses;