import { useEffect, useState } from "react";

import {
    getAdminEvents,
    getAdminEventImageUrl,
    deleteEvent,
    createEvent,
    getAdminEventById,
    updateEvent,
    uploadEventBanner,
    uploadEventGalleryImages,
    updateEventGalleryImage,
    deleteEventGalleryImage,
} from "../services/adminEventService";

function AdminEvents() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);

    const [editingEventId, setEditingEventId] = useState(null);
    const [bannerFile, setBannerFile] = useState(null);
    const [bannerPreview, setBannerPreview] = useState("");
    const [uploadingBanner, setUploadingBanner] = useState(false);

    // Event Gallery
    const [eventGallery, setEventGallery] = useState([]);
    const [galleryFiles, setGalleryFiles] = useState([]);
    const [galleryPreviews, setGalleryPreviews] = useState([]);
    const [uploadingGallery, setUploadingGallery] = useState(false);
    const [updatingGalleryImageId, setUpdatingGalleryImageId] = useState(null);
    const [deletingGalleryImageId, setDeletingGalleryImageId] = useState(null);

    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        short_description: "",
        description: "",
        event_date: "",
        start_time: "",
        end_time: "",
        venue: "",
        status: "active",
        sort_order: 0,
    });

    // ================================
    // LOAD EVENTS
    // ================================

    const loadEvents = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getAdminEvents();

            setEvents(data);
        } catch (error) {
            console.error("Load Events Error:", error);

            setError(
                error.message || "Failed to load events."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEvents();
    }, []);

    // ================================
    // FORM CHANGE
    // ================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // ================================
    // RESET FORM
    // ================================

    const resetForm = () => {
        setFormData({
            title: "",
            slug: "",
            short_description: "",
            description: "",
            event_date: "",
            start_time: "",
            end_time: "",
            venue: "",
            status: "active",
            sort_order: 0,
        });

        setEditingEventId(null);
        setBannerFile(null);
        setBannerPreview("");

        // Clear event gallery state.
        setEventGallery([]);
        setGalleryFiles([]);
        setGalleryPreviews([]);
    };

    // ================================
    // OPEN ADD FORM
    // ================================

    const openAddForm = () => {
        resetForm();

        setShowForm(true);
    };

    // ================================
    // CLOSE FORM
    // ================================

    const closeForm = () => {
        if (saving) return;

        setShowForm(false);
        resetForm();
    };

    // ================================
    // OPEN EDIT FORM
    // ================================

    const openEditForm = async (id) => {
        try {
            setError("");

            const event = await getAdminEventById(id);

            setFormData({
                title: event.title || "",
                slug: event.slug || "",
                short_description:
                    event.short_description || "",
                description:
                    event.description || "",
                event_date:
                    event.event_date
                        ? String(event.event_date).slice(0, 10)
                        : "",
                start_time:
                    event.start_time
                        ? String(event.start_time).slice(0, 5)
                        : "",
                end_time:
                    event.end_time
                        ? String(event.end_time).slice(0, 5)
                        : "",
                venue: event.venue || "",
                status: event.status || "active",
                sort_order: event.sort_order ?? 0,
            });

            setBannerFile(null);

            setBannerPreview(
                event.image
                    ? getAdminEventImageUrl(event.image)
                    : ""
            );

            // Load existing gallery images for this event.
            setEventGallery(
                Array.isArray(event.event_images) ? event.event_images : []
            );
            setGalleryFiles([]);
            setGalleryPreviews([]);

            setEditingEventId(id);
            setShowForm(true);
        } catch (error) {
            console.error(
                "Get Event By ID Error:",
                error
            );

            alert(
                error.message ||
                "Failed to load event details."
            );
        }
    };

    const handleBannerChange = (e) => {
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
                "Banner image must be smaller than 20 MB."
            );

            e.target.value = "";
            return;
        }

        setBannerFile(file);

        const previewUrl =
            URL.createObjectURL(file);

        setBannerPreview(previewUrl);
    };

    const handleBannerUpload = async () => {
        if (!editingEventId) {
            alert(
                "Please create the event first."
            );
            return;
        }

        if (!bannerFile) {
            alert(
                "Please select a banner image first."
            );
            return;
        }

        try {
            setUploadingBanner(true);

            const data = await uploadEventBanner(
                editingEventId,
                bannerFile
            );

            setBannerFile(null);

            if (data.image) {
                setBannerPreview(
                    getAdminEventImageUrl(data.image)
                );
            }

            await loadEvents();

            alert(
                "Event banner uploaded successfully."
            );
        } catch (error) {
            console.error(
                "Banner Upload Error:",
                error
            );

            alert(
                error.message ||
                "Failed to upload event banner."
            );
        } finally {
            setUploadingBanner(false);
        }
    };

    // ================================
    // EVENT GALLERY
    // ================================

    const handleGalleryChange = (e) => {
        const selectedFiles = Array.from(e.target.files || []);

        if (!selectedFiles.length) return;

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        const maxSize = 20 * 1024 * 1024;
        const currentCount = eventGallery.length;
        const pendingCount = galleryFiles.length;

        if (currentCount + pendingCount + selectedFiles.length > 50) {
            alert("An event can have a maximum of 50 gallery images.");
            e.target.value = "";
            return;
        }

        for (const file of selectedFiles) {
            if (!allowedTypes.includes(file.type)) {
                alert(
                    `Invalid file: ${file.name}. Please select only JPG, PNG or WEBP images.`
                );
                e.target.value = "";
                return;
            }

            if (file.size > maxSize) {
                alert(
                    `Image "${file.name}" is larger than 20 MB.`
                );
                e.target.value = "";
                return;
            }
        }

        const newPreviews = selectedFiles.map((file) => ({
            name: file.name,
            url: URL.createObjectURL(file),
        }));

        setGalleryFiles((prev) => [...prev, ...selectedFiles]);
        setGalleryPreviews((prev) => [...prev, ...newPreviews]);

        e.target.value = "";
    };

    const removePendingGalleryFile = (index) => {
        setGalleryFiles((prev) => prev.filter((_, i) => i !== index));

        setGalleryPreviews((prev) => {
            const item = prev[index];

            if (item?.url) {
                URL.revokeObjectURL(item.url);
            }

            return prev.filter((_, i) => i !== index);
        });
    };

    const handleGalleryUpload = async () => {
        if (!editingEventId) {
            alert("Please create the event first.");
            return;
        }

        if (!galleryFiles.length) {
            alert("Please select one or more gallery images first.");
            return;
        }

        try {
            setUploadingGallery(true);

            await uploadEventGalleryImages(
                editingEventId,
                galleryFiles
            );

            const updatedEvent = await getAdminEventById(
                editingEventId
            );

            setEventGallery(
                Array.isArray(updatedEvent.event_images)
                    ? updatedEvent.event_images
                    : []
            );

            galleryPreviews.forEach((preview) => {
                if (preview?.url) {
                    URL.revokeObjectURL(preview.url);
                }
            });

            setGalleryFiles([]);
            setGalleryPreviews([]);

            await loadEvents();

            alert("Event gallery images uploaded successfully.");
        } catch (error) {
            console.error(
                "Gallery Upload Error:",
                error
            );

            alert(
                error.message ||
                "Failed to upload event gallery images."
            );
        } finally {
            setUploadingGallery(false);
        }
    };

    const handleGalleryUpdate = async (
        imageId,
        caption,
        sortOrder
    ) => {
        try {
            setUpdatingGalleryImageId(imageId);

            await updateEventGalleryImage(imageId, {
                caption: caption?.trim() || null,
                sort_order: Number(sortOrder) || 0,
            });

            setEventGallery((prev) =>
                prev.map((image) =>
                    image.id === imageId
                        ? {
                            ...image,
                            caption:
                                caption?.trim() || null,
                            sort_order:
                                Number(sortOrder) || 0,
                        }
                        : image
                )
            );
        } catch (error) {
            console.error(
                "Gallery Image Update Error:",
                error
            );

            alert(
                error.message ||
                "Failed to update gallery image."
            );
        } finally {
            setUpdatingGalleryImageId(null);
        }
    };

    const handleGalleryDelete = async (imageId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this gallery image?"
        );

        if (!confirmed) return;

        try {
            setDeletingGalleryImageId(imageId);

            await deleteEventGalleryImage(imageId);

            setEventGallery((prev) =>
                prev.filter((image) => image.id !== imageId)
            );

            await loadEvents();
        } catch (error) {
            console.error(
                "Gallery Image Delete Error:",
                error
            );

            alert(
                error.message ||
                "Failed to delete gallery image."
            );
        } finally {
            setDeletingGalleryImageId(null);
        }
    };

    // ================================
    // CREATE / UPDATE EVENT
    // ================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            alert("Event title is required.");
            return;
        }

        if (!formData.slug.trim()) {
            alert("Event slug is required.");
            return;
        }

        if (!formData.event_date) {
            alert("Event date is required.");
            return;
        }

        try {
            setSaving(true);

            const payload = {
                title: formData.title.trim(),

                slug: formData.slug.trim(),

                short_description:
                    formData.short_description.trim() ||
                    null,

                description:
                    formData.description.trim() ||
                    null,

                event_date: formData.event_date,

                start_time:
                    formData.start_time || null,

                end_time:
                    formData.end_time || null,

                venue:
                    formData.venue.trim() || null,

                status: formData.status,

                sort_order:
                    Number(formData.sort_order) || 0,
            };

            if (editingEventId) {
                await updateEvent(
                    editingEventId,
                    payload
                );

                alert(
                    "Event updated successfully."
                );
            } else {
                const createdEvent = await createEvent(payload);

                if (bannerFile && createdEvent.id) {
                    await uploadEventBanner(
                        createdEvent.id,
                        bannerFile
                    );
                }

                alert(
                    bannerFile
                        ? "Event and banner created successfully."
                        : "Event created successfully."
                );
            }

            setShowForm(false);
            resetForm();

            await loadEvents();
        } catch (error) {
            console.error(
                "Save Event Error:",
                error
            );

            alert(
                error.message ||
                "Failed to save event."
            );
        } finally {
            setSaving(false);
        }
    };

    // ================================
    // DELETE EVENT
    // ================================

    const handleDelete = async (id, title) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${title}"?`
        );

        if (!confirmed) return;

        try {
            await deleteEvent(id);

            await loadEvents();
        } catch (error) {
            console.error(
                "Delete Event Error:",
                error
            );

            alert(
                error.message ||
                "Failed to delete event."
            );
        }
    };

    return (
        <div className="admin-events-page">

            {/* ========================= */}
            {/* PAGE HEADER */}
            {/* ========================= */}

            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>
                    <h2 className="mb-1">
                        Events
                    </h2>

                    <p className="text-muted mb-0">
                        Manage school events and event information.
                    </p>
                </div>

                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={openAddForm}
                >
                    <i className="bi bi-plus-lg me-2"></i>
                    Add Event
                </button>

            </div>

            {/* ========================= */}
            {/* ERROR */}
            {/* ========================= */}

            {error && (
                <div
                    className="alert alert-danger"
                    role="alert"
                >
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                </div>
            )}

            {/* ========================= */}
            {/* LOADING */}
            {/* ========================= */}

            {loading ? (

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
                        Loading events...
                    </p>

                </div>

            ) : events.length === 0 ? (

                /* ========================= */
                /* EMPTY STATE */
                /* ========================= */

                <div className="card border-0 shadow-sm">

                    <div className="card-body text-center py-5">

                        <i
                            className="bi bi-calendar-event"
                            style={{
                                fontSize: "48px",
                                opacity: 0.5,
                            }}
                        ></i>

                        <h5 className="mt-3">
                            No Events Found
                        </h5>

                        <p className="text-muted mb-3">
                            No events have been added yet.
                        </p>

                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={openAddForm}
                        >
                            <i className="bi bi-plus-lg me-2"></i>
                            Add First Event
                        </button>

                    </div>

                </div>

            ) : (

                /* ========================= */
                /* EVENTS TABLE */
                /* ========================= */

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
                                            Image
                                        </th>

                                        <th>
                                            Event
                                        </th>

                                        <th>
                                            Date
                                        </th>

                                        <th>
                                            Venue
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

                                    {events.map(
                                        (event) => {

                                            const imageUrl =
                                                getAdminEventImageUrl(
                                                    event.image
                                                );

                                            return (
                                                <tr
                                                    key={
                                                        event.id
                                                    }
                                                >

                                                    {/* IMAGE */}

                                                    <td>

                                                        {imageUrl ? (

                                                            <img
                                                                src={
                                                                    imageUrl
                                                                }
                                                                alt={
                                                                    event.title
                                                                }
                                                                style={{
                                                                    width: "60px",
                                                                    height: "45px",
                                                                    objectFit:
                                                                        "cover",
                                                                    borderRadius:
                                                                        "6px",
                                                                }}
                                                            />

                                                        ) : (

                                                            <div
                                                                className="d-flex align-items-center justify-content-center bg-light"
                                                                style={{
                                                                    width: "60px",
                                                                    height: "45px",
                                                                    borderRadius:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <i className="bi bi-image text-muted"></i>
                                                            </div>

                                                        )}

                                                    </td>

                                                    {/* EVENT */}

                                                    <td>

                                                        <strong>
                                                            {
                                                                event.title
                                                            }
                                                        </strong>

                                                        <div className="small text-muted">
                                                            /
                                                            {
                                                                event.slug
                                                            }
                                                        </div>

                                                    </td>

                                                    {/* DATE */}

                                                    <td>

                                                        {event.event_date
                                                            ? new Date(
                                                                event.event_date
                                                            ).toLocaleDateString(
                                                                "en-IN",
                                                                {
                                                                    day: "2-digit",
                                                                    month: "short",
                                                                    year: "numeric",
                                                                }
                                                            )
                                                            : "-"}

                                                    </td>

                                                    {/* VENUE */}

                                                    <td>
                                                        {
                                                            event.venue ||
                                                            "-"
                                                        }
                                                    </td>

                                                    {/* STATUS */}

                                                    <td>

                                                        {event.status ===
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
                                                            title="Edit Event"
                                                            onClick={() =>
                                                                openEditForm(
                                                                    event.id
                                                                )
                                                            }
                                                        >
                                                            <i className="bi bi-pencil"></i>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-danger"
                                                            title="Delete Event"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    event.id,
                                                                    event.title
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

            {/* ========================= */}
            {/* ADD / EDIT MODAL */}
            {/* ========================= */}

            {showForm && (

                <div
                    className="modal d-block"
                    tabIndex="-1"
                    style={{
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        position: "fixed",
                        inset: 0,
                        overflowY: "auto",
                        padding: "20px 0",
                    }}
                >

                    <div
                        className="modal-dialog modal-lg"
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

                                    <i
                                        className={`bi ${editingEventId
                                            ? "bi-pencil-square"
                                            : "bi-calendar-plus"
                                            } me-2`}
                                    ></i>

                                    {editingEventId
                                        ? "Edit Event"
                                        : "Add New Event"}

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
                                        maxHeight: "calc(100vh - 180px)",
                                    }}
                                >

                                    <div className="row g-3">

                                        {/* TITLE */}

                                        <div className="col-md-8">

                                            <label className="form-label">
                                                Event Title
                                                <span className="text-danger">
                                                    {" "}*
                                                </span>
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
                                                placeholder="Annual Day"
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

                                                <option value="active">
                                                    Active
                                                </option>

                                                <option value="inactive">
                                                    Inactive
                                                </option>

                                            </select>

                                        </div>

                                        {/* SLUG */}

                                        <div className="col-12">

                                            <label className="form-label">
                                                Slug
                                                <span className="text-danger">
                                                    {" "}*
                                                </span>
                                            </label>

                                            <input
                                                type="text"
                                                name="slug"
                                                className="form-control"
                                                value={
                                                    formData.slug
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="annual-day-2026"
                                                required
                                            />

                                            <small className="text-muted">
                                                Used in the event URL.
                                            </small>

                                        </div>

                                        {/* EVENT BANNER */}

                                        {showForm && (
                                            <div className="col-12">

                                                <div className="border rounded p-3">

                                                    <div className="d-flex justify-content-between align-items-center mb-3">

                                                        <div>
                                                            <h6 className="mb-1">
                                                                <i className="bi bi-image me-2"></i>
                                                                Event Banner
                                                            </h6>

                                                            <small className="text-muted">
                                                                Upload the main image displayed for this event.
                                                            </small>
                                                        </div>

                                                    </div>

                                                    {/* Banner Preview */}

                                                    <div className="mb-3">

                                                        {bannerPreview ? (

                                                            <div
                                                                style={{
                                                                    width: "100%",
                                                                    maxHeight: "280px",
                                                                    overflow: "hidden",
                                                                    borderRadius: "10px",
                                                                    backgroundColor: "#f5f5f5",
                                                                }}
                                                            >
                                                                <img
                                                                    src={bannerPreview}
                                                                    alt="Event Banner Preview"
                                                                    style={{
                                                                        width: "100%",
                                                                        height: "280px",
                                                                        objectFit: "cover",
                                                                        display: "block",
                                                                    }}
                                                                />
                                                            </div>

                                                        ) : (

                                                            <div
                                                                className="d-flex flex-column align-items-center justify-content-center border rounded"
                                                                style={{
                                                                    height: "180px",
                                                                    backgroundColor: "#f8f9fa",
                                                                }}
                                                            >
                                                                <i
                                                                    className="bi bi-image text-muted"
                                                                    style={{
                                                                        fontSize: "42px",
                                                                    }}
                                                                ></i>

                                                                <span className="text-muted mt-2">
                                                                    No banner uploaded
                                                                </span>
                                                            </div>

                                                        )}

                                                    </div>

                                                    {/* File Selection */}

                                                    <div className="row g-2 align-items-end">

                                                        <div className="col-md-8">

                                                            <label className="form-label">
                                                                Choose New Banner
                                                            </label>

                                                            <input
                                                                type="file"
                                                                className="form-control"
                                                                accept="image/jpeg,image/png,image/webp"
                                                                onChange={
                                                                    handleBannerChange
                                                                }
                                                                disabled={
                                                                    uploadingBanner
                                                                }
                                                            />

                                                            <small className="text-muted">
                                                                JPG, PNG or WEBP · Maximum 20 MB
                                                            </small>

                                                            {!editingEventId && (
                                                                <small className="d-block text-primary mt-1">
                                                                    <i className="bi bi-info-circle me-1"></i>
                                                                    Banner will be uploaded automatically when the event is created.
                                                                </small>
                                                            )}

                                                        </div>

                                                        <div className="col-md-4">

                                                            <button
                                                                type="button"
                                                                className="btn btn-primary w-100"
                                                                onClick={handleBannerUpload}
                                                                disabled={
                                                                    !bannerFile ||
                                                                    uploadingBanner ||
                                                                    !editingEventId
                                                                }
                                                            >
                                                                {uploadingBanner ? (
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

                                                                        Upload Banner
                                                                    </>
                                                                )}
                                                            </button>

                                                        </div>

                                                    </div>

                                                </div>

                                            </div>
                                        )}

                                        {/* EVENT GALLERY */}

                                        <div className="col-12">
                                            <div className="border rounded p-3">
                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                    <div>
                                                        <h6 className="mb-1">
                                                            <i className="bi bi-images me-2"></i>
                                                            Event Gallery
                                                        </h6>
                                                        <small className="text-muted">
                                                            Add photos that will appear in the Gallery section of this event page.
                                                        </small>
                                                    </div>

                                                    <span className="badge bg-light text-dark border">
                                                        {eventGallery.length}/50 images
                                                    </span>
                                                </div>

                                                {!editingEventId && (
                                                    <div className="alert alert-info py-2 mb-3">
                                                        <i className="bi bi-info-circle me-2"></i>
                                                        Create the event first, then open Edit Event to upload gallery images.
                                                    </div>
                                                )}

                                                {/* Existing Gallery */}
                                                {eventGallery.length > 0 && (
                                                    <div className="row g-3 mb-3">
                                                        {eventGallery
                                                            .slice()
                                                            .sort(
                                                                (a, b) =>
                                                                    (a.sort_order ?? 0) -
                                                                    (b.sort_order ?? 0)
                                                            )
                                                            .map((image) => (
                                                                <div
                                                                    className="col-12 col-md-6"
                                                                    key={image.id}
                                                                >
                                                                    <div className="border rounded p-2 h-100">
                                                                        <div
                                                                            style={{
                                                                                position: "relative",
                                                                                width: "100%",
                                                                                height: "180px",
                                                                                overflow: "hidden",
                                                                                borderRadius: "8px",
                                                                                backgroundColor: "#f8f9fa",
                                                                            }}
                                                                        >
                                                                            <img
                                                                                src={getAdminEventImageUrl(
                                                                                    image.image
                                                                                )}
                                                                                alt={
                                                                                    image.caption ||
                                                                                    "Event gallery"
                                                                                }
                                                                                style={{
                                                                                    width: "100%",
                                                                                    height: "100%",
                                                                                    objectFit: "cover",
                                                                                    display: "block",
                                                                                }}
                                                                            />

                                                                            <button
                                                                                type="button"
                                                                                className="btn btn-sm btn-danger"
                                                                                title="Delete image"
                                                                                onClick={() =>
                                                                                    handleGalleryDelete(
                                                                                        image.id
                                                                                    )
                                                                                }
                                                                                disabled={
                                                                                    deletingGalleryImageId ===
                                                                                    image.id ||
                                                                                    uploadingGallery ||
                                                                                    saving
                                                                                }
                                                                                style={{
                                                                                    position: "absolute",
                                                                                    top: "8px",
                                                                                    right: "8px",
                                                                                }}
                                                                            >
                                                                                {deletingGalleryImageId ===
                                                                                    image.id ? (
                                                                                    <span
                                                                                        className="spinner-border spinner-border-sm"
                                                                                        role="status"
                                                                                    ></span>
                                                                                ) : (
                                                                                    <i className="bi bi-trash"></i>
                                                                                )}
                                                                            </button>
                                                                        </div>

                                                                        <div className="row g-2 mt-1">
                                                                            <div className="col-8">
                                                                                <label className="form-label small mb-1">
                                                                                    Caption
                                                                                </label>
                                                                                <input
                                                                                    type="text"
                                                                                    className="form-control form-control-sm"
                                                                                    defaultValue={
                                                                                        image.caption || ""
                                                                                    }
                                                                                    id={`gallery-caption-${image.id}`}
                                                                                    disabled={
                                                                                        updatingGalleryImageId ===
                                                                                        image.id ||
                                                                                        saving ||
                                                                                        uploadingGallery
                                                                                    }
                                                                                />
                                                                            </div>

                                                                            <div className="col-4">
                                                                                <label className="form-label small mb-1">
                                                                                    Order
                                                                                </label>
                                                                                <input
                                                                                    type="number"
                                                                                    className="form-control form-control-sm"
                                                                                    defaultValue={
                                                                                        image.sort_order ?? 0
                                                                                    }
                                                                                    id={`gallery-order-${image.id}`}
                                                                                    min="0"
                                                                                    disabled={
                                                                                        updatingGalleryImageId ===
                                                                                        image.id ||
                                                                                        saving ||
                                                                                        uploadingGallery
                                                                                    }
                                                                                />
                                                                            </div>

                                                                            <div className="col-12">
                                                                                <button
                                                                                    type="button"
                                                                                    className="btn btn-sm btn-outline-primary w-100"
                                                                                    disabled={
                                                                                        updatingGalleryImageId ===
                                                                                        image.id ||
                                                                                        saving ||
                                                                                        uploadingGallery
                                                                                    }
                                                                                    onClick={() => {
                                                                                        const caption =
                                                                                            document.getElementById(
                                                                                                `gallery-caption-${image.id}`
                                                                                            )?.value || "";

                                                                                        const sortOrder =
                                                                                            document.getElementById(
                                                                                                `gallery-order-${image.id}`
                                                                                            )?.value || 0;

                                                                                        handleGalleryUpdate(
                                                                                            image.id,
                                                                                            caption,
                                                                                            sortOrder
                                                                                        );
                                                                                    }}
                                                                                >
                                                                                    {updatingGalleryImageId ===
                                                                                        image.id ? (
                                                                                        <>
                                                                                            <span
                                                                                                className="spinner-border spinner-border-sm me-2"
                                                                                                role="status"
                                                                                            ></span>
                                                                                            Saving...
                                                                                        </>
                                                                                    ) : (
                                                                                        <>
                                                                                            <i className="bi bi-save me-2"></i>
                                                                                            Save Image Details
                                                                                        </>
                                                                                    )}
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                    </div>
                                                )}

                                                {/* Pending Upload Previews */}
                                                {galleryPreviews.length > 0 && (
                                                    <div className="mb-3">
                                                        <label className="form-label">
                                                            Selected Images
                                                        </label>

                                                        <div className="row g-2">
                                                            {galleryPreviews.map(
                                                                (preview, index) => (
                                                                    <div
                                                                        className="col-6 col-md-3"
                                                                        key={`${preview.name}-${index}`}
                                                                    >
                                                                        <div
                                                                            className="border rounded p-1 position-relative"
                                                                            style={{
                                                                                backgroundColor:
                                                                                    "#f8f9fa",
                                                                            }}
                                                                        >
                                                                            <img
                                                                                src={preview.url}
                                                                                alt={preview.name}
                                                                                style={{
                                                                                    width: "100%",
                                                                                    height: "100px",
                                                                                    objectFit: "cover",
                                                                                    borderRadius: "6px",
                                                                                }}
                                                                            />

                                                                            <button
                                                                                type="button"
                                                                                className="btn btn-sm btn-danger"
                                                                                title="Remove selected image"
                                                                                onClick={() =>
                                                                                    removePendingGalleryFile(
                                                                                        index
                                                                                    )
                                                                                }
                                                                                disabled={
                                                                                    uploadingGallery ||
                                                                                    saving
                                                                                }
                                                                                style={{
                                                                                    position:
                                                                                        "absolute",
                                                                                    top: "5px",
                                                                                    right: "5px",
                                                                                }}
                                                                            >
                                                                                <i className="bi bi-x-lg"></i>
                                                                            </button>

                                                                            <div
                                                                                className="small text-truncate mt-1 px-1"
                                                                                title={
                                                                                    preview.name
                                                                                }
                                                                            >
                                                                                {preview.name}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="row g-2 align-items-end">
                                                    <div className="col-md-8">
                                                        <label className="form-label">
                                                            Add Gallery Images
                                                        </label>

                                                        <input
                                                            type="file"
                                                            className="form-control"
                                                            accept="image/jpeg,image/png,image/webp"
                                                            multiple
                                                            onChange={
                                                                handleGalleryChange
                                                            }
                                                            disabled={
                                                                !editingEventId ||
                                                                uploadingGallery ||
                                                                saving ||
                                                                eventGallery.length +
                                                                galleryFiles.length >=
                                                                50
                                                            }
                                                        />

                                                        <small className="text-muted">
                                                            JPG, PNG or WEBP · Maximum 20 MB each · Up to 50 images per event
                                                        </small>
                                                    </div>

                                                    <div className="col-md-4">
                                                        <button
                                                            type="button"
                                                            className="btn btn-primary w-100"
                                                            onClick={
                                                                handleGalleryUpload
                                                            }
                                                            disabled={
                                                                !editingEventId ||
                                                                !galleryFiles.length ||
                                                                uploadingGallery ||
                                                                saving
                                                            }
                                                        >
                                                            {uploadingGallery ? (
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
                                                                    Upload Gallery
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* SHORT DESCRIPTION */}

                                        <div className="col-12">

                                            <label className="form-label">
                                                Short Description
                                            </label>

                                            <textarea
                                                name="short_description"
                                                className="form-control"
                                                rows="2"
                                                value={
                                                    formData.short_description
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="Brief description of the event..."
                                            ></textarea>

                                        </div>

                                        {/* DATE */}

                                        <div className="col-md-4">

                                            <label className="form-label">
                                                Event Date
                                                <span className="text-danger">
                                                    {" "}*
                                                </span>
                                            </label>

                                            <input
                                                type="date"
                                                name="event_date"
                                                className="form-control"
                                                value={
                                                    formData.event_date
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                required
                                            />

                                        </div>

                                        {/* START TIME */}

                                        <div className="col-md-4">

                                            <label className="form-label">
                                                Start Time
                                            </label>

                                            <input
                                                type="time"
                                                name="start_time"
                                                className="form-control"
                                                value={
                                                    formData.start_time
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                            />

                                        </div>

                                        {/* END TIME */}

                                        <div className="col-md-4">

                                            <label className="form-label">
                                                End Time
                                            </label>

                                            <input
                                                type="time"
                                                name="end_time"
                                                className="form-control"
                                                value={
                                                    formData.end_time
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                            />

                                        </div>

                                        {/* VENUE */}

                                        <div className="col-md-8">

                                            <label className="form-label">
                                                Venue
                                            </label>

                                            <input
                                                type="text"
                                                name="venue"
                                                className="form-control"
                                                value={
                                                    formData.venue
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="School Auditorium"
                                            />

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

                                        </div>

                                        {/* DESCRIPTION */}

                                        <div className="col-12">

                                            <label className="form-label">
                                                Full Description
                                            </label>

                                            <textarea
                                                name="description"
                                                className="form-control"
                                                rows="6"
                                                value={
                                                    formData.description
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="Write complete event details..."
                                            ></textarea>

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
                                                <span
                                                    className="spinner-border spinner-border-sm me-2"
                                                    role="status"
                                                ></span>

                                                {editingEventId
                                                    ? "Updating..."
                                                    : "Creating..."}
                                            </>

                                        ) : (

                                            <>
                                                <i
                                                    className={`bi ${editingEventId
                                                        ? "bi-check-lg"
                                                        : "bi-plus-lg"
                                                        } me-2`}
                                                ></i>

                                                {editingEventId
                                                    ? "Update Event"
                                                    : "Create Event"}

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

export default AdminEvents;