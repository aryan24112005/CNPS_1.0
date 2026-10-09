import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import AdminSidebar from "../components/admin/AdminSidebar";

export default function AdminLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const token = localStorage.getItem("cnps_token");
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return (
    <div className={`admin-layout ${sidebarOpen ? "sidebar-open" : ""}`}>
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {sidebarOpen && (
        <div className="admin-sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <main className="admin-main">
        {/* Topbar */}
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              className="admin-menu-toggle"
              onClick={() => setSidebarOpen((p) => !p)}
              aria-label="Toggle sidebar"
            >
              <i className={sidebarOpen ? "bi bi-x-lg" : "bi bi-list"} />
            </button>
            <div className="admin-topbar-title">
              <h5>Website Management</h5>
              <span>CNPS Public School CMS</span>
            </div>
          </div>

          <div className="admin-topbar-right">
            <div className="flex flex-gap-2" style={{ alignItems: "center" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--success)", display: "inline-block" }} />
              <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>Online</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 34, height: 34, borderRadius: "50%",
                background: "var(--bg-soft-blue)", display: "flex",
                alignItems: "center", justifyContent: "center", color: "var(--primary)"
              }}>
                <i className="bi bi-person-fill" />
              </div>
              <div>
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
