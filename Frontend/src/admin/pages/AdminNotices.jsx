import { useEffect, useState } from "react";
import {
    getAdminNotices,
    createNotice,
    updateNotice,
    deleteNotice,
    uploadNoticeFile,
    getAdminNoticeFileUrl,
} from "../services/adminNoticeService";

const emptyForm = {
    title: "",
    slug: "",
    type: "text",
    content: "",
    video_url: "",
    notice_date: new Date().toISOString().split("T")[0],
    status: "active",
    sort_order: 0,
};

function AdminNotices() {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);

    const [selectedFile, setSelectedFile] = useState(null);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    // ---------------------------------------
    // Load Notices
    // ---------------------------------------
    const loadNotices = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getAdminNotices();
            setNotices(data);
        } catch (err) {
            setError(err.message || "Failed to load notices.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotices();
    }, []);

    // ---------------------------------------
    // Form helpers
    // ---------------------------------------
    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const generateSlug = (title) => {
        const base = title
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");

        // Append short timestamp to guarantee uniqueness
        const suffix = Date.now().toString(36);

        return `${base}-${suffix}`;
    };

    const handleTitleChange = (e) => {
        const title = e.target.value;

        setForm((prev) => ({
            ...prev,
            title,
            slug:
                editingId
                    ? prev.slug
                    : generateSlug(title),
        }));
    };

    // ---------------------------------------
    // Open Create Form
    // ---------------------------------------
    const openCreateForm = () => {
        setEditingId(null);
        setForm({
            ...emptyForm,
            notice_date: new Date().toISOString().split("T")[0],
        });
        setSelectedFile(null);
        setError("");
        setShowForm(true);
    };

    // ---------------------------------------
    // Open Edit Form
    // ---------------------------------------
    const openEditForm = (notice) => {
        setEditingId(notice.id);

        setForm({
            title: notice.title || "",
            slug: notice.slug || "",
            type: notice.type || "text",
            content: notice.content || "",
            video_url: notice.video_url || "",
            notice_date: notice.notice_date
                ? String(notice.notice_date).slice(0, 10)
                : "",
            status: notice.status || "active",
            sort_order: notice.sort_order || 0,
        });

        setSelectedFile(null);
        setError("");
        setShowForm(true);
    };

    // ---------------------------------------
    // Close Form
    // ---------------------------------------
    const closeForm = () => {
        if (saving || uploading) return;

        setShowForm(false);
        setEditingId(null);
        setForm(emptyForm);
        setSelectedFile(null);
    };

    // ---------------------------------------
    // File selection
    // ---------------------------------------
    const handleFileChange = (e) => {
        const file = e.target.files?.[0] || null;
        setSelectedFile(file);
    };

    // ---------------------------------------
    // Submit Notice
    // ---------------------------------------
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");

            if (!form.title.trim()) {
                throw new Error("Notice title is required.");
            }

            if (!form.slug.trim()) {
                throw new Error("Notice slug is required.");
            }

            if (!form.notice_date) {
                throw new Error("Notice date is required.");
            }

            if (form.type === "video" && !form.video_url.trim()) {
                throw new Error("Video URL is required.");
            }

            const payload = {
                title: form.title.trim(),
                slug: form.slug.trim(),
                type: form.type,
                content:
                    form.type === "text" || form.type === "image"
                        ? form.content
                        : null,
                video_url:
                    form.type === "video"
                        ? form.video_url.trim()
                        : null,
                notice_date: form.notice_date,
                status: form.status,
                sort_order: Number(form.sort_order) || 0,
            };

            let savedNotice;

            if (editingId) {
                savedNotice = await updateNotice(editingId, payload);
            } else {
                savedNotice = await createNotice(payload);
            }

            // ---------------------------------------
            // Upload image/PDF after notice creation
            // ---------------------------------------
            if (
                selectedFile &&
                (form.type === "image" || form.type === "pdf")
            ) {
                const noticeId = editingId || savedNotice?.id;

                if (!noticeId) {
                    throw new Error(
                        "Notice saved, but notice ID was not returned for file upload."
                    );
                }

                setUploading(true);

                await uploadNoticeFile(noticeId, selectedFile);
            }

            setShowForm(false);
            setEditingId(null);
            setForm(emptyForm);
            setSelectedFile(null);

            await loadNotices();
        } catch (err) {
            setError(err.message || "Failed to save notice.");
        } finally {
            setSaving(false);
            setUploading(false);
        }
    };

    // ---------------------------------------
    // Delete Notice
    // ---------------------------------------
    const handleDelete = async (notice) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${notice.title}"?`
        );

        if (!confirmed) return;

        try {
            setError("");

            await deleteNotice(notice.id);

            await loadNotices();
        } catch (err) {
            setError(err.message || "Failed to delete notice.");
        }
    };

    // ---------------------------------------
    // Type Icon
    // ---------------------------------------
    const getTypeIcon = (type) => {
        switch (type) {
            case "image":
                return "bi bi-image";

            case "pdf":
                return "bi bi-file-earmark-pdf";

            case "video":
                return "bi bi-play-circle";

            default:
                return "bi bi-file-text";
        }
    };

    // ---------------------------------------
    // Type Badge
    // ---------------------------------------
    const getTypeBadge = (type) => {
        switch (type) {
            case "image":
                return "bg-success";

            case "pdf":
                return "bg-danger";

            case "video":
                return "bg-primary";

            default:
                return "bg-secondary";
        }
    };

    // ---------------------------------------
    // Loading
    // ---------------------------------------
    if (loading) {
        return (
            <div className="container-fluid py-4">
                <div className="text-center py-5">
                    <div
                        className="spinner-border"
                        role="status"
                    >
                        <span className="visually-hidden">
                            Loading...
                        </span>
                    </div>

                    <p className="mt-3 mb-0">
                        Loading notices...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid py-4">

            {/* --------------------------------------- */}
            {/* Page Header */}
            {/* --------------------------------------- */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h3 mb-1">
                        Notice Management
                    </h1>

                    <p className="text-muted mb-0">
                        Manage website notices and announcements.
                    </p>
                </div>

                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={openCreateForm}
                >
                    <i className="bi bi-plus-lg me-2"></i>
                    Add Notice
                </button>
            </div>

            {/* --------------------------------------- */}
            {/* Error */}
            {/* --------------------------------------- */}
            {error && (
                <div
                    className="alert alert-danger d-flex align-items-center justify-content-between"
                    role="alert"
                >
                    <div>
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        {error}
                    </div>

                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => setError("")}
                    ></button>
                </div>
            )}

            {/* --------------------------------------- */}
            {/* Notices Table */}
            {/* --------------------------------------- */}
            <div className="card border-0 shadow-sm">
                <div className="card-body p-0">

                    {notices.length === 0 ? (
                        <div className="text-center py-5">
                            <i
                                className="bi bi-megaphone display-4 text-muted"
                            ></i>

                            <h5 className="mt-3">
                                No notices found
                            </h5>

                            <p className="text-muted">
                                Create your first website notice.
                            </p>

                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={openCreateForm}
                            >
                                <i className="bi bi-plus-lg me-2"></i>
                                Add Notice
                            </button>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th style={{ width: "60px" }}>
                                            #
                                        </th>

                                        <th>
                                            Notice
                                        </th>

                                        <th>
                                            Type
                                        </th>

                                        <th>
                                            Date
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
                                    {notices.map((notice, index) => (
                                        <tr key={notice.id}>

                                            <td>
                                                {index + 1}
                                            </td>

                                            <td>
                                                <div className="fw-semibold">
                                                    {notice.title}
                                                </div>

                                                <small className="text-muted">
                                                    /notice/
                                                    {notice.slug}
                                                </small>
                                            </td>

                                            <td>
                                                <span
                                                    className={`badge ${getTypeBadge(
                                                        notice.type
                                                    )}`}
                                                >
                                                    <i
                                                        className={`${getTypeIcon(
                                                            notice.type
                                                        )} me-1`}
                                                    ></i>

                                                    {notice.type}
                                                </span>
                                            </td>

                                            <td>
                                                {notice.notice_date
                                                    ? new Date(
                                                        notice.notice_date
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

                                            <td>
                                                {notice.status ===
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
                                                <div className="btn-group">
                                                    {(notice.file_path ||
                                                        notice.video_url) && (
                                                            <a
                                                                href={
                                                                    notice.video_url ||
                                                                    getAdminNoticeFileUrl(
                                                                        notice.file_path
                                                                    )
                                                                }
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="btn btn-sm btn-outline-secondary"
                                                                title="View"
                                                            >
                                                                <i className="bi bi-eye"></i>
                                                            </a>
                                                        )}

                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() =>
                                                            openEditForm(
                                                                notice
                                                            )
                                                        }
                                                        title="Edit"
                                                    >
                                                        <i className="bi bi-pencil"></i>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() =>
                                                            handleDelete(
                                                                notice
                                                            )
                                                        }
                                                        title="Delete"
                                                    >
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* --------------------------------------- */}
            {/* Add / Edit Modal */}
            {/* --------------------------------------- */}
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
                                        className={`bi ${editingId
                                                ? "bi-pencil-square"
                                                : "bi-megaphone"
                                            } me-2`}
                                    ></i>

                                    {editingId
                                        ? "Edit Notice"
                                        : "Add New Notice"}
                                </h5>

                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={closeForm}
                                    disabled={saving || uploading}
                                ></button>
                            </div>

                            {/* FORM */}
                            <form onSubmit={handleSubmit}>
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
                                                Notice Title
                                                <span className="text-danger">
                                                    {" "}*
                                                </span>
                                            </label>

                                            <input
                                                type="text"
                                                name="title"
                                                className="form-control"
                                                value={form.title}
                                                onChange={handleTitleChange}
                                                placeholder="Enter notice title"
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
                                                value={form.slug}
                                                onChange={handleChange}
                                                placeholder="annual-day-notice"
                                                required
                                            />

                                            <small className="text-muted">
                                                Used in the notice URL.
                                            </small>
                                        </div>

                                        {/* TYPE */}
                                        <div className="col-md-6">
                                            <label className="form-label">
                                                Notice Type
                                                <span className="text-danger">
                                                    {" "}*
                                                </span>
                                            </label>

                                            <select
                                                name="type"
                                                className="form-select"
                                                value={form.type}
                                                onChange={(e) => {
                                                    handleChange(e);
                                                    setSelectedFile(null);
                                                }}
                                            >
                                                <option value="text">
                                                    Text
                                                </option>

                                                <option value="image">
                                                    Image
                                                </option>

                                                <option value="pdf">
                                                    PDF
                                                </option>

                                                <option value="video">
                                                    Video
                                                </option>
                                            </select>
                                        </div>

                                        {/* DATE */}
                                        <div className="col-md-6">
                                            <label className="form-label">
                                                Notice Date
                                                <span className="text-danger">
                                                    {" "}*
                                                </span>
                                            </label>

                                            <input
                                                type="date"
                                                name="notice_date"
                                                className="form-control"
                                                value={form.notice_date}
                                                onChange={handleChange}
                                                required
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
                                                value={form.sort_order}
                                                onChange={handleChange}
                                                min="0"
                                            />

                                            <small className="text-muted">
                                                Lower number appears first.
                                            </small>
                                        </div>

                                        {/* CONTENT */}
                                        {(form.type === "text" ||
                                            form.type === "image") && (
                                                <div className="col-12">
                                                    <label className="form-label">
                                                        Notice Content
                                                    </label>

                                                    <textarea
                                                        name="content"
                                                        className="form-control"
                                                        rows="5"
                                                        value={form.content}
                                                        onChange={handleChange}
                                                        placeholder="Write notice content..."
                                                    ></textarea>
                                                </div>
                                            )}

                                        {/* IMAGE / PDF UPLOAD */}
                                        {(form.type === "image" ||
                                            form.type === "pdf") && (
                                                <div className="col-12">
                                                    <div className="border rounded p-3">

                                                        <div className="mb-3">
                                                            <h6 className="mb-1">
                                                                <i
                                                                    className={`bi ${form.type ===
                                                                            "image"
                                                                            ? "bi-image"
                                                                            : "bi-file-earmark-pdf"
                                                                        } me-2`}
                                                                ></i>

                                                                {form.type === "image"
                                                                    ? "Notice Image"
                                                                    : "Notice PDF"}
                                                            </h6>

                                                            <small className="text-muted">
                                                                Upload the file that will
                                                                be displayed on the notice
                                                                details page.
                                                            </small>
                                                        </div>

                                                        {/* EXISTING FILE */}
                                                        {editingId &&
                                                            !selectedFile &&
                                                            notices.find(
                                                                (n) =>
                                                                    n.id === editingId
                                                            )?.file_path && (
                                                                <div className="alert alert-light border mb-3">
                                                                    <i className="bi bi-file-earmark me-2"></i>

                                                                    Current file is already
                                                                    uploaded.

                                                                    <a
                                                                        href={getAdminNoticeFileUrl(
                                                                            notices.find(
                                                                                (n) =>
                                                                                    n.id ===
                                                                                    editingId
                                                                            )?.file_path
                                                                        )}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="ms-2"
                                                                    >
                                                                        View Current File
                                                                    </a>
                                                                </div>
                                                            )}

                                                        {/* FILE INPUT */}
                                                        <div className="row g-2 align-items-end">
                                                            <div className="col-md-8">
                                                                <label className="form-label">
                                                                    Choose File
                                                                </label>

                                                                <input
                                                                    type="file"
                                                                    className="form-control"
                                                                    accept={
                                                                        form.type ===
                                                                            "image"
                                                                            ? "image/jpeg,image/png,image/webp"
                                                                            : "application/pdf"
                                                                    }
                                                                    onChange={
                                                                        handleFileChange
                                                                    }
                                                                    disabled={
                                                                        saving ||
                                                                        uploading
                                                                    }
                                                                />

                                                                <small className="text-muted">
                                                                    {form.type === "image"
                                                                        ? "JPG, PNG or WEBP"
                                                                        : "PDF"}{" "}
                                                                    · Maximum 20 MB
                                                                </small>
                                                            </div>

                                                            {/* SELECTED FILE */}
                                                            {selectedFile && (
                                                                <div className="col-md-4">
                                                                    <div className="alert alert-info py-2 mb-0 text-truncate">
                                                                        <i className="bi bi-paperclip me-2"></i>
                                                                        {selectedFile.name}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* IMAGE PREVIEW */}
                                                        {form.type === "image" &&
                                                            selectedFile && (
                                                                <div className="mt-3">
                                                                    <label className="form-label">
                                                                        Image Preview
                                                                    </label>

                                                                    <div
                                                                        className="border rounded p-2"
                                                                        style={{
                                                                            backgroundColor:
                                                                                "#f8f9fa",
                                                                        }}
                                                                    >
                                                                        <img
                                                                            src={URL.createObjectURL(
                                                                                selectedFile
                                                                            )}
                                                                            alt="Notice Preview"
                                                                            style={{
                                                                                width: "100%",
                                                                                maxHeight:
                                                                                    "250px",
                                                                                objectFit:
                                                                                    "contain",
                                                                                display:
                                                                                    "block",
                                                                                borderRadius:
                                                                                    "6px",
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}
                                                    </div>
                                                </div>
                                            )}

                                        {/* VIDEO URL */}
                                        {form.type === "video" && (
                                            <div className="col-12">
                                                <div className="border rounded p-3">

                                                    <h6 className="mb-3">
                                                        <i className="bi bi-play-circle me-2"></i>
                                                        Video
                                                    </h6>

                                                    <label className="form-label">
                                                        Video URL
                                                        <span className="text-danger">
                                                            {" "}*
                                                        </span>
                                                    </label>

                                                    <input
                                                        type="url"
                                                        name="video_url"
                                                        className="form-control"
                                                        value={form.video_url}
                                                        onChange={handleChange}
                                                        placeholder="https://www.youtube.com/embed/..."
                                                        required
                                                    />

                                                    <small className="text-muted">
                                                        Use an embeddable YouTube or
                                                        video URL.
                                                    </small>
                                                </div>
                                            </div>
                                        )}

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
                                        disabled={saving || uploading}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={saving || uploading}
                                    >
                                        {saving || uploading ? (
                                            <>
                                                <span
                                                    className="spinner-border spinner-border-sm me-2"
                                                    role="status"
                                                ></span>

                                                {uploading
                                                    ? "Uploading..."
                                                    : editingId
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
                                                    ? "Update Notice"
                                                    : "Create Notice"}
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

export default AdminNotices;