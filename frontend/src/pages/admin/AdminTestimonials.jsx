import { useEffect, useState, useRef } from "react";
import {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  uploadTestimonialAvatar,
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

// ── Helpers ───────────────────────────────────────────────────
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

const labelStyle = { display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--navy)", marginBottom: 6 };
const inputStyle = {
  width: "100%", padding: "9px 12px", border: "1.5px solid var(--border)",
  borderRadius: "var(--radius-sm)", fontSize: "0.9rem", outline: "none",
  background: "#fff", color: "var(--text-main)", fontFamily: "inherit",
};

const safeArray = (d) => (Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : []);

const statusBadge = (status) => {
  const map = {
    approved: { background: "#DCFCE7", color: "#16A34A" },
    rejected: { background: "#FEE2E2", color: "#DC2626" },
    pending:  { background: "#FEF3C7", color: "#D97706" },
  };
  const s = (status || "pending").toLowerCase();
  return { ...(map[s] || map.pending), padding: "2px 10px", borderRadius: "var(--radius-pill)", fontSize: "0.78rem", fontWeight: 600, display: "inline-block" };
};

// ── Star Selector ─────────────────────────────────────────────
const StarSelector = ({ value, onChange }) => (
  <div style={{ display: "flex", gap: 4 }}>
    {[1, 2, 3, 4, 5].map(n => (
      <button
        key={n}
        type="button"
        onClick={() => onChange(n)}
        style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.4rem", color: n <= value ? "var(--gold)" : "var(--border)", padding: 2 }}
      >
        <i className={n <= value ? "bi bi-star-fill" : "bi bi-star"} />
      </button>
    ))}
  </div>
);

// ── Star Display ──────────────────────────────────────────────
const StarDisplay = ({ rating }) => (
  <div style={{ display: "flex", gap: 2 }}>
    {[1, 2, 3, 4, 5].map(n => (
      <i
        key={n}
        className={n <= rating ? "bi bi-star-fill" : "bi bi-star"}
        style={{ fontSize: "0.8rem", color: n <= rating ? "var(--gold)" : "var(--border)" }}
      />
    ))}
  </div>
);

// ── MODAL ─────────────────────────────────────────────────────
const EMPTY_FORM = { name: "", designation: "", content: "", rating: 5, status: "Pending" };

const TestimonialModal = ({ initial, onClose, onSaved, showToast }) => {
  const [form, setForm] = useState(initial ? {
    name: initial.name || "",
    designation: initial.designation || "",
    content: initial.content || "",
    rating: initial.rating ?? 5,
    status: initial.status || "Pending",
  } : { ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(initial?.avatar?.url || null);
  const fileRef = useRef();

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { showToast("Name is required", "error"); return; }
    if (!form.content.trim()) { showToast("Testimonial content is required", "error"); return; }
    setSaving(true);
    try {
      let saved;
      if (initial?._id) {
        saved = await updateTestimonial(initial._id, form);
        showToast("Testimonial updated", "success");
      } else {
        saved = await createTestimonial(form);
        showToast("Testimonial created", "success");
      }
      const id = saved?.data?._id || initial?._id;
      if (avatarFile && id) {
        const fd = new FormData();
        fd.append("avatar", avatarFile);
        await uploadTestimonialAvatar(id, fd);
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
          <h3 style={{ margin: 0, color: "var(--navy)" }}>{initial ? "Edit Testimonial" : "Add Testimonial"}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "1.4rem", cursor: "pointer", color: "var(--text-muted)" }}>
            <i className="bi bi-x" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          {/* Avatar upload */}
          <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%", overflow: "hidden",
              background: "var(--bg-soft-blue)", display: "flex", alignItems: "center",
              justifyContent: "center", flexShrink: 0, border: "2px solid var(--border)",
            }}>
              {avatarPreview
                ? <img src={avatarPreview} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <i className="bi bi-person-fill" style={{ fontSize: "2rem", color: "var(--text-muted)" }} />
              }
            </div>
            <div>
              <input type="file" accept="image/*" ref={fileRef} onChange={handleAvatar} style={{ display: "none" }} />
              <button type="button" onClick={() => fileRef.current.click()} style={btnStyle("ghost", true)}>
                <i className="bi bi-upload" /> Upload Avatar
              </button>
            </div>
          </div>

          <div className="modal-form-grid" style={{ gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Name <span style={{ color: "var(--danger)" }}>*</span></label>
              <input value={form.name} onChange={set("name")} placeholder="e.g. John Smith" required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Designation</label>
              <input value={form.designation} onChange={set("designation")} placeholder="e.g. Parent, Student" style={inputStyle} />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Testimonial <span style={{ color: "var(--danger)" }}>*</span></label>
            <textarea
              value={form.content}
              onChange={set("content")}
              rows={4}
              placeholder="Write the testimonial here…"
              required
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>

          <div className="modal-form-grid" style={{ gap: 16, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>Rating</label>
              <StarSelector value={form.rating} onChange={(v) => setForm(f => ({ ...f, rating: v }))} />
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select value={form.status} onChange={set("status")} style={inputStyle}>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={btnStyle("ghost")}>Cancel</button>
            <button type="submit" disabled={saving} style={btnStyle("primary")}>
              {saving ? <><i className="bi bi-hourglass-split" /> Saving…</> : <><i className="bi bi-check2" /> Save</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── MAIN COMPONENT ────────────────────────────────────────────
export default function AdminTestimonials() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [statusLoading, setStatusLoading] = useState({}); // { id: true }

  const showToast = (msg, type = "info") => setToast({ msg, type });

  const load = async () => {
    setLoading(true);
    try {
      const data = await getTestimonials();
      setItems(safeArray(data));
    } catch {
      showToast("Failed to load testimonials", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleClose = () => { setShowModal(false); setEditing(null); };
  const handleSaved = () => { handleClose(); load(); };

  const confirmDelete = (item) => {
    setConfirm({
      message: `Delete testimonial by "${item.name}"? This cannot be undone.`,
      onConfirm: async () => {
        setConfirm(null);
        try {
          await deleteTestimonial(item._id);
          showToast("Testimonial deleted", "success");
          load();
        } catch {
          showToast("Delete failed", "error");
        }
      },
    });
  };

  // Quick status toggle
  const quickStatus = async (item, newStatus) => {
    setStatusLoading(s => ({ ...s, [item._id]: true }));
    try {
      await updateTestimonial(item._id, { status: newStatus });
      showToast(`Marked as ${newStatus}`, "success");
      load();
    } catch {
      showToast("Status update failed", "error");
    } finally {
      setStatusLoading(s => ({ ...s, [item._id]: false }));
    }
  };

  return (
    <div style={{ padding: "24px 28px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 8 }}>
        <AdminPageHeader title="Testimonials" description="Manage parent and student testimonials" />
        <button onClick={() => { setEditing(null); setShowModal(true); }} style={btnStyle("primary")}>
          <i className="bi bi-plus-lg" /> Add Testimonial
        </button>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading testimonials…</p>
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-chat-quote" style={{ fontSize: "2.5rem", color: "var(--text-muted)", display: "block", marginBottom: 12 }} />
          <p>No testimonials yet.</p>
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--bg-section)", borderBottom: "2px solid var(--border)" }}>
                  {["Avatar", "Name", "Designation", "Rating", "Excerpt", "Status", "Actions"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.82rem", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={item._id} style={{ borderBottom: "1px solid var(--border)", background: idx % 2 === 0 ? "#fff" : "var(--bg-section)" }}>
                    {/* Avatar */}
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ width: 42, height: 42, borderRadius: "50%", overflow: "hidden", background: "var(--bg-soft-blue)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {item.avatar?.url
                          ? <img src={item.avatar.url} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : <i className="bi bi-person-fill" style={{ color: "var(--text-muted)" }} />
                        }
                      </div>
                    </td>
                    {/* Name */}
                    <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--navy)", fontSize: "0.9rem", whiteSpace: "nowrap" }}>{item.name}</td>
                    {/* Designation */}
                    <td style={{ padding: "12px 16px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>{item.designation || "—"}</td>
                    {/* Rating */}
                    <td style={{ padding: "12px 16px" }}><StarDisplay rating={item.rating ?? 5} /></td>
                    {/* Excerpt */}
                    <td style={{ padding: "12px 16px", fontSize: "0.85rem", color: "var(--text-muted)", maxWidth: 220 }}>
                      <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {item.content}
                      </span>
                    </td>
                    {/* Status */}
                    <td style={{ padding: "12px 16px" }}>
                      <span style={statusBadge(item.status)}>{item.status || "Pending"}</span>
                    </td>
                    {/* Actions */}
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: 6, flexWrap: "nowrap" }}>
                        {item.status !== "Approved" && (
                          <button
                            disabled={statusLoading[item._id]}
                            onClick={() => quickStatus(item, "Approved")}
                            style={btnStyle("success", true)}
                            title="Approve"
                          >
                            <i className="bi bi-check-lg" />
                          </button>
                        )}
                        {item.status !== "Rejected" && (
                          <button
                            disabled={statusLoading[item._id]}
                            onClick={() => quickStatus(item, "Rejected")}
                            style={{ ...btnStyle("ghost", true), color: "var(--danger)" }}
                            title="Reject"
                          >
                            <i className="bi bi-x-lg" />
                          </button>
                        )}
                        <button onClick={() => { setEditing(item); setShowModal(true); }} style={btnStyle("ghost", true)} title="Edit">
                          <i className="bi bi-pencil" />
                        </button>
                        <button onClick={() => confirmDelete(item)} style={{ ...btnStyle("ghost", true), color: "var(--danger)" }} title="Delete">
                          <i className="bi bi-trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <TestimonialModal
          initial={editing}
          onClose={handleClose}
          onSaved={handleSaved}
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
