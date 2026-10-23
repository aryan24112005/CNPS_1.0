import { useEffect, useState, useRef } from "react";
import { getMedia, uploadMedia, deleteMedia } from "../../services/adminService";

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

// ── Lightbox ──────────────────────────────────────────────────
const Lightbox = ({ src, name, onClose }) => (
  <div
    style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      zIndex: 9500, padding: 20,
    }}
    onClick={onClose}
  >
    <button
      onClick={onClose}
      style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", borderRadius: "50%", width: 40, height: 40, fontSize: "1.2rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <i className="bi bi-x-lg" />
    </button>
    <img
      src={src}
      alt={name}
      style={{ maxWidth: "90vw", maxHeight: "80vh", objectFit: "contain", borderRadius: "var(--radius-sm)", boxShadow: "var(--shadow-lg)" }}
      onClick={e => e.stopPropagation()}
    />
    <p style={{ color: "#fff", marginTop: 12, fontSize: "0.9rem", opacity: 0.8 }}>{name}</p>
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
  };
  return { ...base, ...(variants[variant] || variants.primary) };
};

const safeArray = (d) => (Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : []);

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const formatSize = (bytes) => {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const isImage = (item) => {
  const mime = (item.mimeType || item.type || "").toLowerCase();
  const url = (item.url || "").toLowerCase();
  return mime.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp|svg)$/.test(url);
};

const isPdf = (item) => {
  const mime = (item.mimeType || item.type || "").toLowerCase();
  const url = (item.url || "").toLowerCase();
  return mime === "application/pdf" || url.endsWith(".pdf");
};

const fileIcon = (item) => {
  if (isImage(item)) return "bi-file-image";
  if (isPdf(item)) return "bi-file-earmark-pdf";
  return "bi-file-earmark";
};

const fileIconColor = (item) => {
  if (isImage(item)) return "var(--primary)";
  if (isPdf(item)) return "var(--danger)";
  return "var(--text-muted)";
};

