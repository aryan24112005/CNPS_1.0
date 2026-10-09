import { useEffect, useRef, useState } from "react";

import {
    getAdminHeroSlides,
    getAdminHeroSlideById,
    createHeroSlide,
    updateHeroSlide,
    deleteHeroSlide,
    getAdminHeroMediaUrl,
} from "../services/adminHeroService";

import {
    getAdminHomepageCounts,
    getAdminHomepageCountById,
    createHomepageCount,
    updateHomepageCount,
    deleteHomepageCount,
} from "../services/adminHomepageCountsService";

function AdminHomepage() {
    const fileInputRef = useRef(null);

    const [slides, setSlides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previews, setPreviews] = useState([]);

    const [formData, setFormData] = useState({
        title: "",
        subtitle: "",
        description: "",
        button_text: "",
        button_url: "",
        status: "active",
        sort_order: 0,
    });

    const [counts, setCounts] = useState([]);
    const [countsLoading, setCountsLoading] = useState(true);
    const [countSaving, setCountSaving] = useState(false);
    const [countDeletingId, setCountDeletingId] = useState(null);

    const [showCountForm, setShowCountForm] = useState(false);
    const [editingCountId, setEditingCountId] = useState(null);

    const [countFormData, setCountFormData] = useState({
        type: "students",
        value: 0,
    });

    /* ----------------------------------------
       LOAD SLIDES
    ----------------------------------------- */

    const loadSlides = async () => {
        try {
            setLoading(true);

            const data = await getAdminHeroSlides();

            setSlides(data);
        } catch (error) {
            console.error("Hero slides load error:", error);

            alert(
                error.message ||
                "Failed to load hero slides."
            );
        } finally {
            setLoading(false);
        }
    };

    const loadCounts = async () => {
        try {
            setCountsLoading(true);

            const data = await getAdminHomepageCounts();

            setCounts(data);
        } catch (error) {
            console.error(
                "Homepage counts load error:",
                error
            );

            alert(
                error.message ||
                "Failed to load homepage counts."
            );
        } finally {
            setCountsLoading(false);
        }
    };

    useEffect(() => {
        loadSlides();
        loadCounts();
    }, []);




    /* ----------------------------------------
       FORM CHANGE
    ----------------------------------------- */

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    /* ----------------------------------------
       FILE SELECTION
    ----------------------------------------- */

    const handleFilesChange = (e) => {
        const files = Array.from(e.target.files || []);

        if (!files.length) return;

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "video/mp4",
            "video/webm",
        ];

        const maxSize = 100 * 1024 * 1024;

        const validFiles = [];

        for (const file of files) {
            if (!allowedTypes.includes(file.type)) {
                alert(
                    `${file.name} is not supported.\n\nAllowed: JPG, PNG, WEBP, MP4, WEBM`
                );

                continue;
            }

            if (file.size > maxSize) {
                alert(
                    `${file.name} is larger than 100 MB.`
                );

                continue;
            }

            validFiles.push(file);
        }

        setSelectedFiles(validFiles);

        const previewData = validFiles.map((file) => ({
            file,
            url: URL.createObjectURL(file),
            type: file.type.startsWith("video/")
                ? "video"
                : "image",
        }));

        setPreviews(previewData);
    };

    /* ----------------------------------------
       REMOVE SELECTED FILE
    ----------------------------------------- */

    const removeSelectedFile = (index) => {
        const updatedFiles = selectedFiles.filter(
            (_, i) => i !== index
        );

        const updatedPreviews = previews.filter(
            (_, i) => i !== index
        );

        setSelectedFiles(updatedFiles);
        setPreviews(updatedPreviews);
    };

    /* ----------------------------------------
       OPEN ADD FORM
    ----------------------------------------- */

    const openAddForm = () => {
        setEditingId(null);

        setFormData({
            title: "",
            subtitle: "",
            description: "",
            button_text: "",
            button_url: "",
            status: "active",
            sort_order: slides.length,
        });

        setSelectedFiles([]);
        setPreviews([]);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }

        setShowForm(true);
    };

    /* ----------------------------------------
       OPEN EDIT FORM
    ----------------------------------------- */

    const openEditForm = async (id) => {
        try {
            const slide =
                await getAdminHeroSlideById(id);

            setEditingId(id);

            setFormData({
                title: slide.title || "",
                subtitle: slide.subtitle || "",
                description:
                    slide.description || "",
                button_text:
                    slide.button_text || "",
                button_url:
                    slide.button_url || "",
                status:
                    slide.status || "active",
                sort_order:
                    slide.sort_order ?? 0,
            });

            setSelectedFiles([]);
            setPreviews([]);

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            setShowForm(true);
        } catch (error) {
            console.error(
                "Get hero slide error:",
                error
            );

            alert(
                error.message ||
                "Failed to load hero slide."
            );
        }
    };

    /* ----------------------------------------
       CLOSE FORM
    ----------------------------------------- */

    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
        setSelectedFiles([]);
        setPreviews([]);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleCountChange = (e) => {
        const { name, value } = e.target;

        setCountFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };


    const openAddCountForm = () => {
        setEditingCountId(null);

        setCountFormData({
            type: "students",
            value: 0,
        });

        setShowCountForm(true);
    };


    const openEditCountForm = async (id) => {
        try {
            const count =
                await getAdminHomepageCountById(id);

            const typeMap = {
                Students: "students",
                Courses: "courses",
                Events: "events",
                Faculties: "faculties",
            };

            setEditingCountId(id);

            setCountFormData({
                type: typeMap[count.label] || "students",
                value: count.value ?? 0,
            });

            setShowCountForm(true);
        } catch (error) {
            console.error(
                "Get homepage count error:",
                error
            );

            alert(
                error.message ||
                "Failed to load homepage count."
            );
        }
    };


    const closeCountForm = () => {
        if (countSaving) return;

        setShowCountForm(false);
        setEditingCountId(null);

        setCountFormData({
            type: "students",
            value: 0,
        });
    };


    const handleCountSubmit = async (e) => {
        e.preventDefault();

        const countLabels = {
            students: "Students",
            courses: "Courses",
            events: "Events",
            faculties: "Faculties",
        };

        try {
            setCountSaving(true);

            const payload = {
                value: String(countFormData.value),
                label: countLabels[countFormData.type],
                icon:
                    countFormData.type === "students"
                        ? "bi bi-people"
                        : countFormData.type === "courses"
                            ? "bi bi-book"
                            : countFormData.type === "events"
                                ? "bi bi-calendar-event"
                                : "bi bi-person-badge",
                status: "active",
                sort_order: 0,
            };

            if (editingCountId) {
                await updateHomepageCount(
                    editingCountId,
                    payload
                );

                alert(
                    "Homepage count updated successfully."
                );
            } else {
                await createHomepageCount(payload);

                alert(
                    "Homepage count created successfully."
                );
            }

            setShowCountForm(false);
            setEditingCountId(null);

            await loadCounts();
        } catch (error) {
            console.error(
                "Save homepage count error:",
                error
            );

            alert(
                error.message ||
                "Failed to save homepage count."
            );
        } finally {
            setCountSaving(false);
        }
    };


    const handleCountDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this homepage count?"
        );

        if (!confirmed) return;

        try {
            setCountDeletingId(id);

            await deleteHomepageCount(id);

            alert(
                "Homepage count deleted successfully."
            );

            await loadCounts();
        } catch (error) {
            console.error(
                "Delete homepage count error:",
                error
            );

            alert(
                error.message ||
                "Failed to delete homepage count."
            );
        } finally {
            setCountDeletingId(null);
        }
    };

    /* ----------------------------------------
       SAVE HERO
    ----------------------------------------- */

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);

            /* --------------------------------
               ADD
            --------------------------------- */

            if (!editingId) {
                if (selectedFiles.length === 0) {
                    alert(
                        "Please select at least one image or video."
                    );

                    setSaving(false);
                    return;
                }

                /*
                 * Multiple files are uploaded
                 * individually because the current
                 * service creates one slide per file.
                 */

                for (
                    let i = 0;
                    i < selectedFiles.length;
                    i++
                ) {
                    const currentFile =
                        selectedFiles[i];

                    const slideData = {
                        ...formData,

                        sort_order:
                            Number(
                                formData.sort_order
                            ) + i,
                    };

                    await createHeroSlide(
                        slideData,
                        currentFile
                    );
                }

                alert(
                    `${selectedFiles.length} hero slide(s) created successfully.`
                );
            }

            /* --------------------------------
               EDIT
            --------------------------------- */

            else {
                const mediaFile =
                    selectedFiles[0] || null;

                await updateHeroSlide(
                    editingId,
                    formData,
                    mediaFile
                );

                alert(
                    "Hero slide updated successfully."
                );
            }

            closeForm();

            await loadSlides();
        } catch (error) {
            console.error(
                "Save hero slide error:",
                error
            );

            alert(
                error.message ||
                "Failed to save hero slide."
            );
        } finally {
            setSaving(false);
        }
    };

    /* ----------------------------------------
       DELETE
    ----------------------------------------- */

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this hero slide?\n\nThe uploaded image/video will also be deleted."
        );

        if (!confirmed) return;

        try {
            setDeletingId(id);

            await deleteHeroSlide(id);

            alert(
                "Hero slide deleted successfully."
            );

            await loadSlides();
        } catch (error) {
            console.error(
                "Delete hero slide error:",
                error
            );

            alert(
                error.message ||
                "Failed to delete hero slide."
            );
        } finally {
            setDeletingId(null);
        }
    };

    /* ----------------------------------------
       RENDER MEDIA
    ----------------------------------------- */

    const renderMedia = (
        mediaType,
        mediaPath,
        className = ""
    ) => {
        // Support both old (mediaType + mediaPath) and new (image) API shape
        const resolvedPath = mediaPath || mediaType; // when called with (slide.image, className)
        const mediaUrl = getAdminHeroMediaUrl(resolvedPath);

        return (
            <img
                src={mediaUrl}
                className={className}
                alt="Hero"
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
            />
        );
    };

    return (
        <div className="admin-page">

            {/* --------------------------------
                HEADER
            --------------------------------- */}

            <div className="admin-page-header d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-1">
                        Homepage
                    </h2>

                    <p className="text-muted mb-0">
                        Manage homepage hero slider
                        and promotional media.
                    </p>
                </div>

                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={openAddForm}
                >
                    <i className="bi bi-plus-lg me-2"></i>
                    Add Hero Slides
                </button>
            </div>

            {/* --------------------------------
                HERO INFORMATION
            --------------------------------- */}

            <div className="alert alert-info mb-4">
                <i className="bi bi-info-circle me-2"></i>

                You can upload multiple images
                and videos together. Videos are
                uploaded directly from your device.
                No video URL is required.
            </div>

            {/* --------------------------------
                LOADING
            --------------------------------- */}

            {loading && (
                <div className="text-center py-5">
                    <div
                        className="spinner-border text-primary"
                        role="status"
                    ></div>

                    <p className="mt-3 mb-0">
                        Loading hero slides...
                    </p>
                </div>
            )}

            {/* --------------------------------
                EMPTY
            --------------------------------- */}

            {!loading &&
                slides.length === 0 && (
                    <div className="card">
                        <div className="card-body text-center py-5">
                            <i
                                className="bi bi-images"
                                style={{
                                    fontSize: "48px",
                                }}
                            ></i>

                            <h4 className="mt-3">
                                No Hero Slides Yet
                            </h4>

                            <p className="text-muted">
                                Upload your first
                                homepage image or
                                video.
                            </p>

                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={
                                    openAddForm
                                }
                            >
                                <i className="bi bi-cloud-upload me-2"></i>
                                Upload Hero Media
                            </button>
                        </div>
                    </div>
                )}

            {/* --------------------------------
                SLIDES TABLE
            --------------------------------- */}

            {!loading &&
                slides.length > 0 && (
                    <div className="card">
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead>
                                        <tr>
                                            <th
                                                style={{
                                                    width: "90px",
                                                }}
                                            >
                                                Order
                                            </th>

                                            <th
                                                style={{
                                                    width: "180px",
                                                }}
                                            >
                                                Media
                                            </th>

                                            <th>
                                                Content
                                            </th>

                                            <th>
                                                Type
                                            </th>

                                            <th>
                                                Status
                                            </th>

                                            <th
                                                className="text-end"
                                                style={{
                                                    width: "150px",
                                                }}
                                            >
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {slides.map(
                                            (slide) => (
                                                <tr
                                                    key={
                                                        slide.id
                                                    }
                                                >
                                                    {/* ORDER */}

                                                    <td>
                                                        <span className="badge bg-light text-dark">
                                                            {
                                                                slide.sort_order
                                                            }
                                                        </span>
                                                    </td>

                                                    {/* MEDIA */}

                                                    <td>
                                                        <div
                                                            style={{
                                                                width: "150px",
                                                                height: "85px",
                                                                overflow:
                                                                    "hidden",
                                                                borderRadius:
                                                                    "8px",
                                                                background:
                                                                    "#f1f1f1",
                                                            }}
                                                        >
                                                            {renderMedia(
                                                                slide.image,
                                                                null,
                                                                "w-100 h-100"
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* CONTENT */}

                                                    <td>
                                                        <strong>
                                                            {slide.title ||
                                                                "Untitled Slide"}
                                                        </strong>

                                                        {slide.subtitle && (
                                                            <div className="small text-muted mt-1">
                                                                {
                                                                    slide.subtitle
                                                                }
                                                            </div>
                                                        )}

                                                        {slide.button_text && (
                                                            <div className="small mt-1">
                                                                Button:{" "}
                                                                {
                                                                    slide.button_text
                                                                }
                                                            </div>
                                                        )}
                                                    </td>

                                                    {/* TYPE */}

                                                    <td>
                                                        <span className="badge bg-secondary">
                                                            <i className="bi bi-image me-1"></i>
                                                            Image
                                                        </span>
                                                    </td>

                                                    {/* STATUS */}

                                                    <td>
                                                        {slide.status ===
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

                                                    {/* ACTIONS */}

                                                    <td className="text-end">
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-primary me-2"
                                                            onClick={() =>
                                                                openEditForm(
                                                                    slide.id
                                                                )
                                                            }
                                                        >
                                                            <i className="bi bi-pencil"></i>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    slide.id
                                                                )
                                                            }
                                                            disabled={
                                                                deletingId ===
                                                                slide.id
                                                            }
                                                        >
                                                            {deletingId ===
                                                                slide.id ? (
                                                                <span className="spinner-border spinner-border-sm"></span>
                                                            ) : (
                                                                <i className="bi bi-trash"></i>
                                                            )}
                                                        </button>
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

            {/* ========================================
    HOMEPAGE COUNTS
======================================== */}

            <div className="card mt-4">

                <div className="card-header d-flex justify-content-between align-items-center">
                    <div>
                        <h5 className="mb-1">
                            Homepage Counts
                        </h5>

                        <small className="text-muted">
                            Manage the statistics displayed
                            on the homepage.
                        </small>
                    </div>

                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={openAddCountForm}
                    >
                        <i className="bi bi-plus-lg me-2"></i>
                        Add Count
                    </button>
                </div>


                <div className="card-body p-0">

                    {countsLoading ? (

                        <div className="text-center py-5">

                            <div
                                className="spinner-border text-primary"
                                role="status"
                            ></div>

                            <p className="mt-3 mb-0">
                                Loading homepage counts...
                            </p>

                        </div>

                    ) : counts.length === 0 ? (

                        <div className="text-center py-5">

                            <i
                                className="bi bi-bar-chart"
                                style={{
                                    fontSize: "48px",
                                }}
                            ></i>

                            <h5 className="mt-3">
                                No Homepage Counts Yet
                            </h5>

                            <p className="text-muted">
                                Add statistics such as Students,
                                Courses, Events and Faculties.
                            </p>

                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={openAddCountForm}
                            >
                                <i className="bi bi-plus-lg me-2"></i>
                                Add First Count
                            </button>

                        </div>

                    ) : (

                        <div className="table-responsive">

                            <table className="table table-hover align-middle mb-0">

                                <thead>
                                    <tr>
                                        <th style={{ width: "80px" }}>
                                            Order
                                        </th>

                                        <th style={{ width: "100px" }}>
                                            Icon
                                        </th>

                                        <th>
                                            Number
                                        </th>

                                        <th>
                                            Label
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th
                                            className="text-end"
                                            style={{ width: "150px" }}
                                        >
                                            Actions
                                        </th>
                                    </tr>
                                </thead>


                                <tbody>

                                    {counts.map((count) => (

                                        <tr key={count.id}>

                                            <td>
                                                <span className="badge bg-light text-dark">
                                                    {count.sort_order}
                                                </span>
                                            </td>


                                            <td>

                                                {count.icon ? (

                                                    <i
                                                        className={count.icon}
                                                        style={{
                                                            fontSize: "24px",
                                                        }}
                                                    ></i>

                                                ) : (

                                                    <span className="text-muted">
                                                        —
                                                    </span>

                                                )}

                                            </td>


                                            <td>

                                                <strong>
                                                    {count.value}
                                                </strong>

                                            </td>


                                            <td>
                                                {count.label}
                                            </td>


                                            <td>

                                                {count.status ===
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


                                            <td className="text-end">

                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-primary me-2"
                                                    onClick={() =>
                                                        openEditCountForm(
                                                            count.id
                                                        )
                                                    }
                                                >
                                                    <i className="bi bi-pencil"></i>
                                                </button>


                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() =>
                                                        handleCountDelete(
                                                            count.id
                                                        )
                                                    }
                                                    disabled={
                                                        countDeletingId ===
                                                        count.id
                                                    }
                                                >
                                                    {countDeletingId ===
                                                        count.id ? (

                                                        <span className="spinner-border spinner-border-sm"></span>

                                                    ) : (

                                                        <i className="bi bi-trash"></i>

                                                    )}
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

            {/* --------------------------------
                FORM
            --------------------------------- */}

            {showForm && (
                <div
                    className="modal fade show d-block"
                    tabIndex="-1"
                    style={{
                        background:
                            "rgba(0,0,0,0.55)",
                    }}
                >
                    <div
                        className="modal-dialog modal-xl"
                        style={{
                            maxWidth: "900px",
                            height: "90vh",
                            margin: "5vh auto",
                        }}
                    >
                        <div className="modal-content">

                            {/* MODAL HEADER */}

                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {editingId
                                        ? "Edit Hero Slide"
                                        : "Add Hero Slides"}
                                </h5>

                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={
                                        closeForm
                                    }
                                    disabled={
                                        saving
                                    }
                                ></button>
                            </div>

                            {/* FORM */}

                            <form
                                onSubmit={
                                    handleSubmit
                                }
                            >
                                <div
                                    className="modal-body"
                                    style={{
                                        overflowY: "auto",
                                        overflowX: "hidden",
                                        maxHeight: "calc(90vh - 140px)",
                                        WebkitOverflowScrolling: "touch",
                                    }}
                                >

                                    {/* MEDIA UPLOAD */}

                                    <div className="mb-4">
                                        <label className="form-label fw-semibold">
                                            {editingId
                                                ? "Replace Media (Optional)"
                                                : "Hero Images / Videos"}
                                        </label>

                                        <input
                                            ref={
                                                fileInputRef
                                            }
                                            type="file"
                                            className="form-control"
                                            accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
                                            multiple={
                                                !editingId
                                            }
                                            onChange={
                                                handleFilesChange
                                            }
                                        />

                                        <div className="form-text">
                                            {editingId
                                                ? "Select one image or video to replace the current media."
                                                : "You can select multiple JPG, PNG, WEBP, MP4 or WEBM files. Maximum 100 MB per file."}
                                        </div>
                                    </div>

                                    {/* NEW FILE PREVIEWS */}

                                    {previews.length >
                                        0 && (
                                            <div className="mb-4">
                                                <h6 className="fw-semibold mb-3">
                                                    Selected Media
                                                </h6>

                                                <div className="row g-3">
                                                    {previews.map(
                                                        (
                                                            preview,
                                                            index
                                                        ) => (
                                                            <div
                                                                className="col-md-4 col-lg-3"
                                                                key={
                                                                    index
                                                                }
                                                            >
                                                                <div className="card h-100">
                                                                    <div
                                                                        style={{
                                                                            height: "150px",
                                                                            overflow:
                                                                                "hidden",
                                                                        }}
                                                                    >
                                                                        {preview.type ===
                                                                            "video" ? (
                                                                            <video
                                                                                src={
                                                                                    preview.url
                                                                                }
                                                                                className="w-100 h-100"
                                                                                style={{
                                                                                    objectFit:
                                                                                        "cover",
                                                                                }}
                                                                                muted
                                                                                controls
                                                                            />
                                                                        ) : (
                                                                            <img
                                                                                src={
                                                                                    preview.url
                                                                                }
                                                                                className="w-100 h-100"
                                                                                style={{
                                                                                    objectFit:
                                                                                        "cover",
                                                                                }}
                                                                                alt="Preview"
                                                                            />
                                                                        )}
                                                                    </div>

                                                                    <div className="card-body p-2">
                                                                        <div className="small text-truncate mb-2">
                                                                            {
                                                                                preview
                                                                                    .file
                                                                                    .name
                                                                            }
                                                                        </div>

                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-sm btn-outline-danger w-100"
                                                                            onClick={() =>
                                                                                removeSelectedFile(
                                                                                    index
                                                                                )
                                                                            }
                                                                        >
                                                                            <i className="bi bi-x-lg me-1"></i>
                                                                            Remove
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                    {/* EXISTING MEDIA */}

                                    {editingId &&
                                        previews.length ===
                                        0 && (
                                            <div className="mb-4">
                                                <label className="form-label fw-semibold">
                                                    Current Media
                                                </label>

                                                {(() => {
                                                    const currentSlide =
                                                        slides.find(
                                                            (
                                                                item
                                                            ) =>
                                                                item.id ===
                                                                editingId
                                                        );

                                                    if (
                                                        !currentSlide
                                                    ) {
                                                        return null;
                                                    }

                                                    return (
                                                        <div
                                                            style={{
                                                                width: "100%",
                                                                maxWidth:
                                                                    "600px",
                                                                height: "260px",
                                                                borderRadius:
                                                                    "10px",
                                                                overflow:
                                                                    "hidden",
                                                                background:
                                                                    "#f1f1f1",
                                                            }}
                                                        >
                                                            {renderMedia(
                                                                currentSlide.image,
                                                                null,
                                                                "w-100 h-100"
                                                            )}
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        )}

                                    {/* CONTENT */}

                                    <div className="row g-3">

                                        {/* TITLE */}

                                        <div className="col-md-6">
                                            <label className="form-label">
                                                Title
                                            </label>

                                            <input
                                                type="text"
                                                name="title"
                                                className="form-control"
                                                value={
                                                    formData.title
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="Learning Today, Leading Tomorrow"
                                            />
                                        </div>

                                        {/* SUBTITLE */}

                                        <div className="col-md-6">
                                            <label className="form-label">
                                                Subtitle
                                            </label>

                                            <input
                                                type="text"
                                                name="subtitle"
                                                className="form-control"
                                                value={
                                                    formData.subtitle
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="Empowering Young Minds"
                                            />
                                        </div>

                                        {/* DESCRIPTION */}

                                        <div className="col-12">
                                            <label className="form-label">
                                                Description
                                            </label>

                                            <textarea
                                                name="description"
                                                className="form-control"
                                                rows="4"
                                                value={
                                                    formData.description
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="Write a short description for this hero slide..."
                                            ></textarea>
                                        </div>

                                        {/* BUTTON TEXT */}

                                        <div className="col-md-6">
                                            <label className="form-label">
                                                Button Text
                                            </label>

                                            <input
                                                type="text"
                                                name="button_text"
                                                className="form-control"
                                                value={
                                                    formData.button_text
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="Get Started"
                                            />
                                        </div>

                                        {/* BUTTON URL */}

                                        <div className="col-md-6">
                                            <label className="form-label">
                                                Button URL
                                            </label>

                                            <input
                                                type="text"
                                                name="button_url"
                                                className="form-control"
                                                value={
                                                    formData.button_url
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="/admission"
                                            />
                                        </div>

                                        {/* STATUS */}

                                        <div className="col-md-6">
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
                                                <option value="active">
                                                    Active
                                                </option>

                                                <option value="inactive">
                                                    Inactive
                                                </option>
                                            </select>
                                        </div>

                                        {/* ORDER */}

                                        <div className="col-md-6">
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
                                        </div>
                                    </div>
                                </div>

                                {/* MODAL FOOTER */}

                                <div className="modal-footer">

                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={
                                            closeForm
                                        }
                                        disabled={
                                            saving
                                        }
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={
                                            saving
                                        }
                                    >
                                        {saving ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>

                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-check-lg me-2"></i>

                                                {editingId
                                                    ? "Update Slide"
                                                    : "Upload Slides"}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================
    COUNT FORM MODAL
======================================== */}

            {showCountForm && (
                <div
                    className="modal fade show d-block"
                    tabIndex="-1"
                    style={{
                        background: "rgba(0,0,0,0.55)",
                    }}
                >
                    <div
                        className="modal-dialog"
                        style={{
                            maxWidth: "500px",
                            height: "auto",
                            margin: "10vh auto",
                        }}
                    >
                        <div className="modal-content">

                            {/* HEADER */}

                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {editingCountId
                                        ? "Edit Homepage Count"
                                        : "Add Homepage Count"}
                                </h5>

                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={closeCountForm}
                                    disabled={countSaving}
                                ></button>
                            </div>


                            {/* FORM */}

                            <form onSubmit={handleCountSubmit}>

                                <div className="modal-body">

                                    {/* COUNT TYPE */}

                                    <div className="mb-3">

                                        <label className="form-label fw-semibold">
                                            Count For
                                        </label>

                                        <select
                                            name="type"
                                            className="form-select"
                                            value={
                                                countFormData.type
                                            }
                                            onChange={
                                                handleCountChange
                                            }
                                            disabled={editingCountId}
                                        >

                                            <option value="students">
                                                Students
                                            </option>

                                            <option value="courses">
                                                Courses
                                            </option>

                                            <option value="events">
                                                Events
                                            </option>

                                            <option value="faculties">
                                                Faculties
                                            </option>

                                        </select>

                                    </div>


                                    {/* VALUE */}

                                    <div className="mb-2">

                                        <label className="form-label fw-semibold">
                                            Value
                                        </label>

                                        <input
                                            type="number"
                                            name="value"
                                            className="form-control"
                                            value={
                                                countFormData.value
                                            }
                                            onChange={
                                                handleCountChange
                                            }
                                            min="0"
                                            required
                                            autoFocus
                                        />

                                    </div>

                                    {/* HARD-CODED ICON */}

                                    <div className="col-12 mt-3">

                                        <label className="form-label fw-semibold">
                                            Icon
                                        </label>

                                        <div className="border rounded p-3 d-flex align-items-center gap-3">

                                            <i
                                                className={
                                                    countFormData.type === "students"
                                                        ? "bi bi-people"
                                                        : countFormData.type === "courses"
                                                            ? "bi bi-book"
                                                            : countFormData.type === "events"
                                                                ? "bi bi-calendar-event"
                                                                : "bi bi-person-badge"
                                                }
                                                style={{
                                                    fontSize: "32px",
                                                }}
                                            ></i>

                                            <div>
                                                <div className="fw-semibold">
                                                    {countFormData.type === "students"
                                                        ? "Students"
                                                        : countFormData.type === "courses"
                                                            ? "Courses"
                                                            : countFormData.type === "events"
                                                                ? "Events"
                                                                : "Faculties"}
                                                </div>

                                                <small className="text-muted">
                                                    Icon is fixed for this count
                                                </small>
                                            </div>

                                        </div>

                                    </div>

                                </div>


                                {/* FOOTER */}

                                <div className="modal-footer">

                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={closeCountForm}
                                        disabled={countSaving}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={countSaving}
                                    >
                                        {countSaving ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-check-lg me-2"></i>
                                                {editingCountId
                                                    ? "Update"
                                                    : "Save"}
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

export default AdminHomepage;