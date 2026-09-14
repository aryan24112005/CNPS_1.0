import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getPublicNotices } from "../services/noticeService.js";

function NoticeTicker() {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotices = async () => {
            try {
                const data = await getPublicNotices();
                setNotices(data);
            } catch (error) {
                console.error("Notice ticker error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotices();
    }, []);

    // Loading ya notices available nahi hain
    if (loading || notices.length === 0) {
        return null;
    }

    // Seamless continuous scrolling ke liye duplicate
    const scrollingNotices = [...notices, ...notices];

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <section className="notice-board section">
            <div className="container">

                <div className="section-title">
                    <h2>Notice Board</h2>
                    <p>Latest Updates & Announcements</p>
                </div>

                <div className="notice-board-wrapper">

                    {/* Header */}
                    <div className="notice-board-header">

                        <div className="notice-board-heading">
                            <i className="bi bi-megaphone-fill"></i>
                            <span>Latest Notices</span>
                        </div>

                        <Link
                            to="/notices"
                            className="notice-view-all"
                        >
                            View All
                            <i className="bi bi-arrow-right"></i>
                        </Link>

                    </div>

                    {/* Moving notices */}
                    <div className="notice-ticker-window">

                        <div className="notice-ticker-track">

                            {scrollingNotices.map((notice, index) => (
                                <Link
                                    to={`/notice/${notice.slug}`}
                                    className="notice-item"
                                    key={`${notice.id}-${index}`}
                                >

                                    <span className="notice-icon">
                                        <i className="bi bi-arrow-right-circle-fill"></i>
                                    </span>

                                    <span className="notice-title">
                                        {notice.title}
                                    </span>

                                    <span className="notice-date">
                                        {formatDate(notice.notice_date)}
                                    </span>

                                    <span className="notice-type">

                                        {notice.type === "pdf" && (
                                            <i className="bi bi-file-earmark-pdf-fill"></i>
                                        )}

                                        {notice.type === "image" && (
                                            <i className="bi bi-image-fill"></i>
                                        )}

                                        {notice.type === "video" && (
                                            <i className="bi bi-play-circle-fill"></i>
                                        )}

                                        {notice.type === "text" && (
                                            <i className="bi bi-file-text-fill"></i>
                                        )}

                                    </span>

                                </Link>
                            ))}

                        </div>

                    </div>

                </div>

            </div>
        </section>
    );
}

export default NoticeTicker;