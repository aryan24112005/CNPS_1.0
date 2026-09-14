import React, { useEffect, useState } from "react";

import {
    getAdminGallery,
    uploadGalleryImages,
    updateGalleryImage,
    deleteGalleryImage,
    getAdminGalleryImageUrl,
} from "../services/galleryService";

const AdminGallery = () => {
    const [gallery, setGallery] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");

    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previews, setPreviews] = useState([]);

    const [caption, setCaption] = useState("");
    const [category, setCategory] = useState("");
    const [status, setStatus] = useState("active");
    const [sortOrder, setSortOrder] = useState(0);

    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({
        caption: "",
        category: "",
        status: "active",
        sort_order: 0,
    });

    // ===============================
    // LOAD GALLERY
    // ===============================
    const loadGallery = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getAdminGallery();
            setGallery(data);
        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to load gallery.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadGallery();
    }, []);

    // ===============================
    // FILE SELECT
    // ===============================
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files || []);

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        const maxSize = 20 * 1024 * 1024;

        const validFiles = files.filter((file) => {
            if (!allowedTypes.includes(file.type)) {
                alert(
                    `${file.name} is not a valid image. Use JPG, PNG or WEBP.`
                );
                return false;
            }

            if (file.size > maxSize) {
                alert(
                    `${file.name} is larger than 20MB.`
                );
                return false;
            }

            return true;
        });

        if (validFiles.length > 50) {
            alert("You can upload maximum 50 images at once.");
            validFiles.splice(50);
        }

        setSelectedFiles(validFiles);

        const previewUrls = validFiles.map((file) =>
            URL.createObjectURL(file)
        );

        setPreviews(previewUrls);
    };

    // ===============================
    // UPLOAD
    // ===============================
    const handleUpload = async (e) => {
        e.preventDefault();

        if (selectedFiles.length === 0) {
            alert("Please select at least one image.");
            return;
        }

        try {
            setUploading(true);
            setError("");

            await uploadGalleryImages({
                files: selectedFiles,
                caption,
                category,
                status,
                sort_order: sortOrder,
            });

            alert("Gallery images uploaded successfully.");

            setSelectedFiles([]);
            setPreviews([]);
            setCaption("");
            setCategory("");
            setStatus("active");
            setSortOrder(0);

            await loadGallery();
        } catch (err) {
            console.error(err);
            setError(
                err.message || "Failed to upload gallery images."
            );
        } finally {
            setUploading(false);
        }
    };

    // ===============================
    // START EDIT
    // ===============================
    const startEdit = (item) => {
        setEditingId(item.id);

        setEditData({
            caption: item.caption || "",
            category: item.category || "",
            status: item.status || "active",
            sort_order: item.sort_order || 0,
        });
    };

    // ===============================
    // CANCEL EDIT
    // ===============================
    const cancelEdit = () => {
        setEditingId(null);

        setEditData({
            caption: "",
            category: "",
            status: "active",
            sort_order: 0,
        });
    };

    // ===============================
    // SAVE EDIT
    // ===============================
    const handleSaveEdit = async (id) => {
        try {
            await updateGalleryImage(id, editData);

            alert("Gallery image updated successfully.");

            cancelEdit();
            await loadGallery();
        } catch (err) {
            console.error(err);

            alert(
                err.message || "Failed to update gallery image."
            );
        }
    };

    // ===============================
    // DELETE
    // ===============================
    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this gallery image?"
        );

        if (!confirmed) return;

        try {
            await deleteGalleryImage(id);

            alert("Gallery image deleted successfully.");

            await loadGallery();
        } catch (err) {
            console.error(err);

            alert(
                err.message || "Failed to delete gallery image."
            );
        }
    };

    // ===============================
    // UI
    // ===============================
    return (
        <div className="container-fluid py-4">

            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1">
                        Gallery Management
                    </h2>

                    <p className="text-muted mb-0">
                        Upload and manage school gallery images.
                    </p>
                </div>

                <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={loadGallery}
                    disabled={loading}
                >
                    <i className="bi bi-arrow-clockwise me-1"></i>
                    Refresh
                </button>
            </div>

            {/* ERROR */}
            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            {/* UPLOAD CARD */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">

                    <h5 className="fw-bold mb-3">
                        <i className="bi bi-cloud-arrow-up me-2"></i>
                        Upload Gallery Images
                    </h5>

                    <form onSubmit={handleUpload}>

                        {/* FILE */}
                        <div className="mb-3">
                            <label className="form-label fw-semibold">
                                Select Images
                            </label>

                            <input
                                type="file"
                                className="form-control"
                                accept="image/jpeg,image/png,image/webp"
                                multiple
                                onChange={handleFileChange}
                            />

                            <small className="text-muted">
                                JPG, PNG or WEBP • Maximum 20MB each •
                                Up to 50 images
                            </small>
                        </div>

                        {/* PREVIEWS */}
                        {previews.length > 0 && (
                            <div className="mb-4">

                                <label className="form-label fw-semibold">
                                    Preview ({previews.length})
                                </label>

                                <div className="row g-3">

                                    {previews.map((src, index) => (
                                        <div
                                            className="col-6 col-md-3 col-lg-2"
                                            key={src}
                                        >
                                            <div className="position-relative">
                                                <img
                                                    src={src}
                                                    alt={`Preview ${index + 1}`}
                                                    className="img-fluid rounded"
                                                    style={{
                                                        width: "100%",
                                                        height: "120px",
                                                        objectFit: "cover",
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}

                                </div>
                            </div>
                        )}

                        {/* FIELDS */}
                        <div className="row g-3">

                            <div className="col-md-6">
                                <label className="form-label fw-semibold">
                                    Caption
                                </label>

                                <input
                                    type="text"
                                    className="form-control"
                                    value={caption}
                                    onChange={(e) =>
                                        setCaption(e.target.value)
                                    }
                                    placeholder="e.g. Annual Function 2026"
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label fw-semibold">
                                    Gallery Category
                                    <span className="text-danger"> *</span>
                                </label>

                                <select
                                    className="form-select"
                                    value={category}
                                    onChange={(e) =>
                                        setCategory(e.target.value)
                                    }
                                    required
                                >
                                    <option value="">
                                        Select a category
                                    </option>
                                    <option value="academic">
                                        Academic Excellence
                                    </option>
                                    <option value="development">
                                        Holistic Development
                                    </option>
                                    <option value="campus">
                                        Safe &amp; Supportive Campus
                                    </option>
                                </select>

                                <small className="text-muted">
                                    Choose where these images should appear on the homepage.
                                </small>
                            </div>

                            <div className="col-md-4">
                                <label className="form-label fw-semibold">
                                    Status
                                </label>

                                <select
                                    className="form-select"
                                    value={status}
                                    onChange={(e) =>
                                        setStatus(e.target.value)
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

                            <div className="col-md-4">
                                <label className="form-label fw-semibold">
                                    Sort Order
                                </label>

                                <input
                                    type="number"
                                    className="form-control"
                                    value={sortOrder}
                                    onChange={(e) =>
                                        setSortOrder(e.target.value)
                                    }
                                    min="0"
                                />
                            </div>

                        </div>

                        <div className="mt-4">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={
                                    uploading ||
                                    selectedFiles.length === 0
                                }
                            >
                                {uploading ? (
                                    <>
                                        <span
                                            className="spinner-border spinner-border-sm me-2"
                                        ></span>
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-upload me-2"></i>
                                        Upload Images
                                    </>
                                )}
                            </button>
                        </div>

                    </form>
                </div>
            </div>

            {/* GALLERY LIST */}
            <div className="card border-0 shadow-sm">

                <div className="card-body p-4">

                    <div className="d-flex justify-content-between align-items-center mb-4">

                        <h5 className="fw-bold mb-0">
                            Gallery Images
                        </h5>

                        <span className="badge bg-primary">
                            {gallery.length} Images
                        </span>

                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <div
                                className="spinner-border text-primary"
                                role="status"
                            ></div>

                            <p className="text-muted mt-2 mb-0">
                                Loading gallery...
                            </p>
                        </div>
                    ) : gallery.length === 0 ? (
                        <div className="text-center py-5">

                            <i
                                className="bi bi-images"
                                style={{ fontSize: "3rem" }}
                            ></i>

                            <h5 className="mt-3">
                                No gallery images yet
                            </h5>

                            <p className="text-muted">
                                Upload your first gallery image above.
                            </p>

                        </div>
                    ) : (
                        <div className="row g-4">

                            {gallery.map((item) => (
                                <div
                                    className="col-sm-6 col-md-4 col-lg-3"
                                    key={item.id}
                                >

                                    <div className="card h-100 border shadow-sm">

                                        {/* IMAGE */}
                                        <div
                                            style={{
                                                height: "190px",
                                                overflow: "hidden",
                                            }}
                                        >
                                            <img
                                                src={getAdminGalleryImageUrl(
                                                    item.image
                                                )}
                                                alt={
                                                    item.caption ||
                                                    "Gallery image"
                                                }
                                                className="w-100 h-100"
                                                style={{
                                                    objectFit: "cover",
                                                }}
                                            />
                                        </div>

                                        <div className="card-body">

                                            {editingId === item.id ? (
                                                <>
                                                    <input
                                                        type="text"
                                                        className="form-control mb-2"
                                                        value={
                                                            editData.caption
                                                        }
                                                        onChange={(e) =>
                                                            setEditData({
                                                                ...editData,
                                                                caption:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        placeholder="Caption"
                                                    />

                                                    <select
                                                        className="form-select mb-2"
                                                        value={
                                                            editData.category
                                                        }
                                                        onChange={(e) =>
                                                            setEditData({
                                                                ...editData,
                                                                category:
                                                                    e.target.value,
                                                            })
                                                        }
                                                    >
                                                        <option value="">
                                                            Select category
                                                        </option>
                                                        <option value="academic">
                                                            Academic Excellence
                                                        </option>
                                                        <option value="development">
                                                            Holistic Development
                                                        </option>
                                                        <option value="campus">
                                                            Safe &amp; Supportive Campus
                                                        </option>
                                                    </select>

                                                    <select
                                                        className="form-select mb-2"
                                                        value={
                                                            editData.status
                                                        }
                                                        onChange={(e) =>
                                                            setEditData({
                                                                ...editData,
                                                                status:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                    >
                                                        <option value="active">
                                                            Active
                                                        </option>

                                                        <option value="inactive">
                                                            Inactive
                                                        </option>
                                                    </select>

                                                    <input
                                                        type="number"
                                                        className="form-control mb-3"
                                                        value={
                                                            editData.sort_order
                                                        }
                                                        onChange={(e) =>
                                                            setEditData({
                                                                ...editData,
                                                                sort_order:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        min="0"
                                                    />

                                                    <div className="d-flex gap-2">

                                                        <button
                                                            className="btn btn-sm btn-success"
                                                            onClick={() =>
                                                                handleSaveEdit(
                                                                    item.id
                                                                )
                                                            }
                                                        >
                                                            <i className="bi bi-check-lg me-1"></i>
                                                            Save
                                                        </button>

                                                        <button
                                                            className="btn btn-sm btn-secondary"
                                                            onClick={
                                                                cancelEdit
                                                            }
                                                        >
                                                            Cancel
                                                        </button>

                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <h6 className="fw-bold mb-1">
                                                        {item.caption ||
                                                            "Untitled Image"}
                                                    </h6>

                                                    <div className="small text-muted mb-2">
                                                        {item.category
                                                            ? (
                                                                item.category === "academic"
                                                                    ? "Academic Excellence"
                                                                    : item.category === "development"
                                                                        ? "Holistic Development"
                                                                        : item.category === "campus"
                                                                            ? "Safe & Supportive Campus"
                                                                            : item.category
                                                            )
                                                            : "No category"}
                                                    </div>

                                                    <div className="d-flex justify-content-between align-items-center">

                                                        <span
                                                            className={`badge ${item.status ===
                                                                "active"
                                                                ? "bg-success"
                                                                : "bg-secondary"
                                                                }`}
                                                        >
                                                            {item.status}
                                                        </span>

                                                        <small className="text-muted">
                                                            Order:{" "}
                                                            {
                                                                item.sort_order
                                                            }
                                                        </small>

                                                    </div>
                                                </>
                                            )}

                                        </div>

                                        {/* ACTIONS */}
                                        {editingId !== item.id && (
                                            <div className="card-footer bg-white border-0 pt-0 pb-3">

                                                <div className="d-flex gap-2">

                                                    <button
                                                        className="btn btn-sm btn-outline-primary flex-fill"
                                                        onClick={() =>
                                                            startEdit(item)
                                                        }
                                                    >
                                                        <i className="bi bi-pencil me-1"></i>
                                                        Edit
                                                    </button>

                                                    <button
                                                        className="btn btn-sm btn-outline-danger flex-fill"
                                                        onClick={() =>
                                                            handleDelete(
                                                                item.id
                                                            )
                                                        }
                                                    >
                                                        <i className="bi bi-trash me-1"></i>
                                                        Delete
                                                    </button>

                                                </div>

                                            </div>
                                        )}

                                    </div>

                                </div>
                            ))}

                        </div>
                    )}

                </div>
            </div>

        </div>
    );
};

export default AdminGallery;