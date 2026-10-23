import { useEffect, useState, useRef } from "react";
import {
  getHeroSlides,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  uploadHeroImage,
  getHomepageContent,
  updateHomepageContent,
  uploadHomepageAboutImg,
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

// ── TASK 2: Stat category → icon mapping (centralized) ────────
// Changing this map automatically updates both admin preview and public site.
const STAT_CATEGORIES = [
  { value: "Students", label: "Students",  icon: "bi-people-fill" },
  { value: "Events",   label: "Events",    icon: "bi-calendar-event-fill" },
  { value: "Faculty",  label: "Faculty",   icon: "bi-mortarboard-fill" },
  { value: "Courses",  label: "Courses",   icon: "bi-book-fill" },
];

function iconForCategory(category) {
  const match = STAT_CATEGORIES.find(c => c.value === category);
  return match ? match.icon : "bi-star-fill";
}

// ── SECTION wrapper — defined at MODULE LEVEL (not inside render)
// FIX: Previously defined inside HomepageContentTab, causing React to treat
// it as a new component on every render, which unmounted/remounted all
// child inputs and caused focus loss after every keystroke.
const Section = ({ title, icon, children }) => (
  <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: 24, marginBottom: 20 }}>
    <h4 style={{ margin: "0 0 18px 0", color: "var(--navy)", display: "flex", alignItems: "center", gap: 8 }}>
      <i className={`bi ${icon}`} style={{ color: "var(--primary)" }} /> {title}
    </h4>
    {children}
  </div>
);

// ─────────────────────────────────────────────────────────────
// TAB 1: Hero Slides
// ─────────────────────────────────────────────────────────────
const EMPTY_SLIDE = { title: "", subtitle: "", description: "", buttonText: "", buttonUrl: "", isActive: true };

