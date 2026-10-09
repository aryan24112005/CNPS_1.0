import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPublicNotices } from "../../services/publicService";

function fmtDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

export default function Notices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicNotices().then(setNotices).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="page-hero">
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <h1>Notice Board</h1>
          <p>Important announcements, circulars and notices from CNPS.</p>
          <div className="page-breadcrumb">
            <a href="/">Home</a>
            <i className="bi bi-chevron-right" />
            <span style={{ color: "#fff" }}>Notices</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {loading ? (
            <div className="loading-state"><div className="spinner" /></div>
          ) : notices.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-bell-slash" />
              <h4>No notices found</h4>
              <p>Check back soon for important announcements.</p>
            </div>
          ) : (
            /* grid-3 collapses via global.css */
            <div className="grid grid-3">
              {notices.map((n) => (
                <div key={n._id} className="card" style={{ display: "flex", flexDirection: "column" }}>
                  {/* Coloured top strip */}
                  <div style={{
                    height: 6, borderRadius: "12px 12px 0 0",
                    background: "linear-gradient(90deg, var(--primary), var(--navy))",
                  }} />
                  <div className="card-body" style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                    {n.date && (
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        fontSize: "0.78rem", fontWeight: 600, color: "var(--primary)",
                        background: "var(--bg-soft-blue)", padding: "4px 12px",
                        borderRadius: "var(--radius-pill)", width: "fit-content",
                      }}>
                        <i className="bi bi-calendar3" />
                        {fmtDate(n.date)}
                      </span>
                    )}

                    <h4 style={{ margin: 0, fontSize: "1.05rem", color: "var(--navy)" }}>{n.title}</h4>

                    {n.content && (
                      <p style={{
                        fontSize: "0.88rem", color: "var(--text-secondary)", margin: 0,
                        display: "-webkit-box", WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical", overflow: "hidden",
                      }}>
                        {n.content}
                      </p>
                    )}

                    {n.file?.url && (
                      <a href={n.file.url} target="_blank" rel="noopener noreferrer" style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        fontSize: "0.82rem", fontWeight: 600, color: "var(--gold-dark, #D4970A)",
                        textDecoration: "none",
                      }}>
                        <i className="bi bi-file-earmark-pdf" />
                        Download Attachment
                      </a>
                    )}

                    <div style={{ marginTop: "auto", paddingTop: 8 }}>
                      <Link to={`/notices/${n.slug || n._id}`} className="btn btn-outline btn-sm">
                        Read More <i className="bi bi-arrow-right" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
