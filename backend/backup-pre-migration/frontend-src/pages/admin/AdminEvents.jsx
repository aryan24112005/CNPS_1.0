import { useState, useEffect, useRef } from "react";
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  uploadEventCover,
  addEventGallery,
  deleteEventImage,
} from "../../services/adminService";

// ── Helpers ────────────────────────────────────────────────────────────────
function safeArray(val) {
  if (Array.isArray(val)) return val;
  if (val && Array.isArray(val.data)) return val.data;
  return [];
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ── Toast ──────────────────────────────────────────────────────────────────
function Toast({ toasts, onRemove }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <i
            className={`bi ${
              t.type === "success"
                ? "bi-check-circle-fill"
                : t.type === "error"
                ? "bi-x-circle-fill"
                : "bi-exclamation-triangle-fill"
            }`}
          />
          <p>{t.message}</p>
          <button
            onClick={() => onRemove(t.id)}
            style={{
              marginLeft: "auto",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-muted)",
              fontSize: "1rem",
              lineHeight: 1,
            }}
          >
            <i className="bi bi-x" />
          </button>
        </div>
      ))}
    </div>
  );
}

// ── Confirm Dialog ─────────────────────────────────────────────────────────
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay confirm-dialog">
      <div className="modal">
        <div className="modal-body" style={{ textAlign: "center", padding: "32px 28px 20px" }}>
          <div className="confirm-dialog-icon">
            <i className="bi bi-trash3" />
          </div>
          <h3 style={{ marginBottom: 8 }}>Confirm Delete</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: 0 }}>{message}</p>
        </div>
        <div className="modal-footer" style={{ justifyContent: "center" }}>
          <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// ── Status Badge ───────────────────────────────────────────────────────────
function StatusBadge({ active }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 10px",
        borderRadius: "999px",
        fontSize: "0.78rem",
        fontWeight: 600,
        background: active ? "#dcfce7" : "#f3f4f6",
        color: active ? "#15803d" : "#6b7280",
      }}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

