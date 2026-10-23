import { useEffect, useState } from "react";
import { getPublicFaculty } from "../../services/publicService";

/* ── Faculty Detail Modal ─────────────────────────────────── */
function FacultyModal({ faculty: f, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const hasSocial  = f.facebook || f.instagram || f.linkedin || f.youtube;
  const hasContact = f.email || f.phone;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${f.name} profile`}
      style={{
        position: "fixed", inset: 0, zIndex: 2000,
        background: "rgba(16,42,67,0.6)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16, animation: "fadeIn 0.2s ease",
        overflowY: "auto",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: "#fff", borderRadius: 20, width: "100%", maxWidth: 600,
        maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 24px 64px rgba(16,42,67,0.3)",
        animation: "modalIn 0.25s ease",
        /* Prevent modal being wider than viewport on tiny screens */
        boxSizing: "border-box",
      }}>
        {/* Top accent */}
        <div style={{ height: 5, background: "linear-gradient(90deg,var(--primary),var(--gold))", borderRadius: "20px 20px 0 0" }} />

        {/* Header — .faculty-modal-header responsive via global.css */}
        <div className="faculty-modal-header">
          {/* Photo */}
          {f.photo?.url ? (
            <img src={f.photo.url} alt={f.name} className="faculty-modal-photo" style={{
              borderRadius: "50%", objectFit: "cover", flexShrink: 0,
              border: "3px solid var(--primary)",
            }} />
          ) : (
            <div className="faculty-modal-photo" style={{
              borderRadius: "50%", flexShrink: 0,
              background: "rgba(22,168,224,0.2)", display: "flex", alignItems: "center",
              justifyContent: "center", border: "3px solid var(--primary)",
            }}>
              <i className="bi bi-person-fill" style={{ fontSize: "2rem", color: "var(--primary)" }} />
            </div>
          )}

          {/* Name + designation */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ color: "#fff", margin: "0 0 6px", fontSize: "clamp(1rem, 3vw, 1.4rem)" }}>{f.name}</h2>
            {f.designation && (
              <div style={{
                display: "inline-block", background: "var(--primary)", color: "#fff",
                padding: "3px 14px", borderRadius: 999, fontSize: "0.82rem",
                fontWeight: 600, marginBottom: 8,
              }}>{f.designation}</div>
            )}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 4 }}>
              {f.qualification && (
                <span style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.85rem" }}>
                  <i className="bi bi-award" style={{ marginRight: 5, color: "var(--gold)" }} />{f.qualification}
                </span>
              )}
              {f.experience && (
                <span style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.85rem" }}>
                  <i className="bi bi-briefcase" style={{ marginRight: 5, color: "var(--gold)" }} />{f.experience}
                </span>
              )}
            </div>
          </div>

          {/* Close */}
          <button onClick={onClose} aria-label="Close profile" style={{
            background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 8,
            width: 36, height: 36, minWidth: 36,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "rgba(255,255,255,0.8)", fontSize: "1.1rem", flexShrink: 0,
          }}>
            <i className="bi bi-x-lg" />
          </button>
        </div>

        {/* Body — .faculty-modal-body responsive via global.css */}
        <div className="faculty-modal-body">
          {f.shortBio && (
            <p style={{
              background: "var(--bg-soft-blue)", borderLeft: "3px solid var(--primary)",
              padding: "12px 16px", borderRadius: "0 8px 8px 0",
              color: "var(--text-main)", fontSize: "0.95rem", lineHeight: 1.7, marginBottom: 20,
            }}>{f.shortBio}</p>
          )}
          {f.bio && (
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.8px", color: "var(--text-muted)", marginBottom: 10 }}>About</h4>
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, marginBottom: 0 }}>{f.bio}</p>
            </div>
          )}
          {hasContact && (
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.8px", color: "var(--text-muted)", marginBottom: 10 }}>Contact</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                {f.email && (
                  <a href={`mailto:${f.email}`} style={{
                    display: "flex", alignItems: "center", gap: 8,
                    background: "var(--bg-section)", borderRadius: 8,
                    padding: "8px 14px", color: "var(--navy)", textDecoration: "none",
                    fontSize: "0.88rem", fontWeight: 500, minWidth: 0,
                    overflow: "hidden", textOverflow: "ellipsis",
                  }}>
                    <i className="bi bi-envelope-fill" style={{ color: "var(--primary)", flexShrink: 0 }} />
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.email}</span>
                  </a>
                )}
                {f.phone && (
                  <a href={`tel:${f.phone}`} style={{
                    display: "flex", alignItems: "center", gap: 8,
                    background: "var(--bg-section)", borderRadius: 8,
                    padding: "8px 14px", color: "var(--navy)", textDecoration: "none",
                    fontSize: "0.88rem", fontWeight: 500,
                  }}>
                    <i className="bi bi-telephone-fill" style={{ color: "var(--primary)", flexShrink: 0 }} />
                    {f.phone}
                  </a>
                )}
              </div>
            </div>
          )}
          {hasSocial && (
            <div>
              <h4 style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.8px", color: "var(--text-muted)", marginBottom: 12 }}>Social Profiles</h4>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {[
                  { url: f.facebook,  icon: "bi-facebook",  label: "Facebook",  color: "#1877F2" },
                  { url: f.instagram, icon: "bi-instagram", label: "Instagram", color: "#E1306C" },
                  { url: f.linkedin,  icon: "bi-linkedin",  label: "LinkedIn",  color: "#0A66C2" },
                  { url: f.youtube,   icon: "bi-youtube",   label: "YouTube",   color: "#FF0000" },
                ].filter((s) => s.url).map((s) => (
                  <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" style={{
                    display: "flex", alignItems: "center", gap: 8,
                    background: "var(--bg-section)", borderRadius: 8,
                    padding: "8px 16px", color: s.color, textDecoration: "none",
                    fontSize: "0.88rem", fontWeight: 600, border: `1px solid ${s.color}22`,
                  }}>
                    <i className={`bi ${s.icon}`} />{s.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes modalIn { from { opacity:0; transform:scale(0.95) translateY(-10px) } to { opacity:1; transform:scale(1) translateY(0) } }
      `}</style>
    </div>
  );
}

