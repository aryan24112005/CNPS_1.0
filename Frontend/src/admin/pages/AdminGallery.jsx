import React, { useEffect, useState } from "react";

import {
    // Why Us gallery
    getAdminGallery,
    uploadGalleryImages,
    updateGalleryImage,
    deleteGalleryImage,
    getAdminGalleryImageUrl,
    // Albums
    getAdminAlbums,
    createAdminAlbum,
    updateAdminAlbum,
    deleteAdminAlbum,
    getAdminAlbumImages,
    uploadAlbumImages,
    deleteAdminAlbumImage,
} from "../services/galleryService";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

const getImageUrl = (img) => {
    if (!img) return "";
    if (img.startsWith("http://") || img.startsWith("https://")) return img;
    if (img.startsWith("/uploads/")) return `${API_ORIGIN}${img}`;
    return `${API_ORIGIN}/${img}`;
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const AdminGallery = () => {
    const [activeTab, setActiveTab] = useState("albums");

    return (
        <div className="container-fluid py-4">

            <div className="mb-4">
                <h2 className="fw-bold mb-1">Gallery Management</h2>
                <p className="text-muted mb-0">
                    Manage photo albums and Why Us section images.
                </p>
            </div>

            {/* TABS */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-2">
                    <div className="nav nav-pills gap-2">
                        <button
                            type="button"
                            className={`btn ${activeTab === "albums" ? "btn-primary" : "btn-light"}`}
                            onClick={() => setActiveTab("albums")}
                        >
                            <i className="bi bi-images me-2"></i>
                            Photo Albums
                        </button>

                        <button
                            type="button"
                            className={`btn ${activeTab === "whyus" ? "btn-primary" : "btn-light"}`}
                            onClick={() => setActiveTab("whyus")}
                        >
                            <i className="bi bi-grid me-2"></i>
                            Why Us Images
                        </button>
                    </div>
                </div>
            </div>

            {activeTab === "albums" && <AlbumsTab />}
            {activeTab === "whyus" && <WhyUsTab />}

        </div>
    );
};


// ============================================================
// PHOTO ALBUMS TAB
// ============================================================

const AlbumsTab = () => {
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Album form
    const [showAlbumForm, setShowAlbumForm] = useState(false);
    const [editingAlbumId, setEditingAlbumId] = useState(null);
    const [albumForm, setAlbumForm] = useState({ title: "", description: "", status: "active", sort_order: 0 });
    const [savingAlbum, setSavingAlbum] = useState(false);

    // Upload form
    const [selectedAlbumId, setSelectedAlbumId] = useState("");
    const [uploadFiles, setUploadFiles] = useState([]);
    const [uploadPreviews, setUploadPreviews] = useState([]);
    const [uploading, setUploading] = useState(false);

    // Viewing album images
    const [viewingAlbum, setViewingAlbum] = useState(null);
    const [albumImages, setAlbumImages] = useState([]);
    const [imagesLoading, setImagesLoading] = useState(false);

    const loadAlbums = async () => {
        try {
            setLoading(true);
            setError("");
            const data = await getAdminAlbums();
            setAlbums(data);
        } catch (err) {
            setError(err.message || "Failed to load albums.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadAlbums(); }, []);

    // ---- Album form ----

    const openCreateAlbum = () => {
        setEditingAlbumId(null);
        setAlbumForm({ title: "", description: "", status: "active", sort_order: 0 });
        setShowAlbumForm(true);
    };

    const openEditAlbum = (album) => {
        setEditingAlbumId(album.id);
        setAlbumForm({
            title: album.title || "",
            description: album.description || "",
            status: album.status || "active",
            sort_order: album.sort_order ?? 0,
        });
        setShowAlbumForm(true);
    };

    const closeAlbumForm = () => {
        setShowAlbumForm(false);
        setEditingAlbumId(null);
    };

    const handleAlbumSubmit = async (e) => {
        e.preventDefault();
        if (!albumForm.title.trim()) { alert("Album title is required."); return; }
        try {
            setSavingAlbum(true);
            if (editingAlbumId) {
                await updateAdminAlbum(editingAlbumId, albumForm);
                alert("Album updated successfully.");
            } else {
                await createAdminAlbum(albumForm);
                alert("Album created successfully.");
            }
            closeAlbumForm();
            await loadAlbums();
        } catch (err) {
            alert(err.message || "Failed to save album.");
        } finally {
            setSavingAlbum(false);
        }
    };

    const handleDeleteAlbum = async (album) => {
        if (!window.confirm(`Delete album "${album.title}" and ALL its images? This cannot be undone.`)) return;
        try {
            await deleteAdminAlbum(album.id);
            if (viewingAlbum?.id === album.id) setViewingAlbum(null);
            await loadAlbums();
            alert("Album deleted.");
        } catch (err) {
            alert(err.message || "Failed to delete album.");
        }
    };

    // ---- View album images ----

    const viewAlbum = async (album) => {
        setViewingAlbum(album);
        setImagesLoading(true);
        try {
            const data = await getAdminAlbumImages(album.id);
            setAlbumImages(data);
        } catch (err) {
            alert(err.message || "Failed to load album images.");
        } finally {
            setImagesLoading(false);
        }
    };

    const handleDeleteAlbumImage = async (imageId) => {
        if (!window.confirm("Delete this image?")) return;
        try {
            await deleteAdminAlbumImage(imageId);
            setAlbumImages((prev) => prev.filter((img) => img.id !== imageId));
            await loadAlbums(); // refresh counts
        } catch (err) {
            alert(err.message || "Failed to delete image.");
        }
    };

    // ---- Upload to album ----

    const handleUploadFileChange = (e) => {
        const files = Array.from(e.target.files || []);
        const allowed = ["image/jpeg", "image/png", "image/webp"];
        const valid = files.filter((f) => {
            if (!allowed.includes(f.type)) { alert(`${f.name}: only JPG, PNG, WEBP allowed.`); return false; }
            if (f.size > 20 * 1024 * 1024) { alert(`${f.name}: max 20MB.`); return false; }
            return true;
        });
        setUploadFiles(valid);
        setUploadPreviews(valid.map((f) => URL.createObjectURL(f)));
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!selectedAlbumId) { alert("Please select an album."); return; }
        if (uploadFiles.length === 0) { alert("Please select at least one image."); return; }
        try {
            setUploading(true);
            await uploadAlbumImages(selectedAlbumId, uploadFiles);
            alert(`${uploadFiles.length} image(s) uploaded to album.`);
            setUploadFiles([]);
            setUploadPreviews([]);
            if (viewingAlbum?.id === Number(selectedAlbumId)) {
                await viewAlbum(viewingAlbum);
            }
            await loadAlbums();
        } catch (err) {
            alert(err.message || "Upload failed.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div>

            {/* ERROR */}
            {error && <div className="alert alert-danger">{error}</div>}

            {/* UPLOAD CARD */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                    <h5 className="fw-bold mb-3">
                        <i className="bi bi-cloud-arrow-up me-2"></i>
                        Upload Images to Album
                    </h5>

                    <form onSubmit={handleUpload}>
                        <div className="row g-3 mb-3">

                            {/* ALBUM DROPDOWN */}
                            <div className="col-md-5">
                                <label className="form-label fw-semibold">
                                    Select Album <span className="text-danger">*</span>
                                </label>

                                {albums.length === 0 ? (
                                    <div className="alert alert-warning py-2 mb-0">
                                        No albums yet. Create an album first.
                                    </div>
                                ) : (
                                    <select
                                        className="form-select"
                                        value={selectedAlbumId}
                                        onChange={(e) => setSelectedAlbumId(e.target.value)}
                                        required
                                    >
                                        <option value="">— Choose album —</option>
                                        {albums.map((album) => (
                                            <option key={album.id} value={album.id}>
                                                {album.title} ({album.image_count ?? 0} images)
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {/* FILE INPUT */}
                            <div className="col-md-7">
                                <label className="form-label fw-semibold">
                                    Select Images <span className="text-danger">*</span>
                                </label>

                                <input
                                    type="file"
                                    className="form-control"
                                    accept="image/jpeg,image/png,image/webp"
                                    multiple
                                    onChange={handleUploadFileChange}
                                />

                                <small className="text-muted">
                                    JPG, PNG or WEBP · Max 20MB each · Up to 50 images
                                </small>
                            </div>

                        </div>

                        {/* PREVIEWS */}
                        {uploadPreviews.length > 0 && (
                            <div className="row g-2 mb-3">
                                {uploadPreviews.map((src, i) => (
                                    <div className="col-4 col-sm-3 col-md-2" key={i}>
                                        <img
                                            src={src}
                                            alt={`Preview ${i + 1}`}
                                            className="img-fluid rounded"
                                            style={{ height: "90px", width: "100%", objectFit: "cover" }}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={uploading || uploadFiles.length === 0 || !selectedAlbumId}
                        >
                            {uploading ? (
                                <><span className="spinner-border spinner-border-sm me-2"></span>Uploading...</>
                            ) : (
                                <><i className="bi bi-upload me-2"></i>Upload to Album</>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* ALBUMS LIST */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">

                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h5 className="fw-bold mb-0">
                            All Albums
                            <span className="badge bg-primary ms-2">{albums.length}</span>
                        </h5>

                        <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={openCreateAlbum}
                        >
                            <i className="bi bi-plus-lg me-1"></i>
                            New Album
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-center py-4">
                            <div className="spinner-border text-primary" role="status"></div>
                        </div>
                    ) : albums.length === 0 ? (
                        <div className="text-center py-4 text-muted">
                            <i className="bi bi-collection" style={{ fontSize: "2.5rem" }}></i>
                            <p className="mt-2 mb-0">No albums yet. Create one to get started.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Album</th>
                                        <th>Images</th>
                                        <th>Status</th>
                                        <th>Order</th>
                                        <th className="text-end">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {albums.map((album) => (
                                        <tr key={album.id}>
                                            <td>
                                                <strong>{album.title}</strong>
                                                {album.description && (
                                                    <div className="small text-muted">{album.description}</div>
                                                )}
                                            </td>
                                            <td>
                                                <span className="badge bg-light text-dark border">
                                                    {album.image_count ?? 0} images
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${album.status === "active" ? "bg-success" : "bg-secondary"}`}>
                                                    {album.status}
                                                </span>
                                            </td>
                                            <td>{album.sort_order}</td>
                                            <td className="text-end">
                                                <button
                                                    className="btn btn-sm btn-outline-info me-1"
                                                    onClick={() => viewAlbum(album)}
                                                    title="View Images"
                                                >
                                                    <i className="bi bi-eye"></i>
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-primary me-1"
                                                    onClick={() => openEditAlbum(album)}
                                                    title="Edit Album"
                                                >
                                                    <i className="bi bi-pencil"></i>
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleDeleteAlbum(album)}
                                                    title="Delete Album"
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

            {/* VIEW ALBUM IMAGES */}
            {viewingAlbum && (
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="fw-bold mb-0">
                                <i className="bi bi-images me-2"></i>
                                {viewingAlbum.title}
                                <span className="badge bg-secondary ms-2">{albumImages.length} images</span>
                            </h5>
                            <button
                                className="btn btn-sm btn-light"
                                onClick={() => setViewingAlbum(null)}
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>

                        {imagesLoading ? (
                            <div className="text-center py-4">
                                <div className="spinner-border text-primary" role="status"></div>
                            </div>
                        ) : albumImages.length === 0 ? (
                            <p className="text-muted mb-0">No images in this album yet. Upload some above.</p>
                        ) : (
                            <div className="row g-3">
                                {albumImages.map((img) => (
                                    <div className="col-6 col-md-3 col-lg-2" key={img.id}>
                                        <div className="position-relative rounded overflow-hidden border" style={{ height: "130px" }}>
                                            <img
                                                src={getImageUrl(img.image)}
                                                alt="Album image"
                                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                            />
                                            <button
                                                className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 p-1 lh-1"
                                                style={{ fontSize: "11px" }}
                                                onClick={() => handleDeleteAlbumImage(img.id)}
                                                title="Delete image"
                                            >
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ALBUM FORM MODAL */}
            {showAlbumForm && (
                <div
                    className="modal d-block"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)", position: "fixed", inset: 0, overflowY: "auto", padding: "20px 0", zIndex: 1050 }}
                >
                    <div className="modal-dialog modal-md" style={{ margin: "0 auto" }}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="bi bi-collection me-2"></i>
                                    {editingAlbumId ? "Edit Album" : "Create New Album"}
                                </h5>
                                <button className="btn-close" onClick={closeAlbumForm} disabled={savingAlbum}></button>
                            </div>

                            <form onSubmit={handleAlbumSubmit}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">
                                            Album Title <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={albumForm.title}
                                            onChange={(e) => setAlbumForm({ ...albumForm, title: e.target.value })}
                                            placeholder="e.g. Annual Day 2026"
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Description</label>
                                        <textarea
                                            className="form-control"
                                            rows="2"
                                            value={albumForm.description}
                                            onChange={(e) => setAlbumForm({ ...albumForm, description: e.target.value })}
                                            placeholder="Short description (optional)"
                                        ></textarea>
                                    </div>

                                    <div className="row g-3">
                                        <div className="col-6">
                                            <label className="form-label fw-semibold">Status</label>
                                            <select
                                                className="form-select"
                                                value={albumForm.status}
                                                onChange={(e) => setAlbumForm({ ...albumForm, status: e.target.value })}
                                            >
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
                                            </select>
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label fw-semibold">Sort Order</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={albumForm.sort_order}
                                                onChange={(e) => setAlbumForm({ ...albumForm, sort_order: e.target.value })}
                                                min="0"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={closeAlbumForm} disabled={savingAlbum}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={savingAlbum}>
                                        {savingAlbum ? (
                                            <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</>
                                        ) : (
                                            <><i className="bi bi-check-lg me-2"></i>{editingAlbumId ? "Update Album" : "Create Album"}</>
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
};


// ============================================================
// WHY US IMAGES TAB (gallery table — homepage section)
// ============================================================

const WhyUsTab = () => {
    const [gallery, setGallery] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");

    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [status, setStatus] = useState("active");
    const [sortOrder, setSortOrder] = useState(0);

    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({ title: "", description: "", category: "", status: "active", sort_order: 0 });

    // Filter state
    const [filterCategory, setFilterCategory] = useState("");

    const CATEGORIES = [
        { value: "academic",    label: "Academic",    icon: "bi-mortarboard",  color: "primary"  },
        { value: "development", label: "Development", icon: "bi-tools",        color: "warning"  },
        { value: "campus",      label: "Campus",      icon: "bi-building",     color: "success"  },
    ];

    const getCategoryBadge = (cat) => {
        const found = CATEGORIES.find((c) => c.value === cat);
        if (!found) return <span className="badge bg-secondary">Uncategorised</span>;
        return <span className={`badge bg-${found.color}`}><i className={`bi ${found.icon} me-1`}></i>{found.label}</span>;
    };

    const loadGallery = async () => {
        try {
            setLoading(true);
            setError("");
            const data = await getAdminGallery();
            setGallery(data);
        } catch (err) {
            setError(err.message || "Failed to load gallery.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadGallery(); }, []);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files || []);
        const allowed = ["image/jpeg", "image/png", "image/webp"];
        const valid = files.filter((f) => {
            if (!allowed.includes(f.type)) { alert(`${f.name}: only JPG, PNG, WEBP.`); return false; }
            if (f.size > 20 * 1024 * 1024) { alert(`${f.name}: max 20MB.`); return false; }
            return true;
        });
        if (valid.length > 50) { alert("Max 50 images at once."); valid.splice(50); }
        setSelectedFiles(valid);
        setPreviews(valid.map((f) => URL.createObjectURL(f)));
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (selectedFiles.length === 0) { alert("Please select at least one image."); return; }
        if (!category) { alert("Please select a category (Academic / Development / Campus)."); return; }
        try {
            setUploading(true);
            setError("");
            await uploadGalleryImages({ files: selectedFiles, title, description, category, status, sort_order: sortOrder });
            alert("Images uploaded successfully.");
            setSelectedFiles([]); setPreviews([]);
            setTitle(""); setDescription(""); setCategory(""); setStatus("active"); setSortOrder(0);
            await loadGallery();
        } catch (err) {
            setError(err.message || "Upload failed.");
        } finally {
            setUploading(false);
        }
    };

    const startEdit = (item) => {
        setEditingId(item.id);
        setEditData({
            title: item.title || "",
            description: item.description || "",
            category: item.category || "",
            status: item.status || "active",
            sort_order: item.sort_order || 0,
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditData({ title: "", description: "", category: "", status: "active", sort_order: 0 });
    };

    const handleSaveEdit = async (id) => {
        if (!editData.category) { alert("Please select a category."); return; }
        try {
            await updateGalleryImage(id, editData);
            alert("Image updated.");
            cancelEdit();
            await loadGallery();
        } catch (err) {
            alert(err.message || "Update failed.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this image?")) return;
        try {
            await deleteGalleryImage(id);
            alert("Image deleted.");
            await loadGallery();
        } catch (err) {
            alert(err.message || "Delete failed.");
        }
    };

    const filteredGallery = filterCategory
        ? gallery.filter((img) => img.category === filterCategory)
        : gallery;

    return (
        <div>

            <div className="alert alert-info py-2 mb-4">
                <i className="bi bi-info-circle me-2"></i>
                These images appear in the <strong>Why Us</strong> section on the homepage.
                Each image must be assigned to a category tab — <strong>Academic</strong>, <strong>Development</strong>, or <strong>Campus</strong>.
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {/* UPLOAD */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                    <h5 className="fw-bold mb-3">
                        <i className="bi bi-cloud-arrow-up me-2"></i>
                        Upload Why Us Images
                    </h5>

                    <form onSubmit={handleUpload}>

                        {/* CATEGORY — most important field, shown first */}
                        <div className="mb-3">
                            <label className="form-label fw-semibold">
                                Category <span className="text-danger">*</span>
                            </label>
                            <div className="d-flex gap-2 flex-wrap">
                                {CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.value}
                                        type="button"
                                        className={`btn ${category === cat.value ? `btn-${cat.color}` : `btn-outline-${cat.color}`}`}
                                        onClick={() => setCategory(cat.value)}
                                    >
                                        <i className={`bi ${cat.icon} me-2`}></i>
                                        {cat.label}
                                    </button>
                                ))}
                            </div>
                            {!category && (
                                <small className="text-danger mt-1 d-block">
                                    Select a category before uploading.
                                </small>
                            )}
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-semibold">Select Images <span className="text-danger">*</span></label>
                            <input
                                type="file"
                                className="form-control"
                                accept="image/jpeg,image/png,image/webp"
                                multiple
                                onChange={handleFileChange}
                            />
                            <small className="text-muted">JPG, PNG or WEBP · Max 20MB each · Up to 50</small>
                        </div>

                        {previews.length > 0 && (
                            <div className="row g-2 mb-3">
                                {previews.map((src, i) => (
                                    <div className="col-4 col-sm-3 col-md-2" key={i}>
                                        <img src={src} alt={`Preview ${i + 1}`} className="img-fluid rounded"
                                            style={{ height: "90px", width: "100%", objectFit: "cover" }} />
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="row g-3">
                            <div className="col-md-4">
                                <label className="form-label fw-semibold">Title</label>
                                <input type="text" className="form-control" value={title}
                                    onChange={(e) => setTitle(e.target.value)} placeholder="Image title (optional)" />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label fw-semibold">Description</label>
                                <input type="text" className="form-control" value={description}
                                    onChange={(e) => setDescription(e.target.value)} placeholder="Short description (optional)" />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label fw-semibold">Status</label>
                                <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                            <div className="col-md-2">
                                <label className="form-label fw-semibold">Order</label>
                                <input type="number" className="form-control" value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value)} min="0" />
                            </div>
                        </div>

                        <div className="mt-3">
                            <button type="submit" className="btn btn-primary"
                                disabled={uploading || selectedFiles.length === 0 || !category}>
                                {uploading ? (
                                    <><span className="spinner-border spinner-border-sm me-2"></span>Uploading...</>
                                ) : (
                                    <><i className="bi bi-upload me-2"></i>Upload Images</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* GALLERY LIST */}
            <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
                        <h5 className="fw-bold mb-0">
                            Why Us Images
                            <span className="badge bg-primary ms-2">{filteredGallery.length}</span>
                            {filterCategory && (
                                <span className="badge bg-light text-dark border ms-2 fw-normal">
                                    Filtered: {CATEGORIES.find(c => c.value === filterCategory)?.label}
                                </span>
                            )}
                        </h5>
                        <div className="d-flex gap-2 align-items-center flex-wrap">
                            {/* Category filter pills */}
                            <button
                                type="button"
                                className={`btn btn-sm ${!filterCategory ? "btn-dark" : "btn-outline-dark"}`}
                                onClick={() => setFilterCategory("")}
                            >
                                All
                            </button>
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.value}
                                    type="button"
                                    className={`btn btn-sm ${filterCategory === cat.value ? `btn-${cat.color}` : `btn-outline-${cat.color}`}`}
                                    onClick={() => setFilterCategory(cat.value)}
                                >
                                    <i className={`bi ${cat.icon} me-1`}></i>{cat.label}
                                </button>
                            ))}
                            <button className="btn btn-outline-secondary btn-sm" onClick={loadGallery} disabled={loading}>
                                <i className="bi bi-arrow-clockwise"></i>
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status"></div>
                        </div>
                    ) : filteredGallery.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <i className="bi bi-images" style={{ fontSize: "3rem" }}></i>
                            <p className="mt-2 mb-0">
                                {filterCategory ? `No images in the ${CATEGORIES.find(c => c.value === filterCategory)?.label} category yet.` : "No images yet."}
                            </p>
                        </div>
                    ) : (
                        <div className="row g-4">
                            {filteredGallery.map((item) => (
                                <div className="col-sm-6 col-md-4 col-lg-3" key={item.id}>
                                    <div className="card h-100 border shadow-sm">
                                        <div style={{ height: "190px", overflow: "hidden" }}>
                                            <img
                                                src={getAdminGalleryImageUrl(item.image)}
                                                alt={item.title || "Gallery image"}
                                                className="w-100 h-100"
                                                style={{ objectFit: "cover" }}
                                            />
                                        </div>
                                        <div className="card-body">
                                            {editingId === item.id ? (
                                                <>
                                                    {/* Category select in edit mode */}
                                                    <div className="mb-2">
                                                        <label className="form-label form-label-sm fw-semibold mb-1">
                                                            Category <span className="text-danger">*</span>
                                                        </label>
                                                        <select
                                                            className="form-select form-select-sm"
                                                            value={editData.category}
                                                            onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                                                        >
                                                            <option value="">— Select category —</option>
                                                            {CATEGORIES.map((cat) => (
                                                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <input type="text" className="form-control form-control-sm mb-2"
                                                        value={editData.title}
                                                        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                                                        placeholder="Title" />
                                                    <input type="text" className="form-control form-control-sm mb-2"
                                                        value={editData.description}
                                                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                                        placeholder="Description" />
                                                    <select className="form-select form-select-sm mb-2" value={editData.status}
                                                        onChange={(e) => setEditData({ ...editData, status: e.target.value })}>
                                                        <option value="active">Active</option>
                                                        <option value="inactive">Inactive</option>
                                                    </select>
                                                    <input type="number" className="form-control form-control-sm mb-3"
                                                        value={editData.sort_order} min="0"
                                                        placeholder="Sort order"
                                                        onChange={(e) => setEditData({ ...editData, sort_order: e.target.value })} />
                                                    <div className="d-flex gap-2">
                                                        <button className="btn btn-sm btn-success" onClick={() => handleSaveEdit(item.id)}>
                                                            <i className="bi bi-check-lg me-1"></i>Save
                                                        </button>
                                                        <button className="btn btn-sm btn-secondary" onClick={cancelEdit}>Cancel</button>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="mb-2">{getCategoryBadge(item.category)}</div>
                                                    <h6 className="fw-bold mb-1">{item.title || "Untitled"}</h6>
                                                    {item.description && (
                                                        <div className="small text-muted mb-2">{item.description}</div>
                                                    )}
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <span className={`badge ${item.status === "active" ? "bg-success" : "bg-secondary"}`}>
                                                            {item.status}
                                                        </span>
                                                        <small className="text-muted">Order: {item.sort_order}</small>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        {editingId !== item.id && (
                                            <div className="card-footer bg-white border-0 pt-0 pb-3">
                                                <div className="d-flex gap-2">
                                                    <button className="btn btn-sm btn-outline-primary flex-fill" onClick={() => startEdit(item)}>
                                                        <i className="bi bi-pencil me-1"></i>Edit
                                                    </button>
                                                    <button className="btn btn-sm btn-outline-danger flex-fill" onClick={() => handleDelete(item.id)}>
                                                        <i className="bi bi-trash me-1"></i>Delete
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