// ── Gallery Section ────────────────────────────────────────────────────────
function GallerySection({ eventId, gallery, addToast, onRefresh }) {
  const galleryRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [deleteImg, setDeleteImg] = useState(null);

  async function handleGalleryUpload(files) {
    if (!files || files.length === 0 || !eventId) return;
    setUploading(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append("images", f));
      await addEventGallery(eventId, fd);
      addToast(`${files.length} image${files.length > 1 ? "s" : ""} added to gallery.`, "success");
      onRefresh();
    } catch (err) {
      addToast(err?.response?.data?.message || "Gallery upload failed.", "error");
    } finally {
      setUploading(false);
      if (galleryRef.current) galleryRef.current.value = "";
    }
  }

  async function handleDeleteImage() {
    if (!deleteImg || !eventId) return;
    try {
      await deleteEventImage(eventId, deleteImg._id || deleteImg.id || deleteImg);
      addToast("Image removed from gallery.", "success");
      setDeleteImg(null);
      onRefresh();
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to delete image.", "error");
      setDeleteImg(null);
    }
  }

  const imgs = safeArray(gallery);

  return (
    <>
      {deleteImg && (
        <ConfirmDialog
          message="Remove this image from the gallery?"
          onConfirm={handleDeleteImage}
          onCancel={() => setDeleteImg(null)}
        />
      )}
      <div
        style={{
          marginTop: 8,
          padding: "16px",
          background: "var(--bg-section)",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)" }}>
            <i className="bi bi-images" style={{ marginRight: 6 }} />
            Gallery Photos ({imgs.length})
          </div>
          <div>
            <input
              type="file"
              accept="image/*"
              multiple
              ref={galleryRef}
              style={{ display: "none" }}
              onChange={(e) => handleGalleryUpload(e.target.files)}
            />
            <button
              type="button"
              className="btn btn-outline"
              style={{ fontSize: "0.82rem" }}
              onClick={() => galleryRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <span className="spinner" style={{ width: 12, height: 12, marginRight: 5 }} />
                  Uploading…
                </>
              ) : (
                <>
                  <i className="bi bi-plus-lg" style={{ marginRight: 5 }} />
                  Add Photos
                </>
              )}
            </button>
          </div>
        </div>

        {imgs.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "center", margin: "16px 0" }}>
            No gallery images yet. Add some photos above.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
              gap: 8,
            }}
          >
            {imgs.map((img, i) => {
              const src = img.url || img.src || img;
              const imgId = img._id || img.id || i;
              return (
                <div
                  key={imgId}
                  style={{
                    position: "relative",
                    borderRadius: "var(--radius-sm)",
                    overflow: "hidden",
                    aspectRatio: "1",
                    background: "var(--bg-white)",
                  }}
                >
                  <img
                    src={src}
                    alt={`Gallery ${i + 1}`}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                  <button
                    type="button"
                    onClick={() => setDeleteImg(img)}
                    style={{
                      position: "absolute",
                      top: 3,
                      right: 3,
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: "rgba(0,0,0,0.6)",
                      border: "none",
                      color: "#fff",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.7rem",
                      lineHeight: 1,
                    }}
                  >
                    <i className="bi bi-x" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

// ── Event Modal ────────────────────────────────────────────────────────────
function EventModal({ event, onClose, onSaved, addToast }) {
  const [form, setForm] = useState(
    event
      ? {
          title: event.title || "",
          description: event.description || "",
          // FIX: backend field is eventDate, not date
          eventDate: event.eventDate ? new Date(event.eventDate).toISOString().slice(0, 10) : "",
          location: event.location || "",
          // FIX: backend uses status enum "active"/"inactive", not isActive boolean
          status: event.status || "active",
        }
      : { title: "", description: "", eventDate: "", location: "", status: "active" }
  );
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState(event?._id || null);
  const [gallery, setGallery] = useState(safeArray(event?.gallery));
  const coverRef = useRef();
  const [uploadingCover, setUploadingCover] = useState(false);
  const [coverFile, setCoverFile] = useState(null);
  // FIX: show existing cover image in the modal when editing
  const [coverPreview, setCoverPreview] = useState(event?.coverImage?.url || null);

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.title.trim()) {
      addToast("Event title is required.", "error");
      return;
    }
    setSaving(true);
    try {
      let result;
      if (event) {
        await updateEvent(event._id, form);
        setSavedId(event._id);
        addToast("Event updated.", "success");
      } else {
        result = await createEvent(form);
        const newId = result.data?._id || result._id;
        setSavedId(newId);
        addToast("Event created. You can now add cover and gallery images.", "success");
      }
      onSaved();
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to save event.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleCoverUpload() {
    if (!coverFile || !savedId) return;
    setUploadingCover(true);
    try {
      const fd = new FormData();
      fd.append("image", coverFile);
      await uploadEventCover(savedId, fd);
      addToast("Cover image uploaded.", "success");
      setCoverFile(null);
      onSaved();
    } catch (err) {
      addToast(err?.response?.data?.message || "Cover upload failed.", "error");
    } finally {
      setUploadingCover(false);
    }
  }
  async function refreshGallery() {
    onSaved();
    // Attempt to reload gallery for this event
    if (!savedId) return;
    try {
      const ev = await getEventById(savedId);
      setGallery(safeArray(ev?.gallery));
    } catch {
      // silently ignore
    }
  }

  const inputStyle = {
    width: "100%",
    padding: "8px 12px",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    fontSize: "0.9rem",
    outline: "none",
    background: "var(--bg-white)",
    color: "var(--text-main)",
    boxSizing: "border-box",
  };
  const labelStyle = {
    display: "block",
    marginBottom: 4,
    fontWeight: 500,
    fontSize: "0.85rem",
    color: "var(--text-secondary)",
  };
  const groupStyle = { marginBottom: 14 };

  return (
    <div className="modal-overlay">
      <div className="modal modal-lg" style={{ maxWidth: 640 }}>
        <div className="modal-header">
          <h3>{event ? "Edit Event" : "Add Event"}</h3>
          <button className="modal-close" onClick={onClose}>
            <i className="bi bi-x-lg" />
          </button>
        </div>
        <form onSubmit={handleSave}>
          <div className="modal-body" style={{ maxHeight: "65vh", overflowY: "auto" }}>
            {/* Title */}
            <div style={groupStyle}>
              <label style={labelStyle}>
                Event Title <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <input style={inputStyle} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Event title" required />
            </div>
            {/* Date & Location */}
            <div className="modal-form-grid">
              <div style={groupStyle}>
                <label style={labelStyle}>Event Date</label>
                {/* FIX: field was date, backend uses eventDate */}
                <input type="date" style={inputStyle} value={form.eventDate} onChange={(e) => set("eventDate", e.target.value)} />
              </div>
              <div style={groupStyle}>
                <label style={labelStyle}>Location</label>
                <input style={inputStyle} value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="Venue or city" />
              </div>
            </div>
            {/* Description */}
            <div style={groupStyle}>
              <label style={labelStyle}>Description</label>
              <textarea rows={4} style={{ ...inputStyle, resize: "vertical" }} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Event details" />
            </div>
            {/* Status */}
            <div style={{ ...groupStyle, display: "flex", alignItems: "center", gap: 12 }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Status</label>
              {/* FIX: toggle between "active"/"inactive" strings */}
              <div
                onClick={() => set("status", form.status === "active" ? "inactive" : "active")}
                style={{
                  width: 44, height: 24, borderRadius: 999,
                  background: form.status === "active" ? "var(--primary)" : "var(--border)",
                  position: "relative", cursor: "pointer", transition: "background 0.2s",
                }}
              >
                <div
                  style={{
                    position: "absolute", top: 3,
                    left: form.status === "active" ? 22 : 3,
                    width: 18, height: 18, borderRadius: "50%",
                    background: "#fff", transition: "left 0.2s",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  }}
                />
              </div>
              <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                {form.status === "active" ? "Active" : "Inactive"}
              </span>
            </div>

            {/* After save — Cover Upload */}
            {savedId && (
              <div
                style={{
                  padding: "16px",
                  background: "var(--bg-section)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border)",
                  marginBottom: 12,
                }}
              >
                <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 10 }}>
                  <i className="bi bi-image" style={{ marginRight: 6 }} />
                  Cover Image
                </div>
                {/* FIX: show existing or newly selected cover preview */}
                {coverPreview && (
                  <img
                    src={coverPreview}
                    alt="Cover"
                    style={{ width: "100%", maxHeight: 120, objectFit: "cover", borderRadius: "var(--radius-sm)", marginBottom: 10 }}
                  />
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <input
                    type="file"
                    accept="image/*"
                    ref={coverRef}
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files[0] || null;
                      setCoverFile(file);
                      if (file) setCoverPreview(URL.createObjectURL(file));
                    }}
                  />
                  <button type="button" className="btn btn-outline" style={{ fontSize: "0.82rem" }} onClick={() => coverRef.current?.click()}>
                    <i className="bi bi-image" style={{ marginRight: 5 }} />
                    {coverPreview ? "Change Cover" : "Choose Cover"}
                  </button>
                  {coverFile && (
                    <>
                      <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{coverFile.name}</span>
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ fontSize: "0.82rem" }}
                        onClick={handleCoverUpload}
                        disabled={uploadingCover}
                      >
                        {uploadingCover
                          ? <><span className="spinner" style={{ width: 12, height: 12, marginRight: 5 }} />Uploading…</>
                          : <><i className="bi bi-upload" style={{ marginRight: 5 }} />Upload</>}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Gallery */}
            {savedId && (
              <GallerySection
                eventId={savedId}
                gallery={gallery}
                addToast={addToast}
                onRefresh={refreshGallery}
              />
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving
                ? <><span className="spinner" style={{ width: 14, height: 14, marginRight: 6 }} />Saving…</>
                : event ? "Save Changes" : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toasts, setToasts] = useState([]);

  function addToast(message, type = "success") {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }
  function removeToast(id) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  async function loadEvents() {
    try {
      const data = await getEvents();
      setEvents(safeArray(data));
    } catch {
      addToast("Failed to load events.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadEvents(); }, []);

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteEvent(deleteTarget._id);
      addToast("Event and all associated images deleted.", "success");
      setDeleteTarget(null);
      loadEvents();
    } catch (err) {
      addToast(err?.response?.data?.message || "Delete failed.", "error");
      setDeleteTarget(null);
    }
  }

  const filtered = events.filter((e) =>
    e.title?.toLowerCase().includes(search.toLowerCase())
  );

  const thStyle = {
    padding: "12px 16px",
    textAlign: "left",
    fontSize: "0.8rem",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    color: "var(--text-secondary)",
    whiteSpace: "nowrap",
  };
  const tdStyle = {
    padding: "12px 16px",
    borderBottom: "1px solid var(--border)",
    fontSize: "0.9rem",
    verticalAlign: "middle",
  };

  return (
    <>
      <Toast toasts={toasts} onRemove={removeToast} />

      {deleteTarget && (
        <ConfirmDialog
          message={`Delete event "${deleteTarget.title}"? All photos will also be deleted.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {showModal && (
        <EventModal
          event={editTarget}
          onClose={() => { setShowModal(false); setEditTarget(null); }}
          onSaved={() => loadEvents()}
          addToast={addToast}
        />
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700 }}>Events</h2>
          <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Manage school events, dates, and photo galleries.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditTarget(null); setShowModal(true); }}>
          <i className="bi bi-plus-lg" style={{ marginRight: 6 }} />
          Add Event
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--bg-white)", padding: "0 12px", maxWidth: 320, width: "100%" }}>
          <i className="bi bi-search" style={{ color: "var(--text-muted)", marginRight: 8 }} />
          <input
            style={{ border: "none", outline: "none", padding: "9px 0", fontSize: "0.9rem", background: "transparent", width: "100%", color: "var(--text-main)" }}
            placeholder="Search by title…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading-state"><div className="spinner" /></div>
      ) : (
        <div style={{ background: "var(--bg-white)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "var(--bg-section)" }}>
              <tr>
                <th style={thStyle}>Image</th>
                <th style={thStyle}>Title</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Status</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ ...tdStyle, textAlign: "center", padding: "40px 16px" }}>
                    <div className="empty-state">
                      <i className="bi bi-calendar-event" style={{ fontSize: "2rem", color: "var(--text-muted)", display: "block", marginBottom: 8 }} />
                      <p style={{ color: "var(--text-muted)" }}>
                        {search ? "No events match your search." : "No events added yet."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((ev) => (
                  <tr
                    key={ev._id}
                    style={{ transition: "background 0.15s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-soft-blue)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                  >
                    <td style={tdStyle}>
                      {/* FIX: ev.coverImage is {url, publicId} object, not a plain URL */}
                      {ev.coverImage?.url ? (
                        <img
                          src={ev.coverImage.url}
                          alt={ev.title}
                          style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 6, display: "block" }}
                        />
                      ) : (
                        <div style={{ width: 48, height: 48, borderRadius: 6, background: "var(--bg-section)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "1.2rem" }}>
                          <i className="bi bi-calendar-event" />
                        </div>
                      )}
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 600 }}>{ev.title}</div>
                      {ev.location && <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{ev.location}</div>}
                    </td>
                    <td style={{ ...tdStyle, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                      {/* FIX: backend field is eventDate, not date */}
                      {formatDate(ev.eventDate)}
                    </td>
                    {/* FIX: backend uses status enum, not isActive boolean */}
                    <td style={tdStyle}><StatusBadge active={ev.status === "active"} /></td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <button
                          className="btn btn-outline"
                          style={{ padding: "5px 12px", fontSize: "0.82rem" }}
                          onClick={() => { setEditTarget(ev); setShowModal(true); }}
                        >
                          <i className="bi bi-pencil" />
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: "5px 12px", fontSize: "0.82rem" }}
                          onClick={() => setDeleteTarget(ev)}
                        >
                          <i className="bi bi-trash3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
          {filtered.length > 0 && (
            <div style={{ padding: "10px 16px", borderTop: "1px solid var(--border)", fontSize: "0.82rem", color: "var(--text-muted)" }}>
              {filtered.length} of {events.length} event{events.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      )}
    </>
  );
}
