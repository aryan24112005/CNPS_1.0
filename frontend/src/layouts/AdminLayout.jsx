import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import AdminSidebar from "../components/admin/AdminSidebar";

export default function AdminLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const token = localStorage.getItem("cnps_token");
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Close sidebar on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 900) setSidebarOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Get the page title from the current path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/admin")               return "Dashboard";
    if (path.includes("/homepage"))      return "Homepage Content";
    if (path.includes("/faculty"))       return "Faculty / Trainers";
    if (path.includes("/courses"))       return "Courses";
    if (path.includes("/events"))        return "Events";
    if (path.includes("/notices"))       return "Notices";
    if (path.includes("/gallery"))       return "Gallery";
    if (path.includes("/testimonials"))  return "Testimonials";
    if (path.includes("/admissions"))    return "Admissions";
    if (path.includes("/messages"))      return "Messages";
    if (path.includes("/media"))         return "Media Library";
    if (path.includes("/settings"))      return "Settings";
    return "Website Management";
  };

  return (
    <div className={`admin-layout${sidebarOpen ? " sidebar-open" : ""}`}>
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Overlay — clicks close sidebar on mobile */}
      {sidebarOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <main className="admin-main">
        {/* Topbar */}
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              className="admin-menu-toggle"
              onClick={() => setSidebarOpen((p) => !p)}
              aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
              aria-expanded={sidebarOpen}
            >
              <i className={sidebarOpen ? "bi bi-x-lg" : "bi bi-list"} aria-hidden="true" />
            </button>
            <div className="admin-topbar-title">
              <h5>{getPageTitle()}</h5>
              <span>CNPS Public School CMS</span>
            </div>
          </div>

          <div className="admin-topbar-right">
            <div className="flex flex-gap-2 hide-topbar-mobile" style={{ alignItems: "center" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--success)", display: "inline-block" }} />
              <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>Online</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 34, height: 34, borderRadius: "50%",
                background: "var(--bg-soft-blue)", display: "flex",
                alignItems: "center", justifyContent: "center", color: "var(--primary)",
                flexShrink: 0,
              }}>
                <i className="bi bi-person-fill" aria-hidden="true" />
              </div>
              <div className="hide-topbar-mobile">
                <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--navy)" }}>Administrator</div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>CNPS Admin</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