/* ── Faculty Card ─────────────────────────────────────────── */
function FacultyCard({ f, onClick }) {
  const [hovered, setHovered] = useState(false);
  const hasSocial = f.facebook || f.instagram || f.linkedin || f.youtube || f.email || f.phone;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      role="button"
      tabIndex={0}
      aria-label={`View ${f.name}'s profile`}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      style={{
        background: "#fff", borderRadius: 16, border: "1px solid var(--border)",
        boxShadow: hovered ? "var(--shadow-lg)" : "var(--shadow-sm)",
        overflow: "hidden", cursor: "pointer",
        transform: hovered ? "translateY(-5px)" : "translateY(0)",
        transition: "all 0.25s ease", position: "relative",
      }}
    >
      <div style={{ position: "relative", overflow: "hidden" }}>
        <div style={{ padding: "28px 20px 16px", textAlign: "center" }}>
          {f.photo?.url ? (
            <img
              src={f.photo.url}
              alt={f.name}
              style={{
                width: 100, height: 100, borderRadius: "50%", objectFit: "cover",
                margin: "0 auto 14px",
                border: `3px solid ${hovered ? "var(--primary)" : "var(--border)"}`,
                transition: "border-color 0.25s",
              }}
            />
          ) : (
            <div style={{
              width: 100, height: 100, borderRadius: "50%",
              background: "var(--bg-soft-blue)", display: "flex", alignItems: "center",
              justifyContent: "center", margin: "0 auto 14px",
              fontSize: "2.5rem", color: "var(--primary)",
            }}>
              <i className="bi bi-person-fill" />
            </div>
          )}
          <h4 style={{ marginBottom: 5, fontSize: "1rem", color: "var(--navy)" }}>{f.name}</h4>
          {f.designation && (
            <p style={{ color: "var(--primary)", fontWeight: 600, fontSize: "0.84rem", marginBottom: 4 }}>
              {f.designation}
            </p>
          )}
          {f.qualification && (
            <p style={{ color: "var(--text-muted)", fontSize: "0.78rem", marginBottom: 4 }}>
              {f.qualification}
            </p>
          )}
          {f.experience && (
            <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", marginBottom: 0 }}>
              <i className="bi bi-award" style={{ marginRight: 4 }} />{f.experience}
            </p>
          )}
        </div>

        {/* Hover overlay — hidden on touch devices via CSS */}
        {hasSocial && (
          <div className="faculty-hover-overlay" style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(135deg,rgba(16,42,67,0.88),rgba(22,168,224,0.80))",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: 10, padding: 20,
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.25s ease",
            pointerEvents: hovered ? "auto" : "none",
          }}>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.78rem", margin: "0 0 8px", letterSpacing: "0.5px", textTransform: "uppercase" }}>
              View Details
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
              {f.email && (
                <a href={`mailto:${f.email}`} onClick={(e) => e.stopPropagation()} title={f.email} style={iconBtnStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--gold)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}>
                  <i className="bi bi-envelope-fill" />
                </a>
              )}
              {f.phone && (
                <a href={`tel:${f.phone}`} onClick={(e) => e.stopPropagation()} title={f.phone} style={iconBtnStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--gold)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}>
                  <i className="bi bi-telephone-fill" />
                </a>
              )}
              {[
                { url: f.facebook,  icon: "bi-facebook"  },
                { url: f.instagram, icon: "bi-instagram" },
                { url: f.linkedin,  icon: "bi-linkedin"  },
                { url: f.youtube,   icon: "bi-youtube"   },
              ].filter((s) => s.url).map((s) => (
                <a key={s.icon} href={s.url} target="_blank" rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()} style={iconBtnStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--gold)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}>
                  <i className={`bi ${s.icon}`} />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* "View Profile" footer strip */}
      <div style={{
        borderTop: "1px solid var(--border)", padding: "10px 16px",
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 6, fontSize: "0.78rem", color: "var(--text-muted)",
      }}>
        <i className="bi bi-person-lines-fill" style={{ color: "var(--primary)" }} />
        View Profile
      </div>
    </div>
  );
}

