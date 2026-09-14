import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import AdminSidebar from "./AdminSidebar";

function AdminLayout() {
    const location = useLocation();

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const token = localStorage.getItem("cms_token");

    // No authentication token → never allow admin panel
    if (!token) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location.pathname }}
            />
        );
    }

    const toggleSidebar = () => {
        setSidebarOpen((prev) => !prev);
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    return (
        <div
            className={`admin-layout ${sidebarOpen ? "sidebar-open" : ""
                }`}
        >

            {/* =========================
                SIDEBAR
            ========================== */}

            <AdminSidebar
                isOpen={sidebarOpen}
                onClose={closeSidebar}
            />

            {/* =========================
                MOBILE OVERLAY
            ========================== */}

            {sidebarOpen && (
                <div
                    className="admin-sidebar-overlay"
                    onClick={closeSidebar}
                    aria-hidden="true"
                ></div>
            )}

            {/* =========================
                MAIN AREA
            ========================== */}

            <main className="admin-main">

                {/* =========================
                    TOPBAR
                ========================== */}

                <header className="admin-topbar">

                    {/* LEFT SIDE */}

                    <div className="admin-topbar-left">

                        {/* Mobile Menu Button */}

                        <button
                            type="button"
                            className="admin-menu-toggle"
                            onClick={toggleSidebar}
                            aria-label={
                                sidebarOpen
                                    ? "Close sidebar"
                                    : "Open sidebar"
                            }
                        >
                            <i
                                className={
                                    sidebarOpen
                                        ? "bi bi-x-lg"
                                        : "bi bi-list"
                                }
                            ></i>
                        </button>

                        <div className="admin-topbar-title">

                            <h5>
                                Website Management
                            </h5>

                            <span>
                                CNPS Administration Panel
                            </span>

                        </div>

                    </div>

                    {/* RIGHT SIDE */}

                    <div className="admin-topbar-right">

                        <div className="admin-topbar-status">
                            <span className="admin-status-dot"></span>

                            <span>
                                System Active
                            </span>
                        </div>

                        <div className="admin-topbar-divider"></div>

                        <div className="admin-user">

                            <div className="admin-user-avatar">
                                <i className="bi bi-person-fill"></i>
                            </div>

                            <div className="admin-user-info">

                                <strong>
                                    CNPS Administrator
                                </strong>

                                <small>
                                    Admin
                                </small>

                            </div>

                            {/* <i className="bi bi-chevron-down admin-user-chevron"></i> */}

                        </div>

                    </div>

                </header>

                {/* =========================
                    PAGE CONTENT
                ========================== */}

                <div className="admin-content">
                    <Outlet />
                </div>

            </main>

        </div>
    );
}

export default AdminLayout;