import { NavLink, useNavigate } from "react-router-dom";

function AdminSidebar({ isOpen, onClose }) {
    const navigate = useNavigate();

    const menuItems = [
        {
            label: "Dashboard",
            path: "/admin",
            icon: "bi bi-speedometer2",
        },
        {
            label: "Events",
            path: "/admin/events",
            icon: "bi bi-calendar-event",
        },
        {
            label: "Gallery",
            path: "/admin/gallery",
            icon: "bi bi-images",
        },
        {
            label: "Notices",
            path: "/admin/notices",
            icon: "bi bi-megaphone",
        },
        {
            label: "Testimonials",
            path: "/admin/testimonials",
            icon: "bi bi-chat-quote",
        },
        {
            label: "Courses",
            path: "/admin/courses",
            icon: "bi bi-book",
        },
        {
            label: "Faculty",
            path: "/admin/faculty",
            icon: "bi bi-people",
        },
        {
            label: "Admission Applications",
            path: "/admin/admissions",
            icon: "bi bi-mortarboard",
        },
        {
            label: "Homepage",
            path: "/admin/homepage",
            icon: "bi bi-house",
        },
        {
            label: "About",
            path: "/admin/about",
            icon: "bi bi-info-circle",
        },
        {
            label: "Contact Messages",
            path: "/admin/contact-messages",
            icon: "bi bi-envelope",
        },
        {
            label: "Settings",
            path: "/admin/settings",
            icon: "bi bi-gear",
        },
    ];

    const handleLogout = () => {
        const confirmed = window.confirm(
            "Are you sure you want to logout?"
        );

        if (!confirmed) return;

        localStorage.removeItem("cms_token");
        localStorage.removeItem("cms_admin");

        navigate("/login", { replace: true });
    };

    const handleNavigation = () => {
        // Close sidebar automatically on mobile
        if (onClose) {
            onClose();
        }
    };

    return (
        <aside
            className={`admin-sidebar ${isOpen ? "open" : ""
                }`}
        >

            {/* =========================
                SIDEBAR HEADER
            ========================== */}

            <div className="admin-sidebar-header">

                <div className="admin-brand">

                    <div className="admin-brand-icon">
                        <i className="bi bi-mortarboard-fill"></i>
                    </div>

                    <div className="admin-brand-text">
                        <h4>CNPS CMS</h4>
                        <span>
                            Website Management
                        </span>
                    </div>

                </div>

                {/* Mobile Close Button */}

                <button
                    type="button"
                    className="admin-sidebar-close"
                    onClick={onClose}
                    aria-label="Close sidebar"
                >
                    <i className="bi bi-x-lg"></i>
                </button>

            </div>

            {/* =========================
                MENU TITLE
            ========================== */}

            <div className="admin-sidebar-menu-title">
                <span>MAIN MENU</span>
            </div>

            {/* =========================
                NAVIGATION
            ========================== */}

            <nav className="admin-sidebar-nav">

                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === "/admin"}
                        onClick={handleNavigation}
                        className={({ isActive }) =>
                            `admin-nav-link ${isActive ? "active" : ""
                            }`
                        }
                    >

                        <span className="admin-nav-icon">
                            <i className={item.icon}></i>
                        </span>

                        <span className="admin-nav-label">
                            {item.label}
                        </span>

                        <span className="admin-nav-arrow">
                            <i className="bi bi-chevron-right"></i>
                        </span>

                    </NavLink>
                ))}

            </nav>

            {/* =========================
                FOOTER ACTIONS
            ========================== */}

            <div className="admin-sidebar-footer">

                <div className="admin-sidebar-divider"></div>

                {/* View Website */}

                <NavLink
                    to="/"
                    className="admin-nav-link admin-website-link"
                    onClick={handleNavigation}
                >

                    <span className="admin-nav-icon">
                        <i className="bi bi-globe2"></i>
                    </span>

                    <span className="admin-nav-label">
                        View Website
                    </span>

                    <span className="admin-nav-arrow">
                        <i className="bi bi-box-arrow-up-right"></i>
                    </span>

                </NavLink>

                {/* Logout */}

                <button
                    type="button"
                    className="admin-logout-btn"
                    onClick={handleLogout}
                >

                    <span className="admin-nav-icon">
                        <i className="bi bi-box-arrow-right"></i>
                    </span>

                    <span className="admin-nav-label">
                        Logout
                    </span>

                </button>

            </div>

        </aside>
    );
}

export default AdminSidebar;