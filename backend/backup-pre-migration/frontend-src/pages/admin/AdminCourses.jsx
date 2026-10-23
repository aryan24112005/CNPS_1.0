import { useState, useEffect, useRef } from "react";
import {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  uploadCourseImage,
  uploadCourseFeePdf,
  uploadCourseTimetable,
} from "../../services/adminService";

// ── Helpers ────────────────────────────────────────────────────────────────
const CATEGORIES = ["Pre-Primary", "Primary", "Secondary", "Higher Secondary", "Other"];

const EMPTY_FORM = {
  title: "",
  category: "",
  className: "",
  shortDescription: "",
  description: "",  // FIX: was fullDescription — backend model field is `description`
  classTeacher: "",
  timing: "",
  status: "active",  // FIX: was isActive boolean — backend uses status enum
  subjects: [],
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

// ── Subjects Input ─────────────────────────────────────────────────────────
function SubjectsInput({ subjects, onChange }) {
  const [inputVal, setInputVal] = useState("");

  function addSubject() {
    const val = inputVal.trim();
    if (!val) return;
    // support comma-separated input
    const parts = val.split(",").map((s) => s.trim()).filter(Boolean);
    const next = [...new Set([...subjects, ...parts])];
    onChange(next);
    setInputVal("");
  }

  function removeSubject(idx) {
    onChange(subjects.filter((_, i) => i !== idx));
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input
          style={{
            flex: 1,
            padding: "8px 12px",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            fontSize: "0.9rem",
            outline: "none",
            background: "var(--bg-white)",
            color: "var(--text-main)",
          }}
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSubject(); } }}
          placeholder="Add subject (press Enter or comma-separate)"
        />
        <button type="button" className="btn btn-outline" onClick={addSubject}>
          Add
        </button>
      </div>
      {subjects.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {subjects.map((s, i) => (
            <span
              key={i}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "3px 10px",
                background: "var(--bg-soft-blue)",
                color: "var(--primary)",
                borderRadius: 999,
                fontSize: "0.82rem",
                fontWeight: 500,
              }}
            >
              {s}
              <button
                type="button"
                onClick={() => removeSubject(i)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--primary)",
                  padding: 0,
                  lineHeight: 1,
                  fontSize: "0.8rem",
                }}
              >
                <i className="bi bi-x" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Books Section ──────────────────────────────────────────────────────────
