import { NavLink, useNavigate } from "react-router-dom";
import cnpsLogo from "../../assets/cnps-logo.png";

const NAV = [
  { section: "Overview" },
  { to: "/admin",             icon: "bi-speedometer2",   label: "Dashboard",          exact: true },
  { section: "Website Content" },
  { to: "/admin/homepage",    icon: "bi-house-heart",    label: "Homepage" },
  { to: "/admin/testimonials",icon: "bi-chat-quote",     label: "Testimonials" },
  { section: "Academics" },
  { to: "/admin/courses",     icon: "bi-book",           label: "Courses" },
  { to: "/admin/faculty",     icon: "bi-people",         label: "Faculty / Trainers" },
  { section: "Content" },
  { to: "/admin/events",      icon: "bi-calendar-event", label: "Events" },
  { to: "/admin/notices",     icon: "bi-bell",           label: "Notices" },
  { to: "/admin/gallery",     icon: "bi-images",         label: "Gallery" },
  { section: "Enquiries" },
  { to: "/admin/admissions",  icon: "bi-person-plus",    label: "Admissions" },
  { to: "/admin/messages",    icon: "bi-envelope",       label: "Contact Messages" },
  { section: "System" },
  { to: "/admin/media",       icon: "bi-folder2-open",   label: "Media Library" },
  { to: "/admin/settings",    icon: "bi-gear",           label: "Settings" },
];

export default function AdminSidebar({ isOpen, onClose }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("cnps_token");
      localStorage.removeItem("cnps_admin");
      navigate("/login");
    }
  };

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-header">
        <div className="admin-sidebar-logo">
          <img src={cnpsLogo} alt="CNPS Logo" />
        </div>
        <div className="admin-sidebar-brand">
          <h6>CNPS School</h6>
          <span>Admin Panel</span>
        </div>
      </div>

      <nav className="admin-nav">
        {NAV.map((item, i) => {
          if (item.section) {
            return <div key={i} className="admin-nav-section">{item.section}</div>;
          }
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) => `admin-nav-link${isActive ? " active" : ""}`}
              onClick={onClose}
            >
              <i className={`bi ${item.icon}`} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div style={{ padding: "12px 0 20px", borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: "auto" }}>
        <button
          onClick={handleLogout}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            width: "100%", background: "none", border: "none",
            cursor: "pointer", padding: "10px 20px",
            color: "rgba(255,255,255,0.6)", fontSize: "0.88rem",
            fontWeight: 500, fontFamily: "inherit",
          }}
        >
          <i className="bi bi-box-arrow-right" style={{ width: 20, textAlign: "center" }} />
          Logout
        </button>
      </div>
    </aside>
  );
}
