import { useEffect, useState } from "react";

import {
    getAdminTestimonials,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial,
    uploadTestimonialAvatar,
    getAdminTestimonialAvatarUrl,
} from "../services/adminTestimonialService";

function AdminTestimonials() {
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    const [editingId, setEditingId] = useState(null);

    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        role: "",
        rating: 5,
        review: "",
        status: "approved",
        sort_order: 0,
    });

    // ========================================
    // LOAD TESTIMONIALS
    // ========================================

    const loadTestimonials = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getAdminTestimonials();

            setTestimonials(data);
        } catch (error) {
            console.error(
                "Load Testimonials Error:",
                error
            );

            setError(
                error.message ||
                "Failed to load testimonials."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTestimonials();
    }, []);

    // ========================================
    // FORM CHANGE
    // ========================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // ========================================
    // RESET FORM
    // ========================================

    const resetForm = () => {
        setFormData({
            name: "",
            role: "",
            rating: 5,
            review: "",
            status: "approved",
            sort_order: 0,
        });

        setEditingId(null);

        setAvatarFile(null);
        setAvatarPreview("");
    };

    // ========================================
    // OPEN ADD FORM
    // ========================================

    const openAddForm = () => {
        resetForm();

        setError("");
        setShowForm(true);
    };

    // ========================================
    // CLOSE FORM
    // ========================================

    const closeForm = () => {
        if (saving || uploadingAvatar) return;

        setShowForm(false);
        resetForm();
    };

    // ========================================
    // OPEN EDIT FORM
    // ========================================

    const openEditForm = (testimonial) => {
        setFormData({
            name: testimonial.name || "",
            role: testimonial.role || "",
            rating: testimonial.rating || 5,
            review: testimonial.review || "",
            status: testimonial.status || "pending",
            sort_order: testimonial.sort_order ?? 0,
        });

        setEditingId(testimonial.id);

        setAvatarFile(null);

        setAvatarPreview(
            testimonial.avatar
                ? getAdminTestimonialAvatarUrl(
                    testimonial.avatar
                )
                : ""
        );

        setError("");
        setShowForm(true);
    };

    // ========================================
    // AVATAR CHANGE
    // ========================================

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {
            alert(
                "Please select a JPG, PNG or WEBP image."
            );

            e.target.value = "";
            return;
        }

        const maxSize = 20 * 1024 * 1024;

        if (file.size > maxSize) {
            alert(
                "Avatar image must be smaller than 20 MB."
            );

            e.target.value = "";
            return;
        }

        setAvatarFile(file);

        const previewUrl = URL.createObjectURL(file);

        setAvatarPreview(previewUrl);
    };

    // ========================================
    // UPLOAD AVATAR
    // ========================================

    const handleAvatarUpload = async () => {
        if (!editingId) {
            alert(
                "Please create the testimonial first."
            );

            return;
        }

        if (!avatarFile) {
            alert(
                "Please select an avatar image first."
            );

            return;
        }

        try {
            setUploadingAvatar(true);

            const data =
                await uploadTestimonialAvatar(
                    editingId,
                    avatarFile
                );

            setAvatarFile(null);

            if (data.avatar) {
                setAvatarPreview(
                    getAdminTestimonialAvatarUrl(
                        data.avatar
                    )
                );
            }

            await loadTestimonials();

            alert(
                "Testimonial avatar uploaded successfully."
            );
        } catch (error) {
            console.error(
                "Avatar Upload Error:",
                error
            );

            alert(
                error.message ||
                "Failed to upload testimonial avatar."
            );
        } finally {
            setUploadingAvatar(false);
        }
    };

    // ========================================
    // CREATE / UPDATE
    // ========================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            alert("Name is required.");
            return;
        }

        if (!formData.review.trim()) {
            alert("Review is required.");
            return;
        }

        const rating = Number(formData.rating);

        if (rating < 1 || rating > 5) {
            alert(
                "Rating must be between 1 and 5."
            );

            return;
        }

        try {
            setSaving(true);

            const payload = {
                name: formData.name.trim(),

                role:
                    formData.role.trim() || null,

                rating: rating,

                review: formData.review.trim(),

                status: formData.status,

                sort_order:
                    Number(formData.sort_order) || 0,
            };

            if (editingId) {
                await updateTestimonial(
                    editingId,
                    payload
                );

                alert(
                    "Testimonial updated successfully."
                );
            } else {
                const createdTestimonial =
                    await createTestimonial(
                        payload
                    );

                // Upload avatar automatically after creation
                if (
                    avatarFile &&
                    createdTestimonial?.id
                ) {
                    await uploadTestimonialAvatar(
                        createdTestimonial.id,
                        avatarFile
                    );

                    alert(
                        "Testimonial and avatar created successfully."
                    );
                } else {
                    alert(
                        "Testimonial created successfully."
                    );
                }
            }

            setShowForm(false);

            resetForm();

            await loadTestimonials();
        } catch (error) {
            console.error(
                "Save Testimonial Error:",
                error
            );

            alert(
                error.message ||
                "Failed to save testimonial."
            );
        } finally {
            setSaving(false);
        }
    };

    // ========================================
    // DELETE
    // ========================================

    const handleDelete = async (
        id,
        name
    ) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete testimonial from "${name}"?`
        );

        if (!confirmed) return;

        try {
            await deleteTestimonial(id);

            await loadTestimonials();

            alert(
                "Testimonial deleted successfully."
            );
        } catch (error) {
            console.error(
                "Delete Testimonial Error:",
                error
            );

            alert(
                error.message ||
                "Failed to delete testimonial."
            );
        }
    };

    // ========================================
    // RATING STARS
    // ========================================

    const renderStars = (rating) => {
        const stars = [];

        for (let i = 1; i <= 5; i++) {
            stars.push(
                <i
                    key={i}
                    className={
                        i <= rating
                            ? "bi bi-star-fill"
                            : "bi bi-star"
                    }
                ></i>
            );
        }

        return stars;
    };

    // ========================================
    // STATUS BADGE
    // ========================================

    const getStatusBadge = (status) => {
        switch (status) {
            case "approved":
                return (
                    <span className="badge bg-success">
                        Approved
                    </span>
                );

            case "rejected":
                return (
                    <span className="badge bg-danger">
                        Rejected
                    </span>
                );

            default:
                return (
                    <span className="badge bg-warning text-dark">
                        Pending
                    </span>
                );
        }
    };

    // ========================================
    // LOADING
    // ========================================

    if (loading) {
        return (
            <div className="admin-testimonials-page">
                <div className="text-center py-5">
                    <div
                        className="spinner-border"
                        role="status"
                    >
                        <span className="visually-hidden">
                            Loading...
                        </span>
                    </div>

                    <p className="mt-3 text-muted">
                        Loading testimonials...
                    </p>
                </div>
            </div>
        );
    }

    // ========================================
    // RETURN
    // ========================================

    return (
        <div className="admin-testimonials-page">

            {/* ================================= */}
            {/* PAGE HEADER */}
            {/* ================================= */}

            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>
                    <h2 className="mb-1">
                        Testimonials
                    </h2>

                    <p className="text-muted mb-0">
                        Manage student, parent and
                        visitor testimonials displayed
                        on the website.
                    </p>
                </div>

                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={openAddForm}
                >
                    <i className="bi bi-plus-lg me-2"></i>
                    Add Testimonial
                </button>

            </div>

            {/* ================================= */}
            {/* ERROR */}
            {/* ================================= */}

            {error && (
                <div
                    className="alert alert-danger"
                    role="alert"
                >
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                </div>
            )}

            {/* ================================= */}
            {/* EMPTY STATE */}
            {/* ================================= */}

            {testimonials.length === 0 ? (

                <div className="card border-0 shadow-sm">

                    <div className="card-body text-center py-5">

                        <i
                            className="bi bi-chat-quote"
                            style={{
                                fontSize: "48px",
                                opacity: 0.5,
                            }}
                        ></i>

                        <h5 className="mt-3">
                            No Testimonials Found
                        </h5>

                        <p className="text-muted mb-3">
                            No testimonials have been
                            added yet.
                        </p>

                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={openAddForm}
                        >
                            <i className="bi bi-plus-lg me-2"></i>
                            Add First Testimonial
                        </button>

                    </div>

                </div>

            ) : (

                /* ================================= */
                /* TESTIMONIAL TABLE */
                /* ================================= */

                <div className="card border-0 shadow-sm">

                    <div className="card-body p-0">

                        <div className="table-responsive">

                            <table className="table table-hover align-middle mb-0">

                                <thead className="table-light">

                                    <tr>

                                        <th
                                            style={{
                                                width: "80px",
                                            }}
                                        >
                                            Avatar
                                        </th>

                                        <th>
                                            Person
                                        </th>

                                        <th>
                                            Rating
                                        </th>

                                        <th>
                                            Review
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th
                                            className="text-end"
                                            style={{
                                                width: "130px",
                                            }}
                                        >
                                            Actions
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {testimonials.map(
                                        (testimonial) => {

                                            const avatarUrl =
                                                getAdminTestimonialAvatarUrl(
                                                    testimonial.avatar
                                                );

                                            return (
                                                <tr
                                                    key={
                                                        testimonial.id
                                                    }
                                                >

                                                    {/* AVATAR */}

                                                    <td>

                                                        {avatarUrl ? (

                                                            <img
                                                                src={
                                                                    avatarUrl
                                                                }
                                                                alt={
                                                                    testimonial.name
                                                                }
                                                                style={{
                                                                    width: "55px",
                                                                    height: "55px",
                                                                    objectFit:
                                                                        "cover",
                                                                    borderRadius:
                                                                        "50%",
                                                                }}
                                                            />

                                                        ) : (

                                                            <div
                                                                className="d-flex align-items-center justify-content-center bg-light"
                                                                style={{
                                                                    width: "55px",
                                                                    height: "55px",
                                                                    borderRadius:
                                                                        "50%",
                                                                }}
                                                            >
                                                                <i className="bi bi-person text-muted"></i>
                                                            </div>

                                                        )}

                                                    </td>

                                                    {/* PERSON */}

                                                    <td>

                                                        <strong>
                                                            {
                                                                testimonial.name
                                                            }
                                                        </strong>

                                                        <div className="small text-muted">
                                                            {
                                                                testimonial.role ||
                                                                "-"
                                                            }
                                                        </div>

                                                    </td>

                                                    {/* RATING */}

                                                    <td>

                                                        <span className="text-warning">
                                                            {renderStars(
                                                                Number(
                                                                    testimonial.rating
                                                                )
                                                            )}
                                                        </span>

                                                        <div className="small text-muted">
                                                            {
                                                                testimonial.rating
                                                            }
                                                            /5
                                                        </div>

                                                    </td>

                                                    {/* REVIEW */}

                                                    <td
                                                        style={{
                                                            maxWidth:
                                                                "350px",
                                                        }}
                                                    >

                                                        <div
                                                            className="text-truncate"
                                                            title={
                                                                testimonial.review
                                                            }
                                                        >
                                                            {
                                                                testimonial.review
                                                            }
                                                        </div>

                                                    </td>

                                                    {/* STATUS */}

                                                    <td>
                                                        {getStatusBadge(
                                                            testimonial.status
                                                        )}
                                                    </td>

                                                    {/* ACTIONS */}

                                                    <td className="text-end">

                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-primary me-2"
                                                            title="Edit Testimonial"
                                                            onClick={() =>
                                                                openEditForm(
                                                                    testimonial
                                                                )
                                                            }
                                                        >
                                                            <i className="bi bi-pencil"></i>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-danger"
                                                            title="Delete Testimonial"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    testimonial.id,
                                                                    testimonial.name
                                                                )
                                                            }
                                                        >
                                                            <i className="bi bi-trash"></i>
                                                        </button>

                                                    </td>

                                                </tr>
                                            );
                                        }
                                    )}

                                </tbody>

                            </table>

                        </div>

                    </div>

                </div>

            )}

            {/* ================================= */}
            {/* ADD / EDIT MODAL */}
            {/* ================================= */}

            {showForm && (

                <div
                    className="modal d-block"
                    tabIndex="-1"
                    style={{
                        backgroundColor:
                            "rgba(0, 0, 0, 0.5)",
                        position: "fixed",
                        inset: 0,
                        overflowY: "auto",
                        padding: "20px 0",
                    }}
                >

                    <div
                        className="modal-dialog modal-lg"
                        style={{
                            maxHeight:
                                "calc(100vh - 40px)",
                            margin: "0 auto",
                        }}
                    >

                        <div
                            className="modal-content"
                            style={{
                                maxHeight:
                                    "calc(100vh - 40px)",
                                overflow: "hidden",
                            }}
                        >

                            {/* MODAL HEADER */}

                            <div className="modal-header">

                                <h5 className="modal-title">

                                    <i
                                        className={`bi ${editingId
                                                ? "bi-pencil-square"
                                                : "bi-chat-quote"
                                            } me-2`}
                                    ></i>

                                    {editingId
                                        ? "Edit Testimonial"
                                        : "Add New Testimonial"}

                                </h5>

                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={closeForm}
                                    disabled={
                                        saving ||
                                        uploadingAvatar
                                    }
                                ></button>

                            </div>

                            {/* FORM */}

                            <form
                                onSubmit={
                                    handleSubmit
                                }
                            >

                                {/* MODAL BODY */}

                                <div
                                    className="modal-body"
                                    style={{
                                        overflowY:
                                            "auto",
                                        maxHeight:
                                            "calc(100vh - 180px)",
                                    }}
                                >

                                    <div className="row g-3">

                                        {/* NAME */}

                                        <div className="col-md-8">

                                            <label className="form-label">
                                                Name
                                                <span className="text-danger">
                                                    {" "}*
                                                </span>
                                            </label>

                                            <input
                                                type="text"
                                                name="name"
                                                className="form-control"
                                                value={
                                                    formData.name
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="Student / Parent Name"
                                                required
                                            />

                                        </div>

                                        {/* STATUS */}

                                        <div className="col-md-4">

                                            <label className="form-label">
                                                Status
                                            </label>

                                            <select
                                                name="status"
                                                className="form-select"
                                                value={
                                                    formData.status
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                            >

                                                <option value="approved">
                                                    Approved
                                                </option>

                                                <option value="pending">
                                                    Pending
                                                </option>

                                                <option value="rejected">
                                                    Rejected
                                                </option>

                                            </select>

                                        </div>

                                        {/* ROLE */}

                                        <div className="col-md-8">

                                            <label className="form-label">
                                                Role
                                            </label>

                                            <input
                                                type="text"
                                                name="role"
                                                className="form-control"
                                                value={
                                                    formData.role
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="Student, Parent, Alumni..."
                                            />

                                        </div>

                                        {/* RATING */}

                                        <div className="col-md-4">

                                            <label className="form-label">
                                                Rating
                                                <span className="text-danger">
                                                    {" "}*
                                                </span>
                                            </label>

                                            <select
                                                name="rating"
                                                className="form-select"
                                                value={
                                                    formData.rating
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                required
                                            >

                                                <option value="5">
                                                    ⭐⭐⭐⭐⭐ — 5
                                                </option>

                                                <option value="4">
                                                    ⭐⭐⭐⭐ — 4
                                                </option>

                                                <option value="3">
                                                    ⭐⭐⭐ — 3
                                                </option>

                                                <option value="2">
                                                    ⭐⭐ — 2
                                                </option>

                                                <option value="1">
                                                    ⭐ — 1
                                                </option>

                                            </select>

                                        </div>

                                        {/* REVIEW */}

                                        <div className="col-12">

                                            <label className="form-label">
                                                Review
                                                <span className="text-danger">
                                                    {" "}*
                                                </span>
                                            </label>

                                            <textarea
                                                name="review"
                                                className="form-control"
                                                rows="5"
                                                value={
                                                    formData.review
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="Write testimonial / review..."
                                                required
                                            ></textarea>

                                        </div>

                                        {/* SORT ORDER */}

                                        <div className="col-md-4">

                                            <label className="form-label">
                                                Sort Order
                                            </label>

                                            <input
                                                type="number"
                                                name="sort_order"
                                                className="form-control"
                                                value={
                                                    formData.sort_order
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                min="0"
                                            />

                                            <small className="text-muted">
                                                Lower number
                                                appears first.
                                            </small>

                                        </div>

                                        {/* AVATAR */}

                                        <div className="col-12">

                                            <div className="border rounded p-3">

                                                <div className="mb-3">

                                                    <h6 className="mb-1">

                                                        <i className="bi bi-person-circle me-2"></i>

                                                        Testimonial Avatar

                                                    </h6>

                                                    <small className="text-muted">
                                                        Upload the
                                                        profile image
                                                        shown with this
                                                        testimonial.
                                                    </small>

                                                </div>

                                                {/* PREVIEW */}

                                                <div className="mb-3">

                                                    {avatarPreview ? (

                                                        <div
                                                            className="d-flex align-items-center gap-3"
                                                        >

                                                            <img
                                                                src={
                                                                    avatarPreview
                                                                }
                                                                alt="Avatar Preview"
                                                                style={{
                                                                    width: "100px",
                                                                    height: "100px",
                                                                    objectFit:
                                                                        "cover",
                                                                    borderRadius:
                                                                        "50%",
                                                                    border: "3px solid #eee",
                                                                }}
                                                            />

                                                            <div>
                                                                <div className="fw-semibold">
                                                                    Avatar
                                                                    Preview
                                                                </div>

                                                                <small className="text-muted">
                                                                    This image
                                                                    will be
                                                                    displayed
                                                                    with the
                                                                    testimonial.
                                                                </small>
                                                            </div>

                                                        </div>

                                                    ) : (

                                                        <div
                                                            className="d-flex flex-column align-items-center justify-content-center border rounded"
                                                            style={{
                                                                width: "120px",
                                                                height: "120px",
                                                                backgroundColor:
                                                                    "#f8f9fa",
                                                            }}
                                                        >

                                                            <i
                                                                className="bi bi-person text-muted"
                                                                style={{
                                                                    fontSize:
                                                                        "42px",
                                                                }}
                                                            ></i>

                                                            <small className="text-muted">
                                                                No avatar
                                                            </small>

                                                        </div>

                                                    )}

                                                </div>

                                                {/* FILE INPUT */}

                                                <div className="row g-2 align-items-end">

                                                    <div className="col-md-8">

                                                        <label className="form-label">
                                                            Choose New Avatar
                                                        </label>

                                                        <input
                                                            type="file"
                                                            className="form-control"
                                                            accept="image/jpeg,image/png,image/webp"
                                                            onChange={
                                                                handleAvatarChange
                                                            }
                                                            disabled={
                                                                uploadingAvatar ||
                                                                saving
                                                            }
                                                        />

                                                        <small className="text-muted">
                                                            JPG, PNG or
                                                            WEBP · Maximum
                                                            20 MB
                                                        </small>

                                                    </div>

                                                    <div className="col-md-4">

                                                        <button
                                                            type="button"
                                                            className="btn btn-primary w-100"
                                                            onClick={
                                                                handleAvatarUpload
                                                            }
                                                            disabled={
                                                                !editingId ||
                                                                !avatarFile ||
                                                                uploadingAvatar ||
                                                                saving
                                                            }
                                                        >

                                                            {uploadingAvatar ? (

                                                                <>
                                                                    <span
                                                                        className="spinner-border spinner-border-sm me-2"
                                                                        role="status"
                                                                    ></span>

                                                                    Uploading...
                                                                </>

                                                            ) : (

                                                                <>
                                                                    <i className="bi bi-cloud-arrow-up me-2"></i>

                                                                    Upload Avatar
                                                                </>
                                                            )}

                                                        </button>

                                                    </div>

                                                </div>

                                                {!editingId && (

                                                    <small className="d-block text-primary mt-2">

                                                        <i className="bi bi-info-circle me-1"></i>

                                                        Avatar will be
                                                        uploaded
                                                        automatically
                                                        when the
                                                        testimonial is
                                                        created.

                                                    </small>

                                                )}

                                            </div>

                                        </div>

                                    </div>

                                </div>

                                {/* MODAL FOOTER */}

                                <div
                                    className="modal-footer"
                                    style={{
                                        flexShrink: 0,
                                    }}
                                >

                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={closeForm}
                                        disabled={
                                            saving ||
                                            uploadingAvatar
                                        }
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={
                                            saving ||
                                            uploadingAvatar
                                        }
                                    >

                                        {saving ? (

                                            <>
                                                <span
                                                    className="spinner-border spinner-border-sm me-2"
                                                    role="status"
                                                ></span>

                                                {editingId
                                                    ? "Updating..."
                                                    : "Creating..."}
                                            </>

                                        ) : (

                                            <>
                                                <i
                                                    className={`bi ${editingId
                                                            ? "bi-check-lg"
                                                            : "bi-plus-lg"
                                                        } me-2`}
                                                ></i>

                                                {editingId
                                                    ? "Update Testimonial"
                                                    : "Create Testimonial"}
                                            </>
                                        )}

                                    </button>

                                </div>

                            </form>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}

export default AdminTestimonials;