function BooksSection({ books, onChange }) {
  const [name, setName] = useState("");
  const [publisher, setPublisher] = useState("");
  const [price, setPrice] = useState("");

  function addBook() {
    if (!name.trim()) return;
    onChange([...books, { name: name.trim(), publisher: publisher.trim(), price: price.trim() }]);
    setName(""); setPublisher(""); setPrice("");
  }

  function removeBook(idx) {
    onChange(books.filter((_, i) => i !== idx));
  }

  const inputStyle = {
    padding: "7px 10px",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    fontSize: "0.85rem",
    outline: "none",
    background: "var(--bg-white)",
    color: "var(--text-main)",
  };

  return (
    <div>
      <div className="book-add-row">
        <div>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 2 }}>Book Name</div>
          <input style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Mathematics" />
        </div>
        <div>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 2 }}>Publisher</div>
          <input style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }} value={publisher} onChange={(e) => setPublisher(e.target.value)} placeholder="Publisher" />
        </div>
        <div>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 2 }}>Price (₹)</div>
          <input style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" type="number" min="0" />
        </div>
        <button type="button" className="btn btn-outline" style={{ padding: "7px 12px" }} onClick={addBook}>
          <i className="bi bi-plus-lg" />
        </button>
      </div>
      {books.length > 0 && (
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
          {books.map((b, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px",
                borderBottom: i < books.length - 1 ? "1px solid var(--border)" : "none",
                background: i % 2 === 0 ? "var(--bg-white)" : "var(--bg-section)",
              }}
            >
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 500, fontSize: "0.88rem" }}>{b.name}</span>
                {b.publisher && <span style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginLeft: 8 }}>{b.publisher}</span>}
              </div>
              {b.price && <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginRight: 12 }}>₹{b.price}</span>}
              <button type="button" onClick={() => removeBook(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)", fontSize: "0.9rem" }}>
                <i className="bi bi-x-circle" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Upload Buttons ─────────────────────────────────────────────────────────
function UploadSection({ courseId, existingImageUrl, addToast, onDone }) {
  const imgRef = useRef();
  const feeRef = useRef();
  const ttRef = useRef();
  const [uploading, setUploading] = useState({});
  // FIX: show existing image URL; update preview after new upload
  const [imgPreview, setImgPreview] = useState(existingImageUrl || null);

  async function upload(type, file, fn) {
    if (!file || !courseId) return;
    setUploading((prev) => ({ ...prev, [type]: true }));
    try {
      const fd = new FormData();
      if (type === "image") {
        fd.append("image", file);
      } else {
        fd.append("file", file);
      }
      await fn(courseId, fd);
      addToast(`${type === "image" ? "Image" : type === "feePdf" ? "Fee PDF" : "Timetable"} uploaded.`, "success");
      onDone();
    } catch (err) {
      addToast(err?.response?.data?.message || "Upload failed.", "error");
    } finally {
      setUploading((prev) => ({ ...prev, [type]: false }));
    }
  }

  return (
    <div style={{ padding: "16px", background: "var(--bg-section)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", marginTop: 8 }}>
      <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 12 }}>
        <i className="bi bi-cloud-upload" style={{ marginRight: 6 }} />
        Uploads
      </div>
      {/* FIX: show existing course image preview */}
      {imgPreview && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 4 }}>Current Image:</div>
          <img src={imgPreview} alt="Course" style={{ width: 120, height: 80, objectFit: "cover", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }} />
        </div>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {/* Cover Image */}
        <div>
          <input type="file" accept="image/*" ref={imgRef} style={{ display: "none" }}
            onChange={(e) => {
              const f = e.target.files[0];
              if (f) setImgPreview(URL.createObjectURL(f));
              upload("image", f, uploadCourseImage);
            }} />
          <button type="button" className="btn btn-outline" style={{ fontSize: "0.82rem" }}
            onClick={() => imgRef.current?.click()} disabled={uploading.image}>
            {uploading.image
              ? <><span className="spinner" style={{ width: 12, height: 12, marginRight: 5 }} />Uploading…</>
              : <><i className="bi bi-image" style={{ marginRight: 5 }} />{imgPreview ? "Change Image" : "Cover Image"}</>}
          </button>
        </div>
        {/* Fee PDF */}
        <div>
          <input type="file" accept="application/pdf" ref={feeRef} style={{ display: "none" }}
            onChange={(e) => upload("feePdf", e.target.files[0], uploadCourseFeePdf)} />
          <button type="button" className="btn btn-outline" style={{ fontSize: "0.82rem" }}
            onClick={() => feeRef.current?.click()} disabled={uploading.feePdf}>
            {uploading.feePdf
              ? <><span className="spinner" style={{ width: 12, height: 12, marginRight: 5 }} />Uploading…</>
              : <><i className="bi bi-file-earmark-pdf" style={{ marginRight: 5 }} />Fee PDF</>}
          </button>
        </div>
        {/* Timetable */}
        <div>
          <input type="file" accept="application/pdf" ref={ttRef} style={{ display: "none" }}
            onChange={(e) => upload("timetable", e.target.files[0], uploadCourseTimetable)} />
          <button type="button" className="btn btn-outline" style={{ fontSize: "0.82rem" }}
            onClick={() => ttRef.current?.click()} disabled={uploading.timetable}>
            {uploading.timetable
              ? <><span className="spinner" style={{ width: 12, height: 12, marginRight: 5 }} />Uploading…</>
              : <><i className="bi bi-calendar3" style={{ marginRight: 5 }} />Timetable PDF</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Course Modal ───────────────────────────────────────────────────────────
function CourseModal({ course, onClose, onSaved, addToast }) {
  const [form, setForm] = useState(
    course
      ? {
          title: course.title || "",
          category: course.category || "",
          className: course.className || "",
          shortDescription: course.shortDescription || "",
          // FIX: backend field is `description`, not `fullDescription`
          description: course.description || "",
          classTeacher: course.classTeacher || "",
          timing: course.timing || "",
          // FIX: backend uses status enum "active"/"inactive", not isActive boolean
          status: course.status || "active",
          subjects: Array.isArray(course.subjects) ? course.subjects : [],
          books: Array.isArray(course.books) ? course.books : [],
        }
      : { ...EMPTY_FORM, subjects: [], books: [] }
  );
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState(course?._id || null);

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }
  async function handleSave(e) {
    e.preventDefault();
    if (!form.title.trim()) {
      addToast("Course title is required.", "error");
      return;
    }
    setSaving(true);
    try {
      let result;
      if (course) {
        await updateCourse(course._id, form);
        setSavedId(course._id);
        addToast("Course updated.", "success");
      } else {
        result = await createCourse(form);
        const newId = result.data?._id || result._id;
        setSavedId(newId);
        addToast("Course created. You can now upload files.", "success");
      }
      onSaved();
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to save course.", "error");
    } finally {
      setSaving(false);
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
      <div className="modal modal-lg" style={{ maxWidth: 720 }}>
        <div className="modal-header">
          <h3>{course ? "Edit Course" : "Add Course"}</h3>
          <button className="modal-close" onClick={onClose}>
            <i className="bi bi-x-lg" />
          </button>
        </div>
        <form onSubmit={handleSave}>
          <div className="modal-body" style={{ maxHeight: "65vh", overflowY: "auto" }}>
            <div className="modal-form-grid">
              {/* Title */}
              <div style={{ ...groupStyle, gridColumn: "1/-1" }}>
                <label style={labelStyle}>
                  Course Title <span style={{ color: "var(--danger)" }}>*</span>
                </label>
                <input style={inputStyle} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Course title" required />
              </div>
              {/* Category */}
              <div style={groupStyle}>
                <label style={labelStyle}>Category</label>
                <select
                  style={{ ...inputStyle, cursor: "pointer" }}
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                >
                  <option value="">Select category…</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {/* Class Name */}
              <div style={groupStyle}>
                <label style={labelStyle}>Class Name</label>
                <input style={inputStyle} value={form.className} onChange={(e) => set("className", e.target.value)} placeholder="e.g., Nursery, Class 10" />
              </div>
              {/* Class Teacher */}
              <div style={groupStyle}>
                <label style={labelStyle}>Class Teacher</label>
                <input style={inputStyle} value={form.classTeacher} onChange={(e) => set("classTeacher", e.target.value)} placeholder="Teacher name" />
              </div>
              {/* Timing */}
              <div style={groupStyle}>
                <label style={labelStyle}>Timing</label>
                <input style={inputStyle} value={form.timing} onChange={(e) => set("timing", e.target.value)} placeholder="e.g., 8:00 AM – 2:00 PM" />
              </div>
              {/* Short Description */}
              <div style={{ ...groupStyle, gridColumn: "1/-1" }}>
                <label style={labelStyle}>Short Description</label>
                <textarea rows={2} style={{ ...inputStyle, resize: "vertical" }} value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} placeholder="Brief overview (shown in cards)" />
              </div>
              {/* Full Description */}
              <div style={{ ...groupStyle, gridColumn: "1/-1" }}>
                <label style={labelStyle}>Full Description</label>
                {/* FIX: field was fullDescription — backend model uses `description` */}
                <textarea rows={4} style={{ ...inputStyle, resize: "vertical" }} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Detailed course description" />
              </div>
              {/* Subjects */}
              <div style={{ ...groupStyle, gridColumn: "1/-1" }}>
                <label style={{ ...labelStyle, marginBottom: 8 }}>Subjects</label>
                <SubjectsInput subjects={form.subjects} onChange={(s) => set("subjects", s)} />
              </div>
              {/* Books */}
              <div style={{ ...groupStyle, gridColumn: "1/-1" }}>
                <label style={{ ...labelStyle, marginBottom: 8 }}>Books / Study Materials</label>
                <BooksSection books={form.books || []} onChange={(b) => set("books", b)} />
              </div>
              {/* Status */}
              <div style={{ ...groupStyle, gridColumn: "1/-1", display: "flex", alignItems: "center", gap: 12 }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Status</label>
                {/* FIX: toggle between "active"/"inactive" strings, not true/false boolean */}
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
            </div>

            {/* Uploads — only after save */}
            {savedId && (
              <UploadSection courseId={savedId} existingImageUrl={course?.image?.url || null} addToast={addToast} onDone={onSaved} />
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving
                ? <><span className="spinner" style={{ width: 14, height: 14, marginRight: 6 }} />Saving…</>
                : course ? "Save Changes" : "Create Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
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

  async function loadCourses() {
    try {
      const data = await getCourses();
      setCourses(safeArray(data));
    } catch {
      addToast("Failed to load courses.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadCourses(); }, []);

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteCourse(deleteTarget._id);
      addToast("Course deleted.", "success");
      setDeleteTarget(null);
      loadCourses();
    } catch (err) {
      addToast(err?.response?.data?.message || "Delete failed.", "error");
      setDeleteTarget(null);
    }
  }

  const filtered = courses.filter((c) =>
    c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.category?.toLowerCase().includes(search.toLowerCase())
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
          message={`Delete course "${deleteTarget.title}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {showModal && (
        <CourseModal
          course={editTarget}
          onClose={() => { setShowModal(false); setEditTarget(null); }}
          onSaved={() => loadCourses()}
          addToast={addToast}
        />
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700 }}>Courses</h2>
          <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Manage classes, courses, subjects, and study materials.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditTarget(null); setShowModal(true); }}>
          <i className="bi bi-plus-lg" style={{ marginRight: 6 }} />
          Add Course
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--bg-white)", padding: "0 12px", maxWidth: 320, width: "100%" }}>
          <i className="bi bi-search" style={{ color: "var(--text-muted)", marginRight: 8 }} />
          <input
            style={{ border: "none", outline: "none", padding: "9px 0", fontSize: "0.9rem", background: "transparent", width: "100%", color: "var(--text-main)" }}
            placeholder="Search by title or category…"
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
                <th style={thStyle}>Category</th>
                <th style={thStyle}>Status</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ ...tdStyle, textAlign: "center", padding: "40px 16px" }}>
                    <div className="empty-state">
                      <i className="bi bi-book" style={{ fontSize: "2rem", color: "var(--text-muted)", display: "block", marginBottom: 8 }} />
                      <p style={{ color: "var(--text-muted)" }}>
                        {search ? "No courses match your search." : "No courses added yet."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr
                    key={c._id}
                    style={{ transition: "background 0.15s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-soft-blue)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                  >
                    <td style={tdStyle}>
                      {/* FIX: c.image is {url, publicId} object, not a plain URL string */}
                      {c.image?.url ? (
                        <img src={c.image.url} alt={c.title} style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 6, display: "block" }} />
                      ) : (
                        <div style={{ width: 48, height: 48, borderRadius: 6, background: "var(--bg-section)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "1.2rem" }}>
                          <i className="bi bi-book" />
                        </div>
                      )}
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 600 }}>{c.title}</div>
                      {c.className && <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{c.className}</div>}
                    </td>
                    <td style={{ ...tdStyle, color: "var(--text-secondary)" }}>{c.category || "—"}</td>
                    <td style={tdStyle}><StatusBadge active={c.status === "active"} /></td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <button className="btn btn-outline" style={{ padding: "5px 12px", fontSize: "0.82rem" }}
                          onClick={() => { setEditTarget(c); setShowModal(true); }}>
                          <i className="bi bi-pencil" />
                        </button>
                        <button className="btn btn-danger" style={{ padding: "5px 12px", fontSize: "0.82rem" }}
                          onClick={() => setDeleteTarget(c)}>
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
              {filtered.length} of {courses.length} course{courses.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      )}
    </>
  );
}
