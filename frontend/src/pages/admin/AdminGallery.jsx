import { useEffect, useState, useRef } from "react";
import {
  getAlbums,
  getAlbumById,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  uploadAlbumCover,
  addAlbumImages,
  deleteAlbumImage,
} from "../../services/adminService";

// ── Page Header ───────────────────────────────────────────────
const AdminPageHeader = ({ title, description }) => (
  <div style={{ marginBottom: 28 }}>
    <h2 style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--navy)", margin: 0 }}>
      {title}
    </h2>
    {description && (
      <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", marginTop: 4, marginBottom: 0 }}>
        {description}
      </p>
    )}
  </div>
);

// ── Toast ─────────────────────────────────────────────────────
const Toast = ({ msg, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  const bg = type === "success" ? "var(--success)" : type === "error" ? "var(--danger)" : "var(--info)";
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      background: bg, color: "#fff", padding: "12px 20px",
      borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-lg)",
      display: "flex", alignItems: "center", gap: 10, minWidth: 260,
    }}>
      <i className={type === "success" ? "bi bi-check-circle-fill" : type === "error" ? "bi bi-x-circle-fill" : "bi bi-info-circle-fill"} />
      <span style={{ flex: 1, fontSize: "0.9rem" }}>{msg}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: "1rem" }}>
        <i className="bi bi-x" />
      </button>
    </div>
  );
};