// ── MAIN COMPONENT ────────────────────────────────────────────
export default function AdminMedia() {
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [lightbox, setLightbox] = useState(null); // { src, name }
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  // FIX: add pagination state — backend limits to 30 per page
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const fileRef = useRef();

  const showToast = (msg, type = "info") => setToast({ msg, type });

  const load = async (p = 1) => {
    setLoading(true);
    try {
      // FIX: pass page param so backend paginates correctly
      const data = await getMedia({ page: p, limit: 30 });
      // data shape: { data: [...], total, page, totalPages }
      setAllItems(safeArray(data));
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
      setPage(p);
    } catch {
      showToast("Failed to load media", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1); }, []);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        await uploadMedia(fd);
      }
      showToast(`${files.length} file(s) uploaded`, "success");
      load(1);
    } catch (err) {
      showToast(err?.response?.data?.message || "Upload failed", "error");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const confirmDelete = (item) => {
    setConfirm({
      message: `Delete "${item.originalName || item.filename || item.name}"? This cannot be undone.`,
      onConfirm: async () => {
        setConfirm(null);
        try {
          await deleteMedia(item._id);
          showToast("File deleted", "success");
          load(page);
        } catch {
          showToast("Delete failed", "error");
        }
      },
    });
  };

  const filtered = allItems.filter(item => {
    if (!search.trim()) return true;
    const name = (item.originalName || item.filename || item.name || "").toLowerCase();
    return name.includes(search.toLowerCase());
  });

  return (
    <div style={{ padding: "24px 28px" }}>
      <style>{`
        .media-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; }
        @media (max-width: 600px) { .media-grid { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); } }
        .media-card { background: #fff; border: 1.5px solid var(--border); border-radius: var(--radius-md); overflow: hidden; transition: box-shadow 0.2s, border-color 0.2s; }
        .media-card:hover { box-shadow: var(--shadow-md); border-color: var(--primary); }
        .media-thumb { position: relative; height: 140px; background: var(--bg-section); display: flex; align-items: center; justify-content: center; cursor: pointer; overflow: hidden; }
        .media-thumb img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.2s; }
        .media-thumb:hover img { transform: scale(1.04); }
        .media-del { position: absolute; top: 6px; right: 6px; background: rgba(0,0,0,0.55); border: none; color: #fff; border-radius: 50%; width: 28px; height: 28px; cursor: pointer; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; }
        .media-card:hover .media-del { opacity: 1; }
        .media-info { padding: 10px 12px; }
        .media-name { font-size: 0.82rem; font-weight: 600; color: var(--navy); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 4px; }
        .media-meta { font-size: 0.75rem; color: var(--text-muted); display: flex; gap: 6px; flex-wrap: wrap; }
      `}</style>

      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 8 }}>
        <AdminPageHeader title="Media Library" description="Upload and manage all media files" />
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input
            type="text"
            placeholder="Search by name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              padding: "8px 14px", border: "1.5px solid var(--border)", borderRadius: "var(--radius-sm)",
              fontSize: "0.9rem", outline: "none", width: 220,
            }}
          />
          <input type="file" multiple ref={fileRef} onChange={handleUpload} style={{ display: "none" }} />
          <button onClick={() => fileRef.current.click()} disabled={uploading} style={btnStyle("primary")}>
            {uploading
              ? <><i className="bi bi-hourglass-split" /> Uploading…</>
              : <><i className="bi bi-cloud-upload" /> Upload</>
            }
          </button>
        </div>
      </div>

      {/* Stats bar */}
      {!loading && (
        <div style={{ marginBottom: 16, fontSize: "0.85rem", color: "var(--text-muted)" }}>
          {total} file{total !== 1 ? "s" : ""} total
          {search ? ` · showing local filter results` : ` · page ${page} of ${totalPages}`}
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading media…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-folder2-open" style={{ fontSize: "2.5rem", color: "var(--text-muted)", display: "block", marginBottom: 12 }} />
          <p>{search ? `No files matching "${search}"` : "No files yet. Upload something!"}</p>
        </div>
      ) : (
        <div className="media-grid">
          {filtered.map(item => {
            const name = item.originalName || item.filename || item.name || "untitled";
            const img = isImage(item);
            return (
              <div key={item._id} className="media-card">
                {/* Thumbnail */}
                <div className="media-thumb" onClick={() => img && setLightbox({ src: item.url, name })}>
                  {img ? (
                    <img src={item.url} alt={name} />
                  ) : (
                    <i className={`bi ${fileIcon(item)}`} style={{ fontSize: "3rem", color: fileIconColor(item) }} />
                  )}
                  <button
                    className="media-del"
                    title="Delete file"
                    onClick={e => { e.stopPropagation(); confirmDelete(item); }}
                  >
                    <i className="bi bi-trash-fill" style={{ fontSize: "0.75rem" }} />
                  </button>
                </div>
                {/* Info */}
                <div className="media-info">
                  <div className="media-name" title={name}>{name}</div>
                  <div className="media-meta">
                    <span style={{ background: isImage(item) ? "var(--bg-soft-blue)" : "#FEE2E2", color: isImage(item) ? "var(--primary)" : "var(--danger)", padding: "1px 8px", borderRadius: "var(--radius-pill)", fontWeight: 600 }}>
                      {isImage(item) ? "Image" : isPdf(item) ? "PDF" : "File"}
                    </span>
                    <span>{formatDate(item.createdAt)}</span>
                    {item.size && <span>{formatSize(item.size)}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {lightbox && <Lightbox src={lightbox.src} name={lightbox.name} onClose={() => setLightbox(null)} />}
      {confirm && <ConfirmDialog message={confirm.message} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Pagination */}
      {!loading && totalPages > 1 && !search && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 24 }}>
          <button
            onClick={() => load(page - 1)}
            disabled={page <= 1}
            style={{
              padding: "7px 14px", border: "1.5px solid var(--border)", borderRadius: "var(--radius-sm)",
              background: page <= 1 ? "var(--bg-section)" : "#fff", cursor: page <= 1 ? "default" : "pointer",
              color: page <= 1 ? "var(--text-muted)" : "var(--navy)", fontWeight: 600,
            }}
          >
            <i className="bi bi-chevron-left" />
          </button>
          <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)", padding: "0 8px" }}>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => load(page + 1)}
            disabled={page >= totalPages}
            style={{
              padding: "7px 14px", border: "1.5px solid var(--border)", borderRadius: "var(--radius-sm)",
              background: page >= totalPages ? "var(--bg-section)" : "#fff", cursor: page >= totalPages ? "default" : "pointer",
              color: page >= totalPages ? "var(--text-muted)" : "var(--navy)", fontWeight: 600,
            }}
          >
            <i className="bi bi-chevron-right" />
          </button>
        </div>
      )}
    </div>
  );
}
