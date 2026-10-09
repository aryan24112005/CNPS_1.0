import { useState, useEffect, useRef } from "react";
import {
  getNotices,
  createNotice,
  updateNotice,
  deleteNotice,
  uploadNoticeFile,
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

// Safely extract a URL string from a notice.file value.
// The API returns file as an object { url, publicId, resourceType }
// but older records might be a plain string or missing entirely.
function getFileUrl(file) {
  if (!file) return "";
  if (typeof file === "string") return file;
  if (typeof file === "object") return file.url || "";
  return "";
}

function getFileExt(file) {
  const url = getFileUrl(file);
  if (!url) return "";
  const parts = url.split(".");
  return parts[parts.length - 1]?.toLowerCase().split("?")[0] || "";
}

function isPdf(file) {
  const ext = getFileExt(file);
  if (ext === "pdf") return true;
  if (typeof file === "object" && file?.resourceType === "raw") return true;
  return false;
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

// ── File Icon ──────────────────────────────────────────────────────────────
function FileIcon({ file }) {
  const url = getFileUrl(file);
  if (!url) return <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>—</span>;
  const pdf = isPdf(file);
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title={pdf ? "View PDF" : "View file"}
      style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        color: pdf ? "#ef4444" : "var(--primary)",
        fontSize: "1.1rem", textDecoration: "none",
      }}
    >
      <i className={pdf ? "bi bi-file-earmark-pdf-fill" : "bi bi-file-earmark-image-fill"} />
    </a>
  );
}

