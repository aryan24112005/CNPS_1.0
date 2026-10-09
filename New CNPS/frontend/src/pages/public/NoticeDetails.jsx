import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getPublicNoticeBySlug } from "../../services/publicService";

function fmtDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

export default function NoticeDetails() {
  const { slug } = useParams();
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getPublicNoticeBySlug(slug)
      .then(setNotice)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="loading-state" style={{ minHeight: "60vh" }}>
        <div className="spinner" />
      </div>
    );
  }

  if (error || !notice) {
    return (
      <div className="empty-state" style={{ minHeight: "60vh" }}>
        <i className="bi bi-bell-slash" />
        <h4>Notice not found</h4>
        <p>The notice you are looking for does not exist.</p>
        <Link to="/notices" className="btn btn-primary" style={{ marginTop: 16 }}>
          <i className="bi bi-arrow-left" /> Back to Notices
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Hero */}
      <section className="page-hero">
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <h1 style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)" }}>{notice.title}</h1>
          {notice.date && (
            <p style={{ opacity: 0.85 }}>
              <i className="bi bi-calendar3" /> {fmtDate(notice.date)}
            </p>
          )}
          <div className="page-breadcrumb">
            <a href="/">Home</a>
            <i className="bi bi-chevron-right" />
            <Link to="/notices" style={{ color: "rgba(255,255,255,0.8)" }}>Notices</Link>
            <i className="bi bi-chevron-right" />
            <span style={{ color: "#fff" }}>Details</span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="section">
        <div className="container">
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            {/* Back button */}
            <Link
              to="/notices"
              className="btn btn-outline btn-sm"
              style={{ marginBottom: 32, display: "inline-flex" }}
            >
              <i className="bi bi-arrow-left" /> Back to Notices
            </Link>

            {/* Notice card */}
            <div
              className="card"
              style={{ padding: 40 }}
            >
              {/* Header row */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 28,
                  paddingBottom: 20,
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    background: "var(--bg-soft-blue)",
                    borderRadius: "var(--radius-md)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <i className="bi bi-bell-fill" style={{ fontSize: "1.4rem", color: "var(--primary)" }} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: "1.4rem" }}>{notice.title}</h2>
                  {notice.date && (
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      <i className="bi bi-calendar3" /> {fmtDate(notice.date)}
                    </span>
                  )}
                </div>
              </div>

              {/* Full content */}
              <div
                style={{
                  fontSize: "1rem",
                  color: "var(--text-secondary)",
                  lineHeight: 1.8,
                  whiteSpace: "pre-wrap",
                }}
              >
                {notice.content}
              </div>

              {/* File attachment */}
              {notice.file?.url && (
                <div
                  style={{
                    marginTop: 32,
                    padding: "20px 24px",
                    background: "var(--bg-section)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      background: "#FEF3C7",
                      borderRadius: "var(--radius-sm)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <i
                      className="bi bi-file-earmark-pdf-fill"
                      style={{ fontSize: "1.4rem", color: "#D4970A" }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--navy)", marginBottom: 2 }}>
                      Attachment
                    </div>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--text-muted)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {notice.file.originalName || notice.file.url}
                    </div>
                  </div>
                  <a
                    href={notice.file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-sm"
                    style={{ flexShrink: 0 }}
                  >
                    <i className="bi bi-download" /> Download
                  </a>
                </div>
              )}

              {/* Image attachment */}
              {notice.image?.url && (
                <div style={{ marginTop: 28 }}>
                  <img
                    src={notice.image.url}
                    alt="Notice attachment"
                    style={{
                      width: "100%",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border)",
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