const iconBtnStyle = {
  width: 38, height: 38, borderRadius: "50%",
  background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)",
  display: "flex", alignItems: "center", justifyContent: "center",
  color: "#fff", fontSize: "1rem", textDecoration: "none", transition: "background 0.2s",
};

/* ── Main Page ────────────────────────────────────────────── */
export default function Trainers() {
  const [faculty,  setFaculty]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getPublicFaculty().then(setFaculty).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="page-hero">
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <h1>Our Faculty</h1>
          <p>Meet our experienced and dedicated teaching staff.</p>
          <div className="page-breadcrumb">
            <a href="/">Home</a>
            <i className="bi bi-chevron-right" />
            <span style={{ color: "#fff" }}>Faculty</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {loading ? (
            <div className="loading-state"><div className="spinner" /></div>
          ) : faculty.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-people" />
              <h4>No faculty members found</h4>
              <p>Check back soon.</p>
            </div>
          ) : (
            <div className="grid grid-4">
              {faculty.map((f) => (
                <FacultyCard key={f._id} f={f} onClick={() => setSelected(f)} />
              ))}
            </div>
          )}
        </div>
      </section>

      {selected && <FacultyModal faculty={selected} onClose={() => setSelected(null)} />}

      {/* Hide hover overlay on touch devices — use click to open modal instead */}
      <style>{`
        @media (hover: none) {
          .faculty-hover-overlay { display: none !important; }
        }
      `}</style>
    </>
  );
}