const SlideModal = ({ initial, onClose, onSaved, showToast }) => {
  // FIX: Map backend `status` field to frontend `isActive` boolean on load
  const [form, setForm] = useState(initial ? {
    title: initial.title || "",
    subtitle: initial.subtitle || "",
    description: initial.description || "",
    buttonText: initial.buttonText || "",
    buttonUrl: initial.buttonUrl || "",
    // backend stores "active"/"inactive", frontend uses boolean isActive
    isActive: initial.status ? initial.status === "active" : (initial.isActive !== false),
  } : { ...EMPTY_SLIDE });
  const [saving, setSaving] = useState(false);
  const [imgFile, setImgFile] = useState(null);
  const [imgPreview, setImgPreview] = useState(initial?.image?.url || initial?.imageUrl || null);
  const fileRef = useRef();

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const handleImg = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImgFile(file);
    setImgPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // FIX: Convert frontend isActive boolean → backend status string
      const payload = {
        title: form.title,
        subtitle: form.subtitle,
        description: form.description,
        buttonText: form.buttonText,
        buttonUrl: form.buttonUrl,
        status: form.isActive ? "active" : "inactive",
      };
      let saved;
      if (initial?._id) {
        saved = await updateHeroSlide(initial._id, payload);
        showToast("Slide updated", "success");
      } else {
        saved = await createHeroSlide(payload);
        showToast("Slide created", "success");
      }
      const id = saved?.data?._id || initial?._id;
      if (imgFile && id) {
        const fd = new FormData();
        fd.append("image", imgFile);
        await uploadHeroImage(id, fd);
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
        width: "100%", maxWidth: 560, boxShadow: "var(--shadow-lg)", maxHeight: "90vh", overflowY: "auto",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, color: "var(--navy)" }}>{initial ? "Edit Slide" : "Add Slide"}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "1.4rem", cursor: "pointer", color: "var(--text-muted)" }}>
            <i className="bi bi-x" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Title</label>
            <input value={form.title} onChange={set("title")} placeholder="Hero slide title" style={inputStyle} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Subtitle</label>
            <input value={form.subtitle} onChange={set("subtitle")} placeholder="Subtitle text" style={inputStyle} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Description</label>
            <textarea value={form.description} onChange={set("description")} rows={3} placeholder="Slide description…" style={{ ...inputStyle, resize: "vertical" }} />
          </div>
          <div className="modal-form-grid" style={{ gap: 14, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Button Text</label>
              <input value={form.buttonText} onChange={set("buttonText")} placeholder="e.g. Learn More" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Button URL</label>
              <input value={form.buttonUrl} onChange={set("buttonUrl")} placeholder="/admissions" style={inputStyle} />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Slide Image</label>
            {imgPreview && (
              <img src={imgPreview} alt="preview" style={{ width: "100%", height: 150, objectFit: "cover", borderRadius: "var(--radius-sm)", marginBottom: 8 }} />
            )}
            <input type="file" accept="image/*" ref={fileRef} onChange={handleImg} style={{ display: "none" }} />
            <button type="button" onClick={() => fileRef.current.click()} style={btnStyle("ghost", true)}>
              <i className="bi bi-upload" /> {imgPreview ? "Change Image" : "Upload Image"}
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <input
              type="checkbox"
              id="slide-active"
              checked={form.isActive}
              onChange={set("isActive")}
              style={{ width: 16, height: 16, cursor: "pointer" }}
            />
            <label htmlFor="slide-active" style={{ cursor: "pointer", fontSize: "0.9rem", color: "var(--navy)", fontWeight: 500 }}>
              Active (show on homepage)
            </label>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={btnStyle("ghost")}>Cancel</button>
            <button type="submit" disabled={saving} style={btnStyle("primary")}>
              {saving ? <><i className="bi bi-hourglass-split" /> Saving…</> : <><i className="bi bi-check2" /> Save Slide</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Hero Slides Tab ───────────────────────────────────────────
function HeroSlidesTab({ showToast }) {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [toggling, setToggling] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const data = await getHeroSlides();
      setSlides(safeArray(data));
    } catch {
      showToast("Failed to load hero slides", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleClose = () => { setShowModal(false); setEditing(null); };
  const handleSaved = () => { handleClose(); load(); };

  const confirmDelete = (slide) => {
    setConfirm({
      message: `Delete slide "${slide.title || "Untitled"}"?`,
      onConfirm: async () => {
        setConfirm(null);
        try {
          await deleteHeroSlide(slide._id);
          showToast("Slide deleted", "success");
          load();
        } catch { showToast("Delete failed", "error"); }
      },
    });
  };

  const toggleActive = async (slide) => {
    setToggling(t => ({ ...t, [slide._id]: true }));
    try {
      // FIX: send status string, not isActive boolean
      const newStatus = slide.status === "active" ? "inactive" : "active";
      await updateHeroSlide(slide._id, { status: newStatus });
      showToast(`Slide ${newStatus === "active" ? "activated" : "deactivated"}`, "success");
      load();
    } catch { showToast("Toggle failed", "error"); }
    finally { setToggling(t => ({ ...t, [slide._id]: false })); }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button onClick={() => { setEditing(null); setShowModal(true); }} style={btnStyle("primary")}>
          <i className="bi bi-plus-lg" /> Add Slide
        </button>
      </div>

      {loading ? (
        <div className="loading-state"><div className="spinner" /><p>Loading slides…</p></div>
      ) : slides.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-image" style={{ fontSize: "2.5rem", color: "var(--text-muted)", display: "block", marginBottom: 12 }} />
          <p>No hero slides yet.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {slides.map((slide) => {
            const isActive = slide.status === "active";
            return (
              <div key={slide._id} style={{
                background: "#fff", border: "1.5px solid var(--border)",
                borderRadius: "var(--radius-md)", padding: "14px 18px",
                display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
              }}>
                {/* Image */}
                <div style={{ width: 90, height: 60, borderRadius: "var(--radius-sm)", overflow: "hidden", background: "var(--bg-soft-blue)", flexShrink: 0 }}>
                  {slide.image?.url ? (
                    <img src={slide.image.url} alt={slide.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)" }}>
                      <i className="bi bi-image" />
                    </div>
                  )}
                </div>
                {/* Info */}
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontWeight: 700, color: "var(--navy)", fontSize: "0.95rem" }}>{slide.title || "—"}</div>
                  <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{slide.subtitle}</div>
                  {slide.buttonText && (
                    <div style={{ fontSize: "0.78rem", color: "var(--primary)", marginTop: 2 }}>
                      <i className="bi bi-link-45deg" /> {slide.buttonText} → {slide.buttonUrl}
                    </div>
                  )}
                </div>
                {/* Status toggle */}
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", flexShrink: 0 }}>
                  <div
                    onClick={() => !toggling[slide._id] && toggleActive(slide)}
                    style={{
                      width: 42, height: 24, borderRadius: "var(--radius-pill)", cursor: "pointer",
                      background: isActive ? "var(--success)" : "var(--border)",
                      position: "relative", transition: "background 0.2s",
                    }}
                  >
                    <div style={{
                      position: "absolute", top: 3, left: isActive ? 20 : 3,
                      width: 18, height: 18, borderRadius: "50%", background: "#fff",
                      transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    }} />
                  </div>
                  <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                    {isActive ? "Active" : "Inactive"}
                  </span>
                </label>
                {/* Actions */}
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => { setEditing(slide); setShowModal(true); }} style={btnStyle("ghost", true)} title="Edit">
                    <i className="bi bi-pencil" />
                  </button>
                  <button onClick={() => confirmDelete(slide)} style={{ ...btnStyle("ghost", true), color: "var(--danger)" }} title="Delete">
                    <i className="bi bi-trash" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <SlideModal initial={editing} onClose={handleClose} onSaved={handleSaved} showToast={showToast} />
      )}
      {confirm && (
        <ConfirmDialog message={confirm.message} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TAB 2: Homepage Content
// ─────────────────────────────────────────────────────────────

// FIX: Use correct backend field names for stats (countStats) and why section
// (whyUsHeading / whyUsDescription). Previous code used stats/whyHeading/whyDescription
// which never matched the MongoDB schema, so nothing was ever saved or loaded.
const EMPTY_STAT = { category: "Students", value: "", label: "", suffix: "+" };
const EMPTY_CONTENT = {
  aboutHeading: "",
  aboutSubheading: "",
  aboutDescription: "",
  aboutPoints: [],
  whyUsHeading: "",
  whyUsDescription: "",
  countStats: [],
  ctaHeading: "",
  ctaDescription: "",
  ctaButtonText: "",
  ctaButtonUrl: "",
};

function HomepageContentTab({ showToast }) {
  const [form, setForm] = useState({ ...EMPTY_CONTENT });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aboutImgFile, setAboutImgFile] = useState(null);
  const [aboutImgPreview, setAboutImgPreview] = useState(null);
  const [uploadingImg, setUploadingImg] = useState(false);
  const imgRef = useRef();

  const load = async () => {
    setLoading(true);
    try {
      const data = await getHomepageContent();
      if (data) {
        setForm({
          aboutHeading:    data.aboutHeading    || "",
          aboutSubheading: data.aboutSubheading || "",
          aboutDescription:data.aboutDescription|| "",
          aboutPoints:     Array.isArray(data.aboutPoints)  ? data.aboutPoints  : [],
          // FIX: correct field names matching the Mongoose schema
          whyUsHeading:    data.whyUsHeading    || "",
          whyUsDescription:data.whyUsDescription|| "",
          // FIX: backend field is countStats, not stats
          countStats: Array.isArray(data.countStats) ? data.countStats.map(s => ({
            // Normalize legacy stats: if category missing, derive from icon or default to Students
            category: s.category || legacyIconToCategory(s.icon) || "Students",
            value:    s.value ?? "",
            label:    s.label   || "",
            suffix:   s.suffix  || "+",
          })) : [],
          ctaHeading:    data.ctaHeading    || "",
          ctaDescription:data.ctaDescription|| "",
          ctaButtonText: data.ctaButtonText || "",
          ctaButtonUrl:  data.ctaButtonUrl  || "",
        });
        setAboutImgPreview(data.aboutImage?.url || null);
      }
    } catch {
      showToast("Failed to load homepage content", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // FIX: The set helper returns an onChange handler.
  // It is defined here (not inside render) so it is stable across renders.
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  // About points
  const addPoint    = () => setForm(f => ({ ...f, aboutPoints: [...f.aboutPoints, ""] }));
  const setPoint    = (idx, val) => setForm(f => { const pts = [...f.aboutPoints]; pts[idx] = val; return { ...f, aboutPoints: pts }; });
  const removePoint = (idx)      => setForm(f => ({ ...f, aboutPoints: f.aboutPoints.filter((_, i) => i !== idx) }));

  // Stats
  const addStat    = () => setForm(f => ({ ...f, countStats: [...f.countStats, { ...EMPTY_STAT }] }));
  const setStat    = (idx, k, val) => setForm(f => {
    const countStats = f.countStats.map((s, i) => i === idx ? { ...s, [k]: val } : s);
    return { ...f, countStats };
  });
  const removeStat = (idx) => setForm(f => ({ ...f, countStats: f.countStats.filter((_, i) => i !== idx) }));

  // About image
  const handleAboutImg = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAboutImgFile(file);
    setAboutImgPreview(URL.createObjectURL(file));
  };

  const doUploadAboutImg = async () => {
    if (!aboutImgFile) return;
    setUploadingImg(true);
    try {
      const fd = new FormData();
      fd.append("image", aboutImgFile);
      await uploadHomepageAboutImg(fd);
      showToast("About image uploaded", "success");
      setAboutImgFile(null);
    } catch {
      showToast("Image upload failed", "error");
    } finally {
      setUploadingImg(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // FIX: Build payload with correct backend field names.
      // Also derive icon from category before sending so the public site can display it.
      const payload = {
        ...form,
        countStats: form.countStats.map(s => ({
          category: s.category,
          icon:     iconForCategory(s.category), // derive icon server-side from category
          value:    Number(s.value) || 0,
          label:    s.label,
          suffix:   s.suffix || "+",
        })),
      };
      await updateHomepageContent(payload);
      if (aboutImgFile) await doUploadAboutImg();
      showToast("Homepage content saved", "success");
    } catch (err) {
      showToast(err?.response?.data?.message || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-state"><div className="spinner" /><p>Loading content…</p></div>;

  // Section is now defined at MODULE LEVEL above — do not redeclare it here.

  return (
    <form onSubmit={handleSave}>
      {/* ── About Section ── */}
      <Section title="About Section" icon="bi-info-circle">
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>About Heading</label>
          <input value={form.aboutHeading} onChange={set("aboutHeading")} placeholder="e.g. About CNPS" style={inputStyle} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>About Subheading</label>
          <input value={form.aboutSubheading} onChange={set("aboutSubheading")} placeholder="Subheading text" style={inputStyle} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>About Description</label>
          <textarea value={form.aboutDescription} onChange={set("aboutDescription")} rows={4} style={{ ...inputStyle, resize: "vertical" }} />
        </div>
        {/* About Image */}
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>About Image</label>
          {aboutImgPreview && (
            <img src={aboutImgPreview} alt="about" style={{ width: 200, height: 130, objectFit: "cover", borderRadius: "var(--radius-sm)", marginBottom: 8, display: "block" }} />
          )}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input type="file" accept="image/*" ref={imgRef} onChange={handleAboutImg} style={{ display: "none" }} />
            <button type="button" onClick={() => imgRef.current.click()} style={btnStyle("ghost", true)}>
              <i className="bi bi-upload" /> {aboutImgPreview ? "Change" : "Upload"}
            </button>
            {aboutImgFile && (
              <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                (Will be saved with form)
              </span>
            )}
          </div>
        </div>
        {/* About Points */}
        <div>
          <label style={labelStyle}>About Points (bullet points)</label>
          {form.aboutPoints.map((pt, idx) => (
            <div key={idx} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input
                value={pt}
                onChange={e => setPoint(idx, e.target.value)}
                placeholder={`Point ${idx + 1}`}
                style={{ ...inputStyle, flex: 1 }}
              />
              <button type="button" onClick={() => removePoint(idx)} style={{ ...btnStyle("ghost", true), color: "var(--danger)", flexShrink: 0 }}>
                <i className="bi bi-dash" />
              </button>
            </div>
          ))}
          <button type="button" onClick={addPoint} style={btnStyle("ghost", true)}>
            <i className="bi bi-plus" /> Add Point
          </button>
        </div>
      </Section>

      {/* ── Why Choose Us ── */}
      <Section title="Why Choose Us" icon="bi-award">
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Heading</label>
          {/* FIX: field was whyHeading, now whyUsHeading to match schema */}
          <input value={form.whyUsHeading} onChange={set("whyUsHeading")} placeholder="e.g. Why Choose CNPS?" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Description</label>
          {/* FIX: field was whyDescription, now whyUsDescription to match schema */}
          <textarea value={form.whyUsDescription} onChange={set("whyUsDescription")} rows={4} style={{ ...inputStyle, resize: "vertical" }} />
        </div>
      </Section>

      {/* ── Statistics ── */}
      <Section title="Statistics / Count Stats" icon="bi-bar-chart-line">
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 14, marginTop: 0 }}>
          Select a category — the icon is assigned automatically.
        </p>
        {form.countStats.map((stat, idx) => (
          <div key={idx} style={{ display: "grid", gridTemplateColumns: "2.5fr 1.5fr 2fr 1fr auto", gap: 10, marginBottom: 12, alignItems: "end", padding: "12px 14px", background: "var(--bg-section)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
            {/* Category dropdown — replaces manual icon entry */}
            <div>
              {idx === 0 && <label style={{ ...labelStyle, marginBottom: 4 }}>Category</label>}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <i className={`bi ${iconForCategory(stat.category)}`} style={{ fontSize: "1.1rem", color: "var(--primary)", flexShrink: 0 }} title={`Icon: ${iconForCategory(stat.category)}`} />
                <select
                  value={stat.category}
                  onChange={e => setStat(idx, "category", e.target.value)}
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  {STAT_CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>
            {/* Value */}
            <div>
              {idx === 0 && <label style={{ ...labelStyle, marginBottom: 4 }}>Value</label>}
              <input
                value={stat.value}
                onChange={e => setStat(idx, "value", e.target.value)}
                placeholder="1200"
                style={inputStyle}
                type="number"
                min="0"
              />
            </div>
            {/* Label */}
            <div>
              {idx === 0 && <label style={{ ...labelStyle, marginBottom: 4 }}>Label</label>}
              <input value={stat.label} onChange={e => setStat(idx, "label", e.target.value)} placeholder="Students Enrolled" style={inputStyle} />
            </div>
            {/* Suffix */}
            <div>
              {idx === 0 && <label style={{ ...labelStyle, marginBottom: 4 }}>Suffix</label>}
              <input value={stat.suffix} onChange={e => setStat(idx, "suffix", e.target.value)} placeholder="+" style={inputStyle} />
            </div>
            <button type="button" onClick={() => removeStat(idx)} style={{ ...btnStyle("ghost", true), color: "var(--danger)", marginTop: idx === 0 ? 22 : 0 }}>
              <i className="bi bi-trash" />
            </button>
          </div>
        ))}
        <button type="button" onClick={addStat} style={btnStyle("ghost", true)}>
          <i className="bi bi-plus" /> Add Stat
        </button>
      </Section>

      {/* ── CTA Section ── */}
      <Section title="CTA (Call to Action)" icon="bi-megaphone">
        <div className="modal-form-grid" style={{ gap: 14, marginBottom: 14 }}>
          <div>
            <label style={labelStyle}>CTA Heading</label>
            <input value={form.ctaHeading} onChange={set("ctaHeading")} placeholder="e.g. Ready to Enroll?" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>CTA Description</label>
            <input value={form.ctaDescription} onChange={set("ctaDescription")} placeholder="Short CTA description" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Button Text</label>
            <input value={form.ctaButtonText} onChange={set("ctaButtonText")} placeholder="e.g. Apply Now" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Button URL</label>
            <input value={form.ctaButtonUrl} onChange={set("ctaButtonUrl")} placeholder="/admissions" style={inputStyle} />
          </div>
        </div>
      </Section>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button type="submit" disabled={saving} style={{ ...btnStyle("primary"), minWidth: 160 }}>
          {saving ? <><i className="bi bi-hourglass-split" /> Saving…</> : <><i className="bi bi-check2-all" /> Save All Changes</>}
        </button>
      </div>
    </form>
  );
}

// ── Utility: derive category from legacy icon string ──────────
function legacyIconToCategory(icon) {
  if (!icon) return null;
  const lc = icon.toLowerCase();
  if (lc.includes("people") || lc.includes("person") || lc.includes("student") || lc.includes("mortarboard")) return "Students";
  if (lc.includes("calendar") || lc.includes("event"))  return "Events";
  if (lc.includes("teacher") || lc.includes("graduation")) return "Faculty";
  if (lc.includes("book") || lc.includes("course"))     return "Courses";
  return null;
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
const TABS = [
  { key: "slides",  label: "Hero Slides",       icon: "bi-images" },
  { key: "content", label: "Homepage Content",  icon: "bi-layout-text-sidebar-reverse" },
];

export default function AdminHomepage() {
  const [activeTab, setActiveTab] = useState("slides");
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "info") => setToast({ msg, type });

  return (
    <div style={{ padding: "24px 28px" }}>
      <AdminPageHeader title="Homepage Management" description="Manage hero slides and homepage content sections" />

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "2px solid var(--border)", marginBottom: 24 }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "10px 22px",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "0.92rem",
              fontWeight: 600,
              color: activeTab === tab.key ? "var(--primary)" : "var(--text-secondary)",
              borderBottom: activeTab === tab.key ? "2.5px solid var(--primary)" : "2.5px solid transparent",
              marginBottom: -2,
              display: "flex",
              alignItems: "center",
              gap: 7,
              transition: "color 0.2s",
            }}
          >
            <i className={`bi ${tab.icon}`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "slides"  && <HeroSlidesTab showToast={showToast} />}
      {activeTab === "content" && <HomepageContentTab showToast={showToast} />}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
