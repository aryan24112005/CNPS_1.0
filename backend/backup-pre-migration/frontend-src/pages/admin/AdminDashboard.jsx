import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getAlbums, getFaculty, getCourses, getEvents,
  getNotices, getAdmissions, getMessages,
} from "../../services/adminService";

const STAT_CARDS = [
  { key: "courses",    label: "Total Courses",        icon: "bi-book",             color: "var(--primary)",  bg: "var(--bg-soft-blue)", link: "/admin/courses"    },
  { key: "faculty",    label: "Total Faculty",         icon: "bi-people-fill",      color: "#7C3AED",         bg: "#EDE9FE",             link: "/admin/faculty"    },
  { key: "events",     label: "Total Events",          icon: "bi-calendar-event-fill", color: "#059669",      bg: "#DCFCE7",             link: "/admin/events"     },
  { key: "notices",    label: "Total Notices",         icon: "bi-bell-fill",        color: "#D97706",         bg: "#FEF3C7",             link: "/admin/notices"    },
  { key: "albums",     label: "Gallery Albums",        icon: "bi-images",           color: "#DB2777",         bg: "#FCE7F3",             link: "/admin/gallery"    },
  { key: "admissions", label: "Admission Enquiries",   icon: "bi-person-plus-fill", color: "var(--navy)",     bg: "#E0E7FF",             link: "/admin/admissions" },
  { key: "messages",   label: "Contact Messages",      icon: "bi-envelope-fill",    color: "#0891B2",         bg: "#CFFAFE",             link: "/admin/messages"   },
];

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const safeCount = (data) => {
  if (!data) return 0;
  if (Array.isArray(data)) return data.length;
  if (typeof data === "object") {
    if (Array.isArray(data.data)) return data.total ?? data.data.length;
    if (typeof data.total === "number") return data.total;
    if (typeof data.count === "number") return data.count;
  }
  return 0;
};

