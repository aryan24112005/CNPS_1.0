import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getPublicNotices } from "../services/noticeService.js";

function Notices() {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchNotices = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getPublicNotices();

                setNotices(data);
            } catch (err) {
                console.error("Notice fetch error:", err);

                setError(
                    err.message || "Failed to load notices."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchNotices();
    }, []);

    const formatDate = (date) => {
        if (!date) return "";

        return new Date(date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    };

    const getNoticeIcon = (type) => {
        switch (type) {
            case "pdf":
                return "bi bi-file-earmark-pdf-fill";

            case "image":
                return "bi bi-image-fill";

            case "video":
                return "bi bi-play-circle-fill";

            case "text":
            default:
                return "bi bi-file-text-fill";
        }
    };

    return (
        <main className="main">

            {/* Page Title */}
            <section className="page-title section">
                <div className="container">
                    <h1>Notice Board</h1>
                    <p>Latest Updates & Announcements</p>
                </div>
            </section>

            {/* Notices */}
            <section className="notices-page section">
                <div className="container">

                    {/* Loading */}
                    {loading && (
                        <div className="text-center py-5">
                            <p>Loading notices...</p>
                        </div>
                    )}

                    {/* Error */}
                    {!loading && error && (
                        <div className="text-center py-5">
                            <h3>Unable to Load Notices</h3>
                            <p>{error}</p>
                        </div>
                    )}

                    {/* Empty */}
                    {!loading &&
                        !error &&
                        notices.length === 0 && (
                            <div className="text-center py-5">
                                <h3>No Notices Available</h3>
                                <p>
                                    There are currently no notices or
                                    announcements available.
                                </p>
                            </div>
                        )}

                    {/* Notice Cards */}
                    {!loading &&
                        !error &&
                        notices.length > 0 && (
                            <div className="row gy-4">

                                {notices.map((notice) => (
                                    <div
                                        className="col-lg-6"
                                        key={notice.id}
                                    >
                                        <div className="notice-card">

                                            <div className="notice-card-icon">
                                                <i
                                                    className={getNoticeIcon(
                                                        notice.type
                                                    )}
                                                ></i>
                                            </div>

                                            <div className="notice-card-content">

                                                <div className="notice-card-date">
                                                    <i className="bi bi-calendar3"></i>
                                                    {formatDate(
                                                        notice.notice_date
                                                    )}
                                                </div>

                                                <h3>
                                                    <Link
                                                        to={`/notice/${notice.slug}`}
                                                    >
                                                        {notice.title}
                                                    </Link>
                                                </h3>

                                                <p>
                                                    {notice.content ||
                                                        "Click below to view the complete notice."}
                                                </p>

                                                <Link
                                                    to={`/notice/${notice.slug}`}
                                                    className="notice-read-more"
                                                >
                                                    Read More
                                                    <i className="bi bi-arrow-right"></i>
                                                </Link>

                                            </div>

                                        </div>
                                    </div>
                                ))}

                            </div>
                        )}

                </div>
            </section>

        </main>
    );
}

export default Notices;