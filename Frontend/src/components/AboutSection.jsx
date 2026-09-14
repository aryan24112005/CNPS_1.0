import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    getPublicAbout,
} from "../services/aboutService";

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";

const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

const getImageUrl = (image) => {
    if (!image) return "/assets/img/about.jpg";

    if (
        image.startsWith("http://") ||
        image.startsWith("https://")
    ) {
        return image;
    }

    if (image.startsWith("/uploads/")) {
        return `${API_ORIGIN}${image}`;
    }

    return image;
};

function AboutSection() {
    const [about, setAbout] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAbout = async () => {
            try {
                const data = await getPublicAbout();
                setAbout(data);
            } catch (error) {
                console.error(
                    "Failed to load About section:",
                    error
                );
            } finally {
                setLoading(false);
            }
        };

        loadAbout();
    }, []);

    if (loading) {
        return (
            <section id="about" className="about section">
                <div className="container">
                    <div className="row align-items-center gy-4">

                        <div className="col-lg-6">
                            <div
                                className="placeholder-glow"
                                style={{
                                    height: "350px",
                                }}
                            >
                                <span className="placeholder w-100 h-100 rounded"></span>
                            </div>
                        </div>

                        <div className="col-lg-6">
                            <span className="placeholder col-4 mb-3"></span>
                            <span className="placeholder col-8 mb-3"></span>
                            <span className="placeholder col-12 mb-2"></span>
                            <span className="placeholder col-10 mb-2"></span>
                            <span className="placeholder col-11"></span>
                        </div>

                    </div>
                </div>
            </section>
        );
    }

    if (!about) {
        return null;
    }

    return (
        <section id="about" className="about section">

            <div className="container">

                <div className="row gy-4 align-items-center">

                    {/* About Image */}
                    <div
                        className="col-lg-6 order-1 order-lg-2"
                        data-aos="fade-up"
                        data-aos-delay="100"
                    >
                        <img
                            src={getImageUrl(about.image)}
                            className="img-fluid"
                            alt={about.title || "DS Convent School"}
                            style={{
                                width: "100%",
                                height: "auto",
                                objectFit: "cover",
                            }}
                        />
                    </div>

                    {/* About Content */}
                    <div
                        className="col-lg-6 order-2 order-lg-1 content"
                        data-aos="fade-up"
                        data-aos-delay="200"
                    >

                        <h3>
                            {about.title}
                        </h3>

                        {about.subtitle && (
                            <p className="fst-italic">
                                {about.subtitle}
                            </p>
                        )}

                        {about.description && (
                            <p>
                                {about.description}
                            </p>
                        )}

                        <Link
                            to="/about"
                            className="read-more"
                        >
                            <span>
                                Discover Our School
                            </span>

                            <i className="bi bi-arrow-right"></i>
                        </Link>

                    </div>

                </div>

            </div>

        </section>
    );
}

export default AboutSection;