const safeArray = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === "object" && Array.isArray(data.data)) return data.data;
  return [];
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    courses: null, faculty: null, events: null, notices: null,
    albums: null, admissions: null, messages: null,
  });
  const [recentAdmissions, setRecentAdmissions] = useState([]);
  const [recentMessages,   setRecentMessages]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchAll = async () => {
      setLoading(true); setError(null);
      try {
        const [albumsRes, facultyRes, coursesRes, eventsRes, noticesRes, admissionsRes, messagesRes] =
          await Promise.allSettled([
            getAlbums(), getFaculty(), getCourses(), getEvents(), getNotices(),
            getAdmissions({ limit: 5, sort: "-createdAt" }),
            getMessages({ limit: 5, sort: "-createdAt" }),
          ]);
        if (cancelled) return;
        const v = (r) => (r.status === "fulfilled" ? r.value : null);
        setStats({
          courses:    safeCount(v(coursesRes)),
          faculty:    safeCount(v(facultyRes)),
          events:     safeCount(v(eventsRes)),
          notices:    safeCount(v(noticesRes)),
          albums:     safeCount(v(albumsRes)),
          admissions: safeCount(v(admissionsRes)),
          messages:   safeCount(v(messagesRes)),
        });
        setRecentAdmissions(safeArray(v(admissionsRes)).slice(0, 5));
        setRecentMessages(safeArray(v(messagesRes)).slice(0, 5));
      } catch (err) {
        if (!cancelled) setError("Failed to load dashboard data. Please refresh.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchAll();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner" />
        <span>Loading dashboard…</span>
      </div>
    );
  }
  if (error) {
    return (
      <div className="alert alert-error" style={{ maxWidth: 560, margin: "40px auto" }}>
        <i className="bi bi-exclamation-circle-fill" />
        {error}
      </div>
    );
  }

  const todayStr = new Date().toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div>
      {/* Page header */}
      <div className="admin-page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Welcome back! Here's an overview of your school website — {todayStr}.</p>
        </div>
      </div>

      {/*
        .dashboard-stats-grid defined in global.css:
        4-col → 3-col (≤1200px) → 2-col (≤900px) → 1-col (≤480px)
      */}
      <div className="dashboard-stats-grid" style={{ marginBottom: 36 }}>
        {STAT_CARDS.map(({ key, label, icon, color, bg, link }) => (
          <Link key={key} to={link} style={{ textDecoration: "none" }}>
            <div
              style={{
                background: "#fff", borderRadius: 12,
                padding: "clamp(16px, 3vw, 24px) clamp(14px, 2.5vw, 20px)",
                boxShadow: "0 1px 4px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06)",
                display: "flex", alignItems: "center", gap: 16,
                transition: "transform 0.18s ease, box-shadow 0.18s ease",
                cursor: "pointer", border: "1px solid var(--border)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1), 0 8px 24px rgba(0,0,0,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06)";
              }}
            >
              <div style={{
                width: 52, height: 52, borderRadius: 12, background: bg,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <i className={`bi ${icon}`} style={{ fontSize: "1.4rem", color }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: "clamp(1.4rem, 3vw, 1.75rem)", fontWeight: 700, color: "var(--navy)", lineHeight: 1 }}>
                  {stats[key] ?? "—"}
                </div>
                <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: 4, fontWeight: 500 }}>
                  {label}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/*
        .dashboard-tables-grid defined in global.css:
        2-col on ≥900px, 1-col on mobile
      */}
      <div className="dashboard-tables-grid">
        {/* Recent Admissions */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ padding: "18px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: "#E0E7FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <i className="bi bi-person-plus-fill" style={{ color: "var(--navy)", fontSize: "1rem" }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--navy)" }}>Recent Admissions</div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Latest 5 enquiries</div>
              </div>
            </div>
            <Link to="/admin/admissions" style={{ fontSize: "0.82rem", color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>
              View all <i className="bi bi-arrow-right" />
            </Link>
          </div>
          {recentAdmissions.length === 0 ? (
            <div className="empty-state" style={{ padding: "32px 20px" }}>
              <i className="bi bi-inbox" style={{ fontSize: "2rem", color: "var(--border)" }} />
              <p>No admissions yet</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    {["Student Name", "Class", "Parent Phone", "Date"].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentAdmissions.map((a, i) => (
                    <tr key={a._id ?? i}>
                      <td style={{ fontWeight: 500, color: "var(--navy)" }}>{a.studentName ?? a.name ?? "—"}</td>
                      <td><span className="badge badge-primary">{a.class ?? a.className ?? "—"}</span></td>
                      <td>{a.parentPhone ?? a.phone ?? "—"}</td>
                      <td style={{ whiteSpace: "nowrap" }}>{formatDate(a.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Messages */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ padding: "18px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: "#CFFAFE", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <i className="bi bi-envelope-fill" style={{ color: "#0891B2", fontSize: "1rem" }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--navy)" }}>Recent Messages</div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Latest 5 contact messages</div>
              </div>
            </div>
            <Link to="/admin/messages" style={{ fontSize: "0.82rem", color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>
              View all <i className="bi bi-arrow-right" />
            </Link>
          </div>
          {recentMessages.length === 0 ? (
            <div className="empty-state" style={{ padding: "32px 20px" }}>
              <i className="bi bi-inbox" style={{ fontSize: "2rem", color: "var(--border)" }} />
              <p>No messages yet</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    {["Name", "Email", "Subject", "Date"].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentMessages.map((m, i) => (
                    <tr key={m._id ?? i}>
                      <td style={{ fontWeight: 500, color: "var(--navy)" }}>{m.name ?? "—"}</td>
                      <td style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.email ?? "—"}</td>
                      <td style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.subject ?? "—"}</td>
                      <td style={{ whiteSpace: "nowrap" }}>{formatDate(m.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
