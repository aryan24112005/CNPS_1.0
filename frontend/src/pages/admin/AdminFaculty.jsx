import { useState, useEffect, useRef } from "react";
import {
  getFaculty,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  uploadFacultyPhoto,
} from "../../services/adminService";

// ── Helpers ────────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  name: "",
  designation: "",
  qualification: "",
  experience: "",
  shortBio: "",
  fullBio: "",
  email: "",
  phone: "",
  sortOrder: 0,
  socialLinks: { facebook: "", instagram: "", linkedin: "", youtube: "" },
  isActive: true,
};

function safeArray(val) {
  if (Array.isArray(val)) return val;
  if (val && Array.isArray(val.data)) return val.data;
  return [];
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
          <button className="btn btn-outline" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            Delete
          </button>
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

// ── Faculty Modal ──────────────────────────────────────────────────────────
function FacultyModal({ faculty, onClose, onSaved, onPhotoUpload, addToast }) {
  const [form, setForm] = useState(
    faculty
      ? {
          name: faculty.name || "",
          designation: faculty.designation || "",
          qualification: faculty.qualification || "",
          experience: faculty.experience || "",
          shortBio: faculty.shortBio || "",
          fullBio: faculty.fullBio || "",
          email: faculty.email || "",
          phone: faculty.phone || "",
          sortOrder: faculty.sortOrder ?? 0,
          socialLinks: {
            facebook: faculty.socialLinks?.facebook || "",
            instagram: faculty.socialLinks?.instagram || "",
            linkedin: faculty.socialLinks?.linkedin || "",
            youtube: faculty.socialLinks?.youtube || "",
          },
          isActive: faculty.isActive !== false,
        }
      : { ...EMPTY_FORM, socialLinks: { ...EMPTY_FORM.socialLinks } }
  );
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState(faculty?._id || null);
  const [photoFile, setPhotoFile] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoRef = useRef();

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }
  function setSocial(field, value) {
    setForm((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [field]: value },
    }));
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      addToast("Faculty name is required.", "error");
      return;
    }
    setSaving(true);
    try {
      let result;
      if (faculty) {
        result = await updateFaculty(faculty._id, form);
        addToast("Faculty updated successfully.", "success");
        setSavedId(faculty._id);
      } else {
        result = await createFaculty(form);
        addToast("Faculty created. You can now upload a photo.", "success");
        setSavedId(result.data?._id || result._id);
      }
      onSaved();
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to save faculty.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handlePhotoUpload() {
    if (!photoFile || !savedId) return;
    setUploadingPhoto(true);
    try {
      const fd = new FormData();
      fd.append("photo", photoFile);
      await uploadFacultyPhoto(savedId, fd);
      addToast("Photo uploaded successfully.", "success");
      setPhotoFile(null);
      onSaved();
    } catch (err) {
      addToast(err?.response?.data?.message || "Photo upload failed.", "error");
    } finally {
      setUploadingPhoto(false);
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
      <div className="modal modal-lg" style={{ maxWidth: 680 }}>
        <div className="modal-header">
          <h3>{faculty ? "Edit Faculty" : "Add Faculty"}</h3>
          <button className="modal-close" onClick={onClose}>
            <i className="bi bi-x-lg" />
          </button>
        </div>
        <form onSubmit={handleSave}>
          <div className="modal-body" style={{ maxHeight: "65vh", overflowY: "auto" }}>
            <div className="modal-form-grid">
              {/* Name */}
              <div style={{ ...groupStyle, gridColumn: "1/-1" }}>
                <label style={labelStyle}>
                  Faculty Name <span style={{ color: "var(--danger)" }}>*</span>
                </label>
                <input
                  style={inputStyle}
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Full name"
                  required
                />
              </div>
              {/* Designation */}
              <div style={groupStyle}>
                <label style={labelStyle}>Designation</label>
                <input
                  style={inputStyle}
                  value={form.designation}
                  onChange={(e) => set("designation", e.target.value)}
                  placeholder="e.g., Senior Teacher"
                />
              </div>
              {/* Qualification */}
              <div style={groupStyle}>
                <label style={labelStyle}>Qualification</label>
                <input
                  style={inputStyle}
                  value={form.qualification}
                  onChange={(e) => set("qualification", e.target.value)}
                  placeholder="e.g., M.Sc., B.Ed."
                />
              </div>
              {/* Experience */}
              <div style={groupStyle}>
                <label style={labelStyle}>Experience</label>
                <input
                  style={inputStyle}
                  value={form.experience}
                  onChange={(e) => set("experience", e.target.value)}
                  placeholder="e.g., 10 years"
                />
              </div>
              {/* Sort Order */}
              <div style={groupStyle}>
                <label style={labelStyle}>Sort Order</label>
                <input
                  type="number"
                  style={inputStyle}
                  value={form.sortOrder}
                  onChange={(e) => set("sortOrder", Number(e.target.value))}
                  min={0}
                />
              </div>
              {/* Email */}
              <div style={groupStyle}>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  style={inputStyle}
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="email@example.com"
                />
              </div>
              {/* Phone */}
              <div style={groupStyle}>
                <label style={labelStyle}>Phone</label>
                <input
                  style={inputStyle}
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>
              {/* Short Bio */}
              <div style={{ ...groupStyle, gridColumn: "1/-1" }}>
                <label style={labelStyle}>Short Bio</label>
                <textarea
                  rows={2}
                  style={{ ...inputStyle, resize: "vertical" }}
                  value={form.shortBio}
                  onChange={(e) => set("shortBio", e.target.value)}
                  placeholder="Brief introduction (shown in cards)"
                />
              </div>
              {/* Full Bio */}
              <div style={{ ...groupStyle, gridColumn: "1/-1" }}>
                <label style={labelStyle}>Full Bio</label>
                <textarea
                  rows={4}
                  style={{ ...inputStyle, resize: "vertical" }}
                  value={form.fullBio}
                  onChange={(e) => set("fullBio", e.target.value)}
                  placeholder="Detailed biography"
                />
              </div>
              {/* Social Links */}
              <div style={{ ...groupStyle, gridColumn: "1/-1" }}>
                <label style={{ ...labelStyle, marginBottom: 8 }}>Social Links</label>
                <div className="modal-form-grid" style={{ gap: "8px 16px" }}>
                  {[
                    { key: "facebook", icon: "bi-facebook", placeholder: "Facebook URL" },
                    { key: "instagram", icon: "bi-instagram", placeholder: "Instagram URL" },
                    { key: "linkedin", icon: "bi-linkedin", placeholder: "LinkedIn URL" },
                    { key: "youtube", icon: "bi-youtube", placeholder: "YouTube URL" },
                  ].map(({ key, icon, placeholder }) => (
                    <div
                      key={key}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius-sm)",
                        overflow: "hidden",
                      }}
                    >
                      <span
                        style={{
                          padding: "8px 10px",
                          background: "var(--bg-section)",
                          color: "var(--text-muted)",
                          fontSize: "0.9rem",
                          borderRight: "1px solid var(--border)",
                        }}
                      >
                        <i className={`bi ${icon}`} />
                      </span>
                      <input
                        style={{
                          ...inputStyle,
                          border: "none",
                          borderRadius: 0,
                          flex: 1,
                        }}
                        value={form.socialLinks[key]}
                        onChange={(e) => setSocial(key, e.target.value)}
                        placeholder={placeholder}
                      />
                    </div>
                  ))}
                </div>
              </div>
              {/* Status */}
              <div style={{ ...groupStyle, gridColumn: "1/-1", display: "flex", alignItems: "center", gap: 12 }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Status</label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                >
                  <div
                    onClick={() => set("isActive", !form.isActive)}
                    style={{
                      width: 44,
                      height: 24,
                      borderRadius: 999,
                      background: form.isActive ? "var(--primary)" : "var(--border)",
                      position: "relative",
                      cursor: "pointer",
                      transition: "background 0.2s",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: 3,
                        left: form.isActive ? 22 : 3,
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        background: "#fff",
                        transition: "left 0.2s",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                      }}
                    />
                  </div>
                  <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                    {form.isActive ? "Active" : "Inactive"}
                  </span>
                </label>
              </div>
            </div>

            {/* Photo Upload — only shown after a record exists */}
            {savedId && (
              <div
                style={{
                  marginTop: 8,
                  padding: "16px",
                  background: "var(--bg-section)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border)",
                }}
              >
                <label style={{ ...labelStyle, marginBottom: 8 }}>
                  <i className="bi bi-camera" style={{ marginRight: 6 }} />
                  Profile Photo
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <input
                    type="file"
                    accept="image/*"
                    ref={photoRef}
                    style={{ display: "none" }}
                    onChange={(e) => setPhotoFile(e.target.files[0] || null)}
                  />
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => photoRef.current?.click()}
                  >
                    <i className="bi bi-image" style={{ marginRight: 6 }} />
                    Choose Photo
                  </button>
                  {photoFile && (
                    <>
                      <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                        {photoFile.name}
                      </span>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handlePhotoUpload}
                        disabled={uploadingPhoto}
                      >
                        {uploadingPhoto ? (
                          <>
                            <span className="spinner" style={{ width: 14, height: 14, marginRight: 6 }} />
                            Uploading…
                          </>
                        ) : (
                          <>
                            <i className="bi bi-upload" style={{ marginRight: 6 }} />
                            Upload
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? (
                <>
                  <span className="spinner" style={{ width: 14, height: 14, marginRight: 6 }} />
                  Saving…
                </>
              ) : faculty ? (
                "Save Changes"
              ) : (
                "Create Faculty"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function AdminFaculty() {
  const [faculty, setFaculty] = useState([]);
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

  async function loadFaculty() {
    try {
      const data = await getFaculty();
      setFaculty(safeArray(data));
    } catch {
      addToast("Failed to load faculty.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFaculty();
  }, []);

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteFaculty(deleteTarget._id);
      addToast("Faculty deleted.", "success");
      setDeleteTarget(null);
      loadFaculty();
    } catch (err) {
      addToast(err?.response?.data?.message || "Delete failed.", "error");
      setDeleteTarget(null);
    }
  }

  const filtered = faculty.filter((f) =>
    f.name?.toLowerCase().includes(search.toLowerCase())
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
          message={`Delete "${deleteTarget.name}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {showModal && (
        <FacultyModal
          faculty={editTarget}
          onClose={() => { setShowModal(false); setEditTarget(null); }}
          onSaved={() => { loadFaculty(); }}
          addToast={addToast}
        />
      )}

      {/* Page Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 28,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700 }}>Faculty</h2>
          <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Manage school faculty profiles and their information.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => { setEditTarget(null); setShowModal(true); }}
        >
          <i className="bi bi-plus-lg" style={{ marginRight: 6 }} />
          Add Faculty
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 18 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            background: "var(--bg-white)",
            padding: "0 12px",
            maxWidth: 320,
            width: "100%",
          }}
        >
          <i className="bi bi-search" style={{ color: "var(--text-muted)", marginRight: 8 }} />
          <input
            style={{
              border: "none",
              outline: "none",
              padding: "9px 0",
              fontSize: "0.9rem",
              background: "transparent",
              width: "100%",
              color: "var(--text-main)",
            }}
            placeholder="Search by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner" />
        </div>
      ) : (
        <div
          style={{
            background: "var(--bg-white)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border)",
            overflow: "hidden",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "var(--bg-section)" }}>
              <tr>
                <th style={thStyle}>Photo</th>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Designation</th>
                <th style={thStyle}>Status</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ ...tdStyle, textAlign: "center", padding: "40px 16px" }}>
                    <div className="empty-state">
                      <i className="bi bi-people" style={{ fontSize: "2rem", color: "var(--text-muted)", display: "block", marginBottom: 8 }} />
                      <p style={{ color: "var(--text-muted)" }}>
                        {search ? "No faculty match your search." : "No faculty added yet."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((f) => (
                  <tr
                    key={f._id}
                    style={{ transition: "background 0.15s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-soft-blue)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                  >
                    <td style={tdStyle}>
                      {f.photo ? (
                        <img
                          src={f.photo}
                          alt={f.name}
                          style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 6, display: "block" }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 6,
                            background: "var(--bg-section)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--text-muted)",
                            fontSize: "1.2rem",
                          }}
                        >
                          <i className="bi bi-person" />
                        </div>
                      )}
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 600 }}>{f.name}</div>
                      {f.email && (
                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{f.email}</div>
                      )}
                    </td>
                    <td style={{ ...tdStyle, color: "var(--text-secondary)" }}>
                      {f.designation || "—"}
                    </td>
                    <td style={tdStyle}>
                      <StatusBadge active={f.isActive !== false} />
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <button
                          className="btn btn-outline"
                          style={{ padding: "5px 12px", fontSize: "0.82rem" }}
                          onClick={() => { setEditTarget(f); setShowModal(true); }}
                        >
                          <i className="bi bi-pencil" />
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: "5px 12px", fontSize: "0.82rem" }}
                          onClick={() => setDeleteTarget(f)}
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
            <div
              style={{
                padding: "10px 16px",
                borderTop: "1px solid var(--border)",
                fontSize: "0.82rem",
                color: "var(--text-muted)",
              }}
            >
              {filtered.length} of {faculty.length} faculty member{faculty.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      )}
    </>
  );
}