// ── Notice Modal ───────────────────────────────────────────────────────────
function NoticeModal({ notice, onClose, onSaved, addToast }) {
  const [form, setForm] = useState(
    notice
      ? {
          title: notice.title || "",
          content: notice.content || "",
          isActive: notice.isActive !== false,
        }
      : { title: "", content: "", isActive: true }
  );
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState(notice?._id || null);
  const [attachFile, setAttachFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileRef = useRef();

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.title.trim()) {
      addToast("Notice title is required.", "error");
      return;
    }
    setSaving(true);
    try {
      let result;
      if (notice) {
        await updateNotice(notice._id, form);
        setSavedId(notice._id);
        addToast("Notice updated.", "success");
      } else {
        result = await createNotice(form);
        const newId = result.data?._id || result._id;
        setSavedId(newId);
        addToast("Notice created. You can now attach a file.", "success");
      }
      onSaved();
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to save notice.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleFileUpload() {
    if (!attachFile || !savedId) return;
    setUploadingFile(true);
    try {
      const fd = new FormData();
      fd.append("file", attachFile);
      await uploadNoticeFile(savedId, fd);
      addToast("File attached to notice.", "success");
      setAttachFile(null);
      onSaved();
    } catch (err) {
      addToast(err?.response?.data?.message || "File upload failed.", "error");
    } finally {
      setUploadingFile(false);
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
  const groupStyle = { marginBottom: 16 };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <h3>{notice ? "Edit Notice" : "Add Notice"}</h3>
          <button className="modal-close" onClick={onClose}>
            <i className="bi bi-x-lg" />
          </button>
        </div>
        <form onSubmit={handleSave}>
          <div className="modal-body">
            {/* Title */}
            <div style={groupStyle}>
              <label style={labelStyle}>
                Notice Title <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <input
                style={inputStyle}
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Notice title"
                required
              />
            </div>
            {/* Content */}
            <div style={groupStyle}>
              <label style={labelStyle}>Content</label>
              <textarea
                rows={5}
                style={{ ...inputStyle, resize: "vertical" }}
                value={form.content}
                onChange={(e) => set("content", e.target.value)}
                placeholder="Notice details, instructions, or announcement…"
              />
            </div>
            {/* Status */}
            <div style={{ ...groupStyle, display: "flex", alignItems: "center", gap: 12 }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Status</label>
              <div
                onClick={() => set("isActive", !form.isActive)}
                style={{
                  width: 44, height: 24, borderRadius: 999,
                  background: form.isActive ? "var(--primary)" : "var(--border)",
                  position: "relative", cursor: "pointer", transition: "background 0.2s",
                }}
              >
                <div
                  style={{
                    position: "absolute", top: 3,
                    left: form.isActive ? 22 : 3,
                    width: 18, height: 18, borderRadius: "50%",
                    background: "#fff", transition: "left 0.2s",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  }}
                />
              </div>
              <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                {form.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            {/* File Attachment — after save */}
            {savedId && (
              <div
                style={{
                  marginTop: 4,
                  padding: "16px",
                  background: "var(--bg-section)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border)",
                }}
              >
                <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 10 }}>
                  <i className="bi bi-paperclip" style={{ marginRight: 6 }} />
                  Attach File
                  <span style={{ fontWeight: 400, color: "var(--text-muted)", marginLeft: 6 }}>
                    (PDF or image)
                  </span>
                </div>
                {notice?.file?.url && (
                  <div style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 8, fontSize: "0.85rem" }}>
                    <FileIcon file={notice.file} />
                    <span style={{ color: "var(--text-secondary)" }}>Current attachment</span>
                    <a
                      href={getFileUrl(notice.file)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "var(--primary)", fontSize: "0.82rem" }}
                    >
                      View
                    </a>
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    ref={fileRef}
                    style={{ display: "none" }}
                    onChange={(e) => setAttachFile(e.target.files[0] || null)}
                  />
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ fontSize: "0.82rem" }}
                    onClick={() => fileRef.current?.click()}
                  >
                    <i className="bi bi-paperclip" style={{ marginRight: 5 }} />
                    {notice?.file?.url ? "Replace File" : "Choose File"}
                  </button>
                  {attachFile && (
                    <>
                      <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                        {attachFile.name}
                      </span>
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ fontSize: "0.82rem" }}
                        onClick={handleFileUpload}
                        disabled={uploadingFile}
                      >
                        {uploadingFile
                          ? <><span className="spinner" style={{ width: 12, height: 12, marginRight: 5 }} />Uploading…</>
                          : <><i className="bi bi-upload" style={{ marginRight: 5 }} />Attach</>}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving
                ? <><span className="spinner" style={{ width: 14, height: 14, marginRight: 6 }} />Saving…</>
                : notice ? "Save Changes" : "Create Notice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function AdminNotices() {
  const [notices, setNotices] = useState([]);
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

  async function loadNotices() {
    try {
      const data = await getNotices();
      setNotices(safeArray(data));
    } catch {
      addToast("Failed to load notices.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadNotices(); }, []);

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteNotice(deleteTarget._id);
      addToast("Notice deleted.", "success");
      setDeleteTarget(null);
      loadNotices();
    } catch (err) {
      addToast(err?.response?.data?.message || "Delete failed.", "error");
      setDeleteTarget(null);
    }
  }

  const filtered = notices.filter((n) =>
    n.title?.toLowerCase().includes(search.toLowerCase())
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
          message={`Delete notice "${deleteTarget.title}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {showModal && (
        <NoticeModal
          notice={editTarget}
          onClose={() => { setShowModal(false); setEditTarget(null); }}
          onSaved={() => loadNotices()}
          addToast={addToast}
        />
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700 }}>Notices</h2>
          <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Publish and manage school announcements and notices.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditTarget(null); setShowModal(true); }}>
          <i className="bi bi-plus-lg" style={{ marginRight: 6 }} />
          Add Notice
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--bg-white)", padding: "0 12px", maxWidth: 320 }}>
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
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "var(--bg-section)" }}>
              <tr>
                <th style={thStyle}>Title</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Status</th>
                <th style={{ ...thStyle, textAlign: "center" }}>File</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ ...tdStyle, textAlign: "center", padding: "40px 16px" }}>
                    <div className="empty-state">
                      <i className="bi bi-megaphone" style={{ fontSize: "2rem", color: "var(--text-muted)", display: "block", marginBottom: 8 }} />
                      <p style={{ color: "var(--text-muted)" }}>
                        {search ? "No notices match your search." : "No notices added yet."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((n) => (
                  <tr
                    key={n._id}
                    style={{ transition: "background 0.15s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-soft-blue)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                  >
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 600 }}>{n.title}</div>
                      {n.content && (
                        <div
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--text-muted)",
                            maxWidth: 320,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {n.content}
                        </div>
                      )}
                    </td>
                    <td style={{ ...tdStyle, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                      {formatDate(n.createdAt || n.date)}
                    </td>
                    <td style={tdStyle}>
                      <StatusBadge active={n.isActive !== false} />
                    </td>
                    <td style={{ ...tdStyle, textAlign: "center" }}>
                      <FileIcon file={n.file} />
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <button
                          className="btn btn-outline"
                          style={{ padding: "5px 12px", fontSize: "0.82rem" }}
                          onClick={() => { setEditTarget(n); setShowModal(true); }}
                        >
                          <i className="bi bi-pencil" />
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: "5px 12px", fontSize: "0.82rem" }}
                          onClick={() => setDeleteTarget(n)}
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
          {filtered.length > 0 && (
            <div style={{ padding: "10px 16px", borderTop: "1px solid var(--border)", fontSize: "0.82rem", color: "var(--text-muted)" }}>
              {filtered.length} of {notices.length} notice{notices.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      )}
    </>
  );
}