// ── Confirm Dialog ────────────────────────────────────────────
const ConfirmDialog = ({ message, onConfirm, onCancel }) => (
  <div style={{
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9000,
  }}>
    <div style={{
      background: "#fff", borderRadius: "var(--radius-md)", padding: 28,
      maxWidth: 420, width: "90%", boxShadow: "var(--shadow-lg)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: "1.5rem", color: "var(--warning)" }} />
        <h4 style={{ margin: 0, color: "var(--navy)" }}>Confirm Delete</h4>
      </div>
      <p style={{ marginBottom: 24, color: "var(--text-secondary)" }}>{message}</p>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button onClick={onCancel} style={btnStyle("ghost")}>Cancel</button>
        <button onClick={onConfirm} style={btnStyle("danger")}>Delete</button>
      </div>
    </div>
  </div>
);

// ── Button style helper ───────────────────────────────────────
const btnStyle = (variant = "primary", small = false) => {
  const base = {
    padding: small ? "5px 12px" : "8px 18px",
    borderRadius: "var(--radius-sm)",
    fontSize: small ? "0.8rem" : "0.9rem",
    fontWeight: 600,
    cursor: "pointer",
    border: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    transition: "var(--transition)",
  };
  const variants = {
    primary: { background: "var(--primary)", color: "#fff" },
    danger: { background: "var(--danger)", color: "#fff" },
    ghost: { background: "var(--bg-section)", color: "var(--navy)", border: "1px solid var(--border)" },
    success: { background: "var(--success)", color: "#fff" },
    warning: { background: "var(--warning)", color: "#fff" },
  };
  return { ...base, ...(variants[variant] || variants.primary) };
};

// ── Badge style ───────────────────────────────────────────────
const badgeStyle = (status) => {
  const map = {
    active: { background: "#DCFCE7", color: "#16A34A" },
    inactive: { background: "#F3F4F6", color: "#6B7280" },
  };
  const s = (status || "").toLowerCase();
  return {
    ...(map[s] || map.inactive),
    padding: "2px 10px", borderRadius: "var(--radius-pill)",
    fontSize: "0.78rem", fontWeight: 600, display: "inline-block",
  };
};

// ── CATEGORY OPTIONS ──────────────────────────────────────────
// Values must match the Mongoose enum: ["academic","development","campus","general"]
const CATEGORIES = [
  { label: "Academic",    value: "academic" },
  { label: "Development", value: "development" },
  { label: "Campus",      value: "campus" },
  { label: "General",     value: "general" },
];

// ── MODAL ─────────────────────────────────────────────────────
const EMPTY_FORM = { title: "", description: "", category: "general", status: "active" };

const AlbumModal = ({ initial, onClose, onSaved, showToast }) => {
  const [form, setForm] = useState(initial ? {
    title: initial.title || "",
    description: initial.description || "",
    category: (initial.category || "general").toLowerCase(),
    status: (initial.status || "active").toLowerCase(),
  } : { ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(initial?.coverImage?.url || null);
  const fileRef = useRef();

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleCover = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { showToast("Album title is required", "error"); return; }
    setSaving(true);
    try {
      let saved;
      if (initial?._id) {
        saved = await updateAlbum(initial._id, form);
        showToast("Album updated", "success");
      } else {
        saved = await createAlbum(form);
        showToast("Album created", "success");
      }
      const albumId = saved?.data?._id || initial?._id;
      if (coverFile && albumId) {
        const fd = new FormData();
        fd.append("image", coverFile);  // multer expects field "image"
        await uploadAlbumCover(albumId, fd);
      }
      onSaved();
    } catch (err) {
      showToast(err?.response?.data?.message || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 8000,
    }}>
      <div style={{
        background: "#fff", borderRadius: "var(--radius-md)", padding: 32,
        width: "100%", maxWidth: 520, boxShadow: "var(--shadow-lg)", maxHeight: "90vh", overflowY: "auto",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, color: "var(--navy)" }}>{initial ? "Edit Album" : "New Album"}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "1.4rem", cursor: "pointer", color: "var(--text-muted)" }}>
            <i className="bi bi-x" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Album Title <span style={{ color: "var(--danger)" }}>*</span></label>
            <input value={form.title} onChange={set("title")} placeholder="e.g. Annual Sports Day 2024" required style={inputStyle} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Description</label>
            <textarea value={form.description} onChange={set("description")} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Category</label>
              <select value={form.category} onChange={set("category")} style={inputStyle}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select value={form.status} onChange={set("status")} style={inputStyle}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Cover Image</label>
            {coverPreview && (
              <img src={coverPreview} alt="cover preview" style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: "var(--radius-sm)", marginBottom: 8 }} />
            )}
            <input type="file" accept="image/*" ref={fileRef} onChange={handleCover} style={{ display: "none" }} />
            <button type="button" onClick={() => fileRef.current.click()} style={btnStyle("ghost", true)}>
              <i className="bi bi-upload" /> {coverPreview ? "Change Cover" : "Upload Cover"}
            </button>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={btnStyle("ghost")}>Cancel</button>
            <button type="submit" disabled={saving} style={btnStyle("primary")}>
              {saving ? <><i className="bi bi-hourglass-split" /> Saving…</> : <><i className="bi bi-check2" /> Save Album</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const labelStyle = { display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--navy)", marginBottom: 6 };
const inputStyle = {
  width: "100%", padding: "9px 12px", border: "1.5px solid var(--border)",
  borderRadius: "var(--radius-sm)", fontSize: "0.9rem", outline: "none",
  background: "#fff", color: "var(--text-main)", fontFamily: "inherit",
};

// ── MAIN COMPONENT ────────────────────────────────────────────
export default function AdminGallery() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [albumDetail, setAlbumDetail] = useState(null); // full album with images
  const [loadingImages, setLoadingImages] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [confirm, setConfirm] = useState(null); // { type: 'album'|'image', albumId, imgId, message, onConfirm }
  const [toast, setToast] = useState(null);
  const [uploading, setUploading] = useState(false);
  const imgUploadRef = useRef();

  const showToast = (msg, type = "info") => setToast({ msg, type });

  // Load albums
  const loadAlbums = async () => {
    setLoading(true);
    try {
      const data = await getAlbums();
      setAlbums(Array.isArray(data) ? data : []);
    } catch {
      showToast("Failed to load albums", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAlbums(); }, []);

  // Load selected album detail (with images)
  const selectAlbum = async (album) => {
    setSelectedAlbum(album);
    setLoadingImages(true);
    try {
      const detail = await getAlbumById(album._id);
      setAlbumDetail(detail);
    } catch {
      showToast("Failed to load album images", "error");
      setAlbumDetail(album);
    } finally {
      setLoadingImages(false);
    }
  };

  const handleModalClose = () => { setShowModal(false); setEditingAlbum(null); };
  const handleModalSaved = () => { handleModalClose(); loadAlbums(); };

  // Delete album
  const confirmDeleteAlbum = (album) => {
    setConfirm({
      message: `Delete album "${album.title}" and all its images? This cannot be undone.`,
      onConfirm: async () => {
        setConfirm(null);
        try {
          await deleteAlbum(album._id);
          showToast("Album deleted", "success");
          if (selectedAlbum?._id === album._id) { setSelectedAlbum(null); setAlbumDetail(null); }
          loadAlbums();
        } catch {
          showToast("Delete failed", "error");
        }
      },
    });
  };

  // Delete single image
  const confirmDeleteImage = (imgId) => {
    setConfirm({
      message: "Delete this image? This cannot be undone.",
      onConfirm: async () => {
        setConfirm(null);
        try {
          await deleteAlbumImage(selectedAlbum._id, imgId);
          showToast("Image deleted", "success");
          selectAlbum(selectedAlbum); // refresh
        } catch {
          showToast("Failed to delete image", "error");
        }
      },
    });
  };

  // Bulk upload images
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length || !selectedAlbum) return;
    setUploading(true);
    try {
      const fd = new FormData();
      files.forEach(f => fd.append("images", f));
      await addAlbumImages(selectedAlbum._id, fd);
      showToast(`${files.length} image(s) uploaded`, "success");
      selectAlbum(selectedAlbum);
    } catch {
      showToast("Upload failed", "error");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const images = albumDetail?.images || [];

  return (
    <div style={{ padding: "24px 28px" }}>
      <style>{`
        .gallery-split { display: grid; grid-template-columns: 360px 1fr; gap: 24px; }
        @media (max-width: 900px) { .gallery-split { grid-template-columns: 1fr; } }
        .album-row { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: var(--radius-sm); cursor: pointer; transition: background 0.15s; border: 1.5px solid transparent; }
        .album-row:hover { background: var(--bg-soft-blue); }
        .album-row.active { background: var(--bg-soft-blue); border-color: var(--primary); }
        .img-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; }
        .img-card { position: relative; border-radius: var(--radius-sm); overflow: hidden; background: var(--bg-section); }
        .img-card img { width: 100%; height: 130px; object-fit: cover; display: block; }
        .img-card .del-btn { position: absolute; top: 6px; right: 6px; background: rgba(0,0,0,0.6); border: none; color: #fff; border-radius: 50%; width: 28px; height: 28px; cursor: pointer; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; }
        .img-card:hover .del-btn { opacity: 1; }
        .img-caption { padding: 6px 8px; font-size: 0.78rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        <AdminPageHeader title="Gallery Management" description="Manage photo albums and images" />
        <button onClick={() => { setEditingAlbum(null); setShowModal(true); }} style={btnStyle("primary")}>
          <i className="bi bi-plus-lg" /> New Album
        </button>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading albums…</p>
        </div>
      ) : albums.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-images" style={{ fontSize: "2.5rem", color: "var(--text-muted)", display: "block", marginBottom: 12 }} />
          <p>No albums yet. Create your first album!</p>
        </div>
      ) : (
        <div className="gallery-split">
          {/* ── Albums Panel ── */}
          <div style={{ background: "#fff", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", overflow: "hidden" }}>
            <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", background: "var(--bg-section)" }}>
              <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--navy)" }}>
                Albums ({albums.length})
              </span>
            </div>
            <div style={{ overflowY: "auto", maxHeight: 620 }}>
              {albums.map(album => (
                <div
                  key={album._id}
                  className={`album-row${selectedAlbum?._id === album._id ? " active" : ""}`}
                  onClick={() => selectAlbum(album)}
                >
                  {/* cover */}
                  <div style={{ width: 52, height: 42, borderRadius: "var(--radius-sm)", overflow: "hidden", background: "var(--bg-soft-blue)", flexShrink: 0 }}>
                    {album.coverImage?.url ? (
                      <img src={album.coverImage.url} alt={album.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)" }}>
                        <i className="bi bi-image" />
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--navy)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {album.title}
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      {album.category} · {album.imageCount ?? album.images?.length ?? 0} photos
                    </div>
                  </div>
                  <span style={badgeStyle(album.status)}>{album.status || "Active"}</span>
                  <div style={{ display: "flex", gap: 4 }} onClick={e => e.stopPropagation()}>
                    <button title="Edit" onClick={() => { setEditingAlbum(album); setShowModal(true); }} style={btnStyle("ghost", true)}>
                      <i className="bi bi-pencil" />
                    </button>
                    <button title="Delete" onClick={() => confirmDeleteAlbum(album)} style={{ ...btnStyle("ghost", true), color: "var(--danger)" }}>
                      <i className="bi bi-trash" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Images Panel ── */}
          <div style={{ background: "#fff", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", overflow: "hidden" }}>
            {!selectedAlbum ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, color: "var(--text-muted)" }}>
                <i className="bi bi-arrow-left-circle" style={{ fontSize: "2rem", marginBottom: 10 }} />
                <p style={{ margin: 0 }}>Select an album to view its images</p>
              </div>
            ) : (
              <>
                <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", background: "var(--bg-section)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--navy)" }}>{selectedAlbum.title}</span>
                    <span style={{ marginLeft: 10, fontSize: "0.82rem", color: "var(--text-muted)" }}>{images.length} image(s)</span>
                  </div>
                  <div>
                    <input type="file" accept="image/*" multiple ref={imgUploadRef} onChange={handleImageUpload} style={{ display: "none" }} />
                    <button onClick={() => imgUploadRef.current.click()} disabled={uploading} style={btnStyle("primary", true)}>
                      {uploading ? <><i className="bi bi-hourglass-split" /> Uploading…</> : <><i className="bi bi-cloud-upload" /> Add Images</>}
                    </button>
                  </div>
                </div>
                <div style={{ padding: 16 }}>
                  {loadingImages ? (
                    <div className="loading-state">
                      <div className="spinner" />
                      <p>Loading images…</p>
                    </div>
                  ) : images.length === 0 ? (
                    <div className="empty-state">
                      <i className="bi bi-image" style={{ fontSize: "2rem", color: "var(--text-muted)", display: "block", marginBottom: 8 }} />
                      <p>No images yet. Upload some!</p>
                    </div>
                  ) : (
                    <div className="img-grid">
                      {images.map((img, i) => (
                        <div key={img._id || i} className="img-card">
                          <img src={img.url} alt={img.caption || `Image ${i + 1}`} />
                          <button className="del-btn" title="Delete image" onClick={() => confirmDeleteImage(img._id)}>
                            <i className="bi bi-trash-fill" style={{ fontSize: "0.75rem" }} />
                          </button>
                          {img.caption && <div className="img-caption">{img.caption}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showModal && (
        <AlbumModal
          initial={editingAlbum}
          onClose={handleModalClose}
          onSaved={handleModalSaved}
          showToast={showToast}
        />
      )}
      {confirm && (
        <ConfirmDialog
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
