import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getPublicNoticeBySlug } from "../services/noticeService.js";

function NoticeDetails() {
    const { slug } = useParams();

    const [notice, setNotice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchNotice = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getPublicNoticeBySlug(slug);

                setNotice(data);
            } catch (err) {
                console.error("Notice fetch error:", err);

                setError(
                    err.message || "Failed to load notice."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchNotice();
    }, [slug]);

    // Loading
    if (loading) {
        return (
            <main className="main">
                <section className="section">
                    <div className="container text-center">
                        <h2>Loading Notice...</h2>
                    </div>
                </section>
            </main>
        );
    }

    // Not found / error
    if (error || !notice) {
        return (
            <main className="main">
                <section className="section">
                    <div className="container text-center">

                        <h2>Notice Not Found</h2>

                        <p>
                            {error ||
                                "The notice you are looking for does not exist or has been removed."}
                        </p>

                        <Link
                            to="/"
                            className="btn btn-primary"
                        >
                            Back to Home
                        </Link>

                    </div>
                </section>
            </main>
        );
    }

    return (
        <main className="main">

            <section className="notice-details section">

                <div className="container">

                    {/* Breadcrumb / Back */}
                    <div className="notice-back">
                        <Link to="/notices">
                            <i className="bi bi-arrow-left"></i>
                            Back to Notices
                        </Link>
                    </div>

                    {/* Notice Header */}
                    <div className="notice-details-header">

                        <span className="notice-details-label">
                            <i className="bi bi-megaphone-fill"></i>
                            Notice
                        </span>

                        <h1>{notice.title}</h1>

                        <p className="notice-published-date">
                            <i className="bi bi-calendar3"></i>
                            Published on{" "}
                            {new Date(
                                notice.notice_date
                            ).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                            })}
                        </p>

                    </div>

                    {/* Content */}
                    <div className="notice-content">

                        {/* TEXT */}
                        {notice.type === "text" && (
                            <div className="notice-text-content">
                                {notice.content
                                    ?.split("\n")
                                    .map((line, index) => (
                                        <p key={index}>
                                            {line}
                                        </p>
                                    ))}
                            </div>
                        )}

                        {/* IMAGE */}
                        {notice.type === "image" &&
                            notice.file_path && (
                                <div className="notice-image-content">

                                    <img
                                        src={`http://localhost:5000/${notice.file_path}`}
                                        alt={notice.title}
                                        className="img-fluid"
                                    />

                                </div>
                            )}

                        {/* PDF */}
                        {notice.type === "pdf" &&
                            notice.file_path && (
                                <div className="notice-pdf-content">

                                    <iframe
                                        src={`http://localhost:5000/${notice.file_path}`}
                                        title={notice.title}
                                        width="100%"
                                        height="750"
                                    />

                                    <div className="notice-download">

                                        <a
                                            href={`http://localhost:5000/${notice.file_path}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-primary"
                                        >
                                            <i className="bi bi-file-earmark-pdf"></i>
                                            Open / Download PDF
                                        </a>

                                    </div>

                                </div>
                            )}

                        {/* VIDEO */}
                        {notice.type === "video" &&
                            notice.video_url && (
                                <div className="notice-video-content">

                                    <div className="ratio ratio-16x9">

                                        <iframe
                                            src={notice.video_url}
                                            title={notice.title}
                                            allowFullScreen
                                        />

                                    </div>

                                </div>
                            )}

                    </div>

                </div>

            </section>

        </main>
    );
}

export default NoticeDetails;