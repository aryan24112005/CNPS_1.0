function AdminDashboard() {
    const stats = [
        {
            title: "Events",
            description: "Manage school events",
            icon: "bi bi-calendar-event",
            count: "Manage",
            link: "/admin/events",
        },
        {
            title: "Gallery",
            description: "Manage website gallery",
            icon: "bi bi-images",
            count: "Manage",
            link: "/admin/gallery",
        },
        {
            title: "Notices",
            description: "Manage school notices",
            icon: "bi bi-megaphone",
            count: "Manage",
            link: "/admin/notices",
        },
        {
            title: "Faculty",
            description: "Manage teaching staff",
            icon: "bi bi-people",
            count: "Manage",
            link: "/admin/faculty",
        },
        {
            title: "Courses",
            description: "Manage courses & classes",
            icon: "bi bi-book",
            count: "Manage",
            link: "/admin/courses",
        },
        {
            title: "Admissions",
            description: "View admission applications",
            icon: "bi bi-mortarboard",
            count: "View",
            link: "/admin/admissions",
        },
    ];

    const handleNavigate = (link) => {
        window.location.href = link;
    };

    return (
        <div className="admin-dashboard">

            {/* Welcome Header */}
            <div className="admin-dashboard-welcome">
                <div>
                    <span className="admin-welcome-badge">
                        <i className="bi bi-grid-1x2-fill"></i>
                        Admin Dashboard
                    </span>

                    <h1>Welcome back, Administrator 👋</h1>

                    <p>
                        Manage your school website, content and applications
                        from one place.
                    </p>
                </div>

                <div className="admin-dashboard-date">
                    <i className="bi bi-shield-check"></i>
                    <div>
                        <strong>System Active</strong>
                        <span>CMS is running normally</span>
                    </div>
                </div>
            </div>

            {/* Section Title */}
            <div className="admin-section-heading">
                <div>
                    <h2>Website Management</h2>
                    <p>Quick access to your website modules.</p>
                </div>
            </div>

            {/* Management Cards */}
            <div className="a">
                <div className="row g-4">
                    {stats.map((item) => (
                        <div
                            className="col-md-6 col-xl-4"
                            key={item.title}
                        >
                            <div
                                className="admin-dashboard-card"
                                onClick={() => handleNavigate(item.link)}
                            >
                                <div className="admin-card-top">
                                    <div className="admin-card-icon">
                                        <i className={item.icon}></i>
                                    </div>

                                    <span className="admin-card-arrow">
                                        <i className="bi bi-arrow-up-right"></i>
                                    </span>
                                </div>

                                <div className="admin-card-body">
                                    <h3>{item.title}</h3>
                                    <p>{item.description}</p>
                                </div>

                                <div className="admin-card-footer">
                                    <span>{item.count}</span>

                                    <i className="bi bi-chevron-right"></i>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Info */}
            <div className="admin-dashboard-info">
                <div className="admin-info-icon">
                    <i className="bi bi-lightning-charge-fill"></i>
                </div>

                <div>
                    <h3>Quick Management</h3>
                    <p>
                        Use the sidebar to manage homepage content, faculty,
                        courses, gallery, notices, admissions and website
                        settings.
                    </p>
                </div>
            </div>

        </div>
    );
}

export default AdminDashboard;