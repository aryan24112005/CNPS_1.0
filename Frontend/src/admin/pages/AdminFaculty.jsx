import { useEffect, useState } from "react";

import {
    getAdminFaculty,
    getAdminFacultyById,
    createFaculty,
    updateFaculty,
    deleteFaculty,
    uploadFacultyPhoto,
    getAdminFacultyImageUrl,
} from "../services/adminFacultyService";


const emptyForm = {
    name: "",
    designation: "",
    qualification: "",
    short_bio: "",
    bio: "",
    email: "",
    phone: "",
    facebook_url: "",
    instagram_url: "",
    linkedin_url: "",
    youtube_url: "",
    status: "active",
    sort_order: 0,
};


function AdminFaculty() {
    const [faculty, setFaculty] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [form, setForm] = useState(emptyForm);

    // Photo
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState("");
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    // Delete
    const [deleteId, setDeleteId] = useState(null);
    const [deleting, setDeleting] = useState(false);


    // =========================
    // LOAD FACULTY
    // =========================

    useEffect(() => {
        loadFaculty();
    }, []);


    const loadFaculty = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getAdminFaculty();

            setFaculty(data || []);
        } catch (err) {
            console.error("Load Faculty Error:", err);

            setError(
                err.message || "Failed to load faculty."
            );
        } finally {
            setLoading(false);
        }
    };


    // =========================
    // FORM CHANGE
    // =========================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };


    // =========================
    // RESET FORM
    // =========================

    const resetForm = () => {
        setForm(emptyForm);

        setEditingId(null);

        setPhotoFile(null);
        setPhotoPreview("");

        setError("");
    };


    // =========================
    // OPEN ADD MODAL
    // =========================

    const openAddModal = () => {
        resetForm();

        setShowModal(true);
    };


    // =========================
    // OPEN EDIT MODAL
    // =========================

    const openEditModal = async (id) => {
        try {
            setError("");

            const member = await getAdminFacultyById(id);

            setEditingId(id);

            setForm({
                name: member.name || "",
                designation: member.designation || "",
                qualification: member.qualification || "",
                short_bio: member.short_bio || "",
                bio: member.bio || "",
                email: member.email || "",
                phone: member.phone || "",
                facebook_url: member.facebook_url || "",
                instagram_url: member.instagram_url || "",
                linkedin_url: member.linkedin_url || "",
                youtube_url: member.youtube_url || "",
                status: member.status || "active",
                sort_order: member.sort_order ?? 0,
            });

            setPhotoFile(null);

            setPhotoPreview(
                member.photo
                    ? getAdminFacultyImageUrl(member.photo)
                    : ""
            );

            setShowModal(true);
        } catch (err) {
            console.error(
                "Get Faculty By ID Error:",
                err
            );

            alert(
                err.message ||
                "Failed to load faculty member."
            );
        }
    };


    // =========================
    // CLOSE MODAL
    // =========================

    const closeModal = () => {
        if (saving || uploadingPhoto) return;

        setShowModal(false);

        resetForm();
    };


    // =========================
    // PHOTO CHANGE
    // =========================

    const handlePhotoChange = (e) => {
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
                "Faculty photo must be smaller than 20 MB."
            );

            e.target.value = "";

            return;
        }

        setPhotoFile(file);

        setPhotoPreview(
            URL.createObjectURL(file)
        );
    };


    // =========================
    // CREATE / UPDATE
    // =========================

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");

            // -------------------------
            // VALIDATION
            // -------------------------

            if (!form.name.trim()) {
                throw new Error(
                    "Faculty name is required."
                );
            }

            // -------------------------
            // PAYLOAD
            // -------------------------

            const payload = {
                name: form.name.trim(),

                designation:
                    form.designation.trim() || null,

                qualification:
                    form.qualification.trim() || null,

                short_bio:
                    form.short_bio.trim() || null,

                bio:
                    form.bio.trim() || null,

                email:
                    form.email.trim() || null,

                phone:
                    form.phone.trim() || null,

                facebook_url:
                    form.facebook_url.trim() || null,

                instagram_url:
                    form.instagram_url.trim() || null,

                linkedin_url:
                    form.linkedin_url.trim() || null,

                youtube_url:
                    form.youtube_url.trim() || null,

                status: form.status,

                sort_order:
                    Number(form.sort_order) || 0,
            };


            // -------------------------
            // CREATE / UPDATE
            // -------------------------

            let facultyId;

            if (editingId) {
                await updateFaculty(
                    editingId,
                    payload
                );

                facultyId = editingId;
            } else {
                const response =
                    await createFaculty(payload);

                facultyId =
                    response?.data?.id ||
                    response?.faculty?.id ||
                    response?.data?.faculty?.id ||
                    response?.id;

                if (!facultyId) {
                    throw new Error(
                        "Faculty created but faculty ID was not returned."
                    );
                }
            }


            // -------------------------
            // PHOTO UPLOAD
            // -------------------------

            if (photoFile) {
                await uploadFacultyPhoto(
                    facultyId,
                    photoFile
                );
            }


            // -------------------------
            // SUCCESS
            // -------------------------

            await loadFaculty();

            setShowModal(false);

            resetForm();

            alert(
                editingId
                    ? "Faculty updated successfully."
                    : "Faculty created successfully."
            );

        } catch (err) {
            console.error(
                "Save Faculty Error:",
                err
            );

            setError(
                err.message ||
                "Failed to save faculty member."
            );
        } finally {
            setSaving(false);
        }
    };


    // =========================
    // DELETE
    // =========================

    const handleDelete = async () => {
        if (!deleteId) return;

        const member = faculty.find(
            (item) => item.id === deleteId
        );

        const confirmed = window.confirm(
            `Are you sure you want to delete "${member?.name || "this faculty member"}"?`
        );

        if (!confirmed) {
            setDeleteId(null);
            return;
        }

        try {
            setDeleting(true);
            setError("");

            await deleteFaculty(deleteId);

            setDeleteId(null);

            await loadFaculty();
        } catch (err) {
            console.error(
                "Delete Faculty Error:",
                err
            );

            setError(
                err.message ||
                "Failed to delete faculty member."
            );
        } finally {
            setDeleting(false);
        }
    };


    // =========================
    // UI
    // =========================

    return (
        <div className="container-fluid py-4">

            {/* ========================= */}
            {/* HEADER */}
            {/* ========================= */}

            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>
                    <h3 className="mb-1">
                        Faculty Management
                    </h3>

                    <p className="text-muted mb-0">
                        Manage school teachers and faculty members.
                    </p>
                </div>

                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={openAddModal}
                >
                    <i className="bi bi-plus-lg me-2"></i>
                    Add Faculty
                </button>

            </div>


            {/* ========================= */}
            {/* ERROR */}
            {/* ========================= */}

            {error && !showModal && (
                <div className="alert alert-danger">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                </div>
            )}


            {/* ========================= */}
            {/* TABLE */}
            {/* ========================= */}

            <div className="card border-0 shadow-sm">

                <div className="card-body">

                    {loading ? (

                        <div className="text-center py-5">

                            <div
                                className="spinner-border text-primary"
                                role="status"
                            ></div>

                            <p className="text-muted mt-3 mb-0">
                                Loading faculty...
                            </p>

                        </div>

                    ) : faculty.length === 0 ? (

                        /* ========================= */
                        /* EMPTY STATE */
                        /* ========================= */

                        <div className="text-center py-5">

                            <i
                                className="bi bi-people"
                                style={{
                                    fontSize: "48px",
                                    opacity: 0.5,
                                }}
                            ></i>

                            <h5 className="mt-3">
                                No Faculty Found
                            </h5>

                            <p className="text-muted">
                                Start by adding your first faculty member.
                            </p>

                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={openAddModal}
                            >
                                <i className="bi bi-plus-lg me-2"></i>
                                Add Faculty
                            </button>

                        </div>

                    ) : (

                        /* ========================= */
                        /* FACULTY TABLE */
                        /* ========================= */

                        <div className="table-responsive">

                            <table className="table table-hover align-middle mb-0">

                                <thead>

                                    <tr>

                                        <th
                                            style={{
                                                width: "70px",
                                            }}
                                        >
                                            #
                                        </th>

                                        <th
                                            style={{
                                                width: "90px",
                                            }}
                                        >
                                            Photo
                                        </th>

                                        <th>
                                            Faculty
                                        </th>

                                        <th>
                                            Designation
                                        </th>

                                        <th>
                                            Qualification
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Order
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

                                    {faculty.map(
                                        (member, index) => {

                                            const imageUrl =
                                                getAdminFacultyImageUrl(
                                                    member.photo
                                                );

                                            return (
                                                <tr
                                                    key={
                                                        member.id
                                                    }
                                                >

                                                    {/* NUMBER */}

                                                    <td>
                                                        {index + 1}
                                                    </td>


                                                    {/* PHOTO */}

                                                    <td>

                                                        {imageUrl ? (

                                                            <img
                                                                src={
                                                                    imageUrl
                                                                }
                                                                alt={
                                                                    member.name
                                                                }
                                                                style={{
                                                                    width: "55px",
                                                                    height: "55px",
                                                                    objectFit: "cover",
                                                                    borderRadius: "8px",
                                                                }}
                                                                onError={(e) => {
                                                                    e.currentTarget.style.display =
                                                                        "none";
                                                                }}
                                                            />

                                                        ) : (

                                                            <div
                                                                className="bg-light d-flex align-items-center justify-content-center"
                                                                style={{
                                                                    width: "55px",
                                                                    height: "55px",
                                                                    borderRadius: "8px",
                                                                }}
                                                            >
                                                                <i className="bi bi-person fs-4 text-muted"></i>
                                                            </div>

                                                        )}

                                                    </td>


                                                    {/* FACULTY */}

                                                    <td>

                                                        <strong>
                                                            {
                                                                member.name
                                                            }
                                                        </strong>

                                                        {member.email && (
                                                            <div className="small text-muted">
                                                                {
                                                                    member.email
                                                                }
                                                            </div>
                                                        )}

                                                    </td>


                                                    {/* DESIGNATION */}

                                                    <td>
                                                        {
                                                            member.designation ||
                                                            "-"
                                                        }
                                                    </td>


                                                    {/* QUALIFICATION */}

                                                    <td>
                                                        {
                                                            member.qualification ||
                                                            "-"
                                                        }
                                                    </td>


                                                    {/* STATUS */}

                                                    <td>

                                                        {member.status ===
                                                            "active" ? (

                                                            <span className="badge bg-success">
                                                                Active
                                                            </span>

                                                        ) : (

                                                            <span className="badge bg-secondary">
                                                                Inactive
                                                            </span>

                                                        )}

                                                    </td>


                                                    {/* ORDER */}

                                                    <td>
                                                        {
                                                            member.sort_order ??
                                                            0
                                                        }
                                                    </td>


                                                    {/* ACTIONS */}

                                                    <td className="text-end">

                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-primary me-2"
                                                            onClick={() =>
                                                                openEditModal(
                                                                    member.id
                                                                )
                                                            }
                                                            title="Edit Faculty"
                                                        >
                                                            <i className="bi bi-pencil"></i>
                                                        </button>


                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() =>
                                                                setDeleteId(
                                                                    member.id
                                                                )
                                                            }
                                                            title="Delete Faculty"
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

                    )}

                </div>

            </div>


            {/* ========================= */}
            {/* ADD / EDIT MODAL */}
            {/* ========================= */}

            {showModal && (

                <div
                    className="modal d-block"
                    tabIndex="-1"
                    style={{
                        backgroundColor:
                            "rgba(0,0,0,0.5)",
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

                            {/* ========================= */}
                            {/* MODAL HEADER */}
                            {/* ========================= */}

                            <div className="modal-header">

                                <h5 className="modal-title">

                                    <i
                                        className={`bi ${editingId
                                                ? "bi-pencil-square"
                                                : "bi-person-plus"
                                            } me-2`}
                                    ></i>

                                    {editingId
                                        ? "Edit Faculty"
                                        : "Add New Faculty"}

                                </h5>


                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={closeModal}
                                    disabled={
                                        saving ||
                                        uploadingPhoto
                                    }
                                ></button>

                            </div>


                            {/* ========================= */}
                            {/* FORM */}
                            {/* ========================= */}

                            <form
                                onSubmit={
                                    handleSubmit
                                }
                            >

                                <div
                                    className="modal-body"
                                    style={{
                                        overflowY:
                                            "auto",
                                        maxHeight:
                                            "calc(100vh - 180px)",
                                    }}
                                >

                                    {error && (
                                        <div className="alert alert-danger">
                                            <i className="bi bi-exclamation-triangle me-2"></i>
                                            {error}
                                        </div>
                                    )}


                                    {/* ========================= */}
                                    {/* BASIC INFORMATION */}
                                    {/* ========================= */}

                                    <h6 className="fw-bold mb-3">

                                        <i className="bi bi-person me-2"></i>

                                        Basic Information

                                    </h6>


                                    <div className="row g-3">

                                        {/* NAME */}

                                        <div className="col-md-8">

                                            <label className="form-label">
                                                Faculty Name
                                                <span className="text-danger">
                                                    {" "}*
                                                </span>
                                            </label>

                                            <input
                                                type="text"
                                                name="name"
                                                className="form-control"
                                                value={
                                                    form.name
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="e.g. Alok Kumar"
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
                                                    form.status
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                            >

                                                <option value="active">
                                                    Active
                                                </option>

                                                <option value="inactive">
                                                    Inactive
                                                </option>

                                            </select>

                                        </div>


                                        {/* DESIGNATION */}

                                        <div className="col-md-6">

                                            <label className="form-label">
                                                Designation
                                            </label>

                                            <input
                                                type="text"
                                                name="designation"
                                                className="form-control"
                                                value={
                                                    form.designation
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="e.g. Asst. Teacher"
                                            />

                                        </div>


                                        {/* QUALIFICATION */}

                                        <div className="col-md-6">

                                            <label className="form-label">
                                                Qualification
                                            </label>

                                            <input
                                                type="text"
                                                name="qualification"
                                                className="form-control"
                                                value={
                                                    form.qualification
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="e.g. B.Ed., M.A."
                                            />

                                        </div>


                                        {/* EMAIL */}

                                        <div className="col-md-6">

                                            <label className="form-label">
                                                Email
                                            </label>

                                            <input
                                                type="email"
                                                name="email"
                                                className="form-control"
                                                value={
                                                    form.email
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="teacher@example.com"
                                            />

                                        </div>


                                        {/* PHONE */}

                                        <div className="col-md-6">

                                            <label className="form-label">
                                                Phone
                                            </label>

                                            <input
                                                type="text"
                                                name="phone"
                                                className="form-control"
                                                value={
                                                    form.phone
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="+91 XXXXX XXXXX"
                                            />

                                        </div>


                                        {/* SORT ORDER */}

                                        <div className="col-md-6">

                                            <label className="form-label">
                                                Sort Order
                                            </label>

                                            <input
                                                type="number"
                                                name="sort_order"
                                                className="form-control"
                                                value={
                                                    form.sort_order
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                min="0"
                                            />

                                            <small className="text-muted">
                                                Lower number appears first.
                                            </small>

                                        </div>

                                    </div>


                                    <hr className="my-4" />


                                    {/* ========================= */}
                                    {/* FACULTY PHOTO */}
                                    {/* ========================= */}

                                    <h6 className="fw-bold mb-3">

                                        <i className="bi bi-image me-2"></i>

                                        Faculty Photo

                                    </h6>


                                    <div className="row g-3">

                                        <div className="col-md-4">

                                            {photoPreview ? (

                                                <div
                                                    className="border rounded overflow-hidden"
                                                    style={{
                                                        width:
                                                            "100%",
                                                        height:
                                                            "220px",
                                                        backgroundColor:
                                                            "#f8f9fa",
                                                    }}
                                                >

                                                    <img
                                                        src={
                                                            photoPreview
                                                        }
                                                        alt="Faculty Preview"
                                                        style={{
                                                            width:
                                                                "100%",
                                                            height:
                                                                "100%",
                                                            objectFit:
                                                                "cover",
                                                            display:
                                                                "block",
                                                        }}
                                                    />

                                                </div>

                                            ) : (

                                                <div
                                                    className="border rounded d-flex flex-column align-items-center justify-content-center"
                                                    style={{
                                                        width:
                                                            "100%",
                                                        height:
                                                            "220px",
                                                        backgroundColor:
                                                            "#f8f9fa",
                                                    }}
                                                >

                                                    <i
                                                        className="bi bi-person-circle text-muted"
                                                        style={{
                                                            fontSize:
                                                                "70px",
                                                        }}
                                                    ></i>

                                                    <span className="text-muted mt-2">
                                                        No photo selected
                                                    </span>

                                                </div>

                                            )}

                                        </div>


                                        <div className="col-md-8">

                                            <label className="form-label">
                                                Choose Faculty Photo
                                            </label>

                                            <input
                                                type="file"
                                                className="form-control"
                                                accept="image/jpeg,image/png,image/webp"
                                                onChange={
                                                    handlePhotoChange
                                                }
                                                disabled={
                                                    saving ||
                                                    uploadingPhoto
                                                }
                                            />

                                            <small className="text-muted">
                                                JPG, PNG or WEBP · Maximum 20 MB
                                            </small>

                                            {editingId && (
                                                <div className="alert alert-light border mt-3 mb-0">
                                                    <i className="bi bi-info-circle me-2"></i>
                                                    Select a new photo only if you want to replace the existing one.
                                                </div>
                                            )}

                                        </div>

                                    </div>


                                    <hr className="my-4" />


                                    {/* ========================= */}
                                    {/* BIO */}
                                    {/* ========================= */}

                                    <h6 className="fw-bold mb-3">

                                        <i className="bi bi-file-text me-2"></i>

                                        Faculty Information

                                    </h6>


                                    <div className="row g-3">

                                        {/* SHORT BIO */}

                                        <div className="col-12">

                                            <label className="form-label">
                                                Short Bio
                                            </label>

                                            <textarea
                                                name="short_bio"
                                                className="form-control"
                                                rows="3"
                                                value={
                                                    form.short_bio
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="Short introduction shown on the Trainers page..."
                                            ></textarea>

                                        </div>


                                        {/* FULL BIO */}

                                        <div className="col-12">

                                            <label className="form-label">
                                                Full Bio
                                            </label>

                                            <textarea
                                                name="bio"
                                                className="form-control"
                                                rows="6"
                                                value={
                                                    form.bio
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="Write complete faculty biography..."
                                            ></textarea>

                                        </div>

                                    </div>


                                    <hr className="my-4" />


                                    {/* ========================= */}
                                    {/* SOCIAL LINKS */}
                                    {/* ========================= */}

                                    <h6 className="fw-bold mb-3">

                                        <i className="bi bi-share me-2"></i>

                                        Social Media

                                    </h6>


                                    <div className="row g-3">

                                        {/* FACEBOOK */}

                                        <div className="col-md-6">

                                            <label className="form-label">
                                                Facebook URL
                                            </label>

                                            <div className="input-group">

                                                <span className="input-group-text">
                                                    <i className="bi bi-facebook"></i>
                                                </span>

                                                <input
                                                    type="url"
                                                    name="facebook_url"
                                                    className="form-control"
                                                    value={
                                                        form.facebook_url
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                    placeholder="https://facebook.com/..."
                                                />

                                            </div>

                                        </div>


                                        {/* INSTAGRAM */}

                                        <div className="col-md-6">

                                            <label className="form-label">
                                                Instagram URL
                                            </label>

                                            <div className="input-group">

                                                <span className="input-group-text">
                                                    <i className="bi bi-instagram"></i>
                                                </span>

                                                <input
                                                    type="url"
                                                    name="instagram_url"
                                                    className="form-control"
                                                    value={
                                                        form.instagram_url
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                    placeholder="https://instagram.com/..."
                                                />

                                            </div>

                                        </div>


                                        {/* LINKEDIN */}

                                        <div className="col-md-6">

                                            <label className="form-label">
                                                LinkedIn URL
                                            </label>

                                            <div className="input-group">

                                                <span className="input-group-text">
                                                    <i className="bi bi-linkedin"></i>
                                                </span>

                                                <input
                                                    type="url"
                                                    name="linkedin_url"
                                                    className="form-control"
                                                    value={
                                                        form.linkedin_url
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                    placeholder="https://linkedin.com/in/..."
                                                />

                                            </div>

                                        </div>


                                        {/* YOUTUBE */}

                                        <div className="col-md-6">

                                            <label className="form-label">
                                                YouTube URL
                                            </label>

                                            <div className="input-group">

                                                <span className="input-group-text">
                                                    <i className="bi bi-youtube"></i>
                                                </span>

                                                <input
                                                    type="url"
                                                    name="youtube_url"
                                                    className="form-control"
                                                    value={
                                                        form.youtube_url
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                    placeholder="https://youtube.com/..."
                                                />

                                            </div>

                                        </div>

                                    </div>

                                </div>


                                {/* ========================= */}
                                {/* MODAL FOOTER */}
                                {/* ========================= */}

                                <div
                                    className="modal-footer"
                                    style={{
                                        flexShrink: 0,
                                    }}
                                >

                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={
                                            closeModal
                                        }
                                        disabled={
                                            saving ||
                                            uploadingPhoto
                                        }
                                    >
                                        Cancel
                                    </button>


                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={
                                            saving ||
                                            uploadingPhoto
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
                                                    ? "Update Faculty"
                                                    : "Create Faculty"}
                                            </>

                                        )}

                                    </button>

                                </div>

                            </form>

                        </div>

                    </div>

                </div>

            )}


            {/* ========================= */}
            {/* DELETE CONFIRMATION */}
            {/* ========================= */}

            {deleteId && (

                <div
                    className="modal d-block"
                    tabIndex="-1"
                    style={{
                        backgroundColor:
                            "rgba(0,0,0,0.5)",
                        position: "fixed",
                        inset: 0,
                        zIndex: 1060,
                    }}
                >

                    <div
                        className="modal-dialog modal-dialog-centered"
                    >

                        <div className="modal-content">

                            <div className="modal-header">

                                <h5 className="modal-title">

                                    <i className="bi bi-exclamation-triangle text-danger me-2"></i>

                                    Delete Faculty

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


                            <div className="modal-body">

                                <p className="mb-0">
                                    Are you sure you want to delete this faculty member?
                                </p>

                                <small className="text-muted">
                                    This action cannot be undone.
                                </small>

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
                                    onClick={
                                        handleDelete
                                    }
                                    disabled={deleting}
                                >

                                    {deleting ? (

                                        <>
                                            <span
                                                className="spinner-border spinner-border-sm me-2"
                                                role="status"
                                            ></span>

                                            Deleting...
                                        </>

                                    ) : (

                                        <>
                                            <i className="bi bi-trash me-2"></i>
                                            Delete Faculty
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


export default AdminFaculty;