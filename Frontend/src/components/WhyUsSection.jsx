import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    getPublicGalleryImages,
    getGalleryImageUrl,
} from "../services/galleryService";

function WhyUsSection() {
    const [galleryImages, setGalleryImages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadGallery = async () => {
            try {
                setLoading(true);

                const data = await getPublicGalleryImages();

                const activeImages = Array.isArray(data)
                    ? data.filter(
                        (item) =>
                            item.status === undefined ||
                            item.status === "active"
                    )
                    : [];

                setGalleryImages(activeImages);
            } catch (error) {
                console.error(
                    "Failed to load Why Us gallery:",
                    error
                );
                setGalleryImages([]);
            } finally {
                setLoading(false);
            }
        };

        loadGallery();
    }, []);

    /* =========================================
       REFRESH GLIGHTBOX
    ========================================= */
    useEffect(() => {
        if (!loading) {
            requestAnimationFrame(() => {
                window.dispatchEvent(
                    new Event("why-us-gallery-updated")
                );
            });
        }
    }, [loading, galleryImages]);

    /* =========================================
       CATEGORY WISE GALLERY
    ========================================= */
    const galleryMap = useMemo(() => {
        const map = {
            academic: [],
            development: [],
            campus: [],
        };

        galleryImages.forEach((item) => {
            const category = String(
                item.category || ""
            )
                .trim()
                .toLowerCase();

            if (category === "academic") {
                map.academic.push(item);
            } else if (category === "development") {
                map.development.push(item);
            } else if (category === "campus") {
                map.campus.push(item);
            }
        });

        Object.values(map).forEach((images) => {
            images.sort(
                (a, b) =>
                    Number(a.sort_order ?? 0) -
                    Number(b.sort_order ?? 0)
            );
        });

        return map;
    }, [galleryImages]);

    /* =========================================
       GALLERY BUTTON + HIDDEN IMAGES
    ========================================= */
    const renderGallery = (images, galleryName) => {
        if (loading) {
            return (
                <div className="why-us-gallery">
                    <span className="why-us-gallery-loading">
                        Loading gallery...
                    </span>
                </div>
            );
        }

        if (!images || images.length === 0) {
            return (
                <div className="why-us-gallery">
                    <span className="why-us-gallery-empty">
                        No gallery images
                    </span>
                </div>
            );
        }

        const firstImage = images[0];
        const firstImageUrl = getGalleryImageUrl(firstImage.image);

        return (
            <div className="why-us-gallery">

                {/* ================================
                    VISIBLE VIEW GALLERY BUTTON
                ================================= */}
                <a
                    href={firstImageUrl}
                    className="glightbox why-us-gallery-button"
                    data-gallery={`why-us-${galleryName}`}
                    data-title={
                        firstImage.caption || galleryName
                    }
                >
                    <i className="bi bi-images"></i>
                    <span>View Gallery</span>
                    <i className="bi bi-chevron-right"></i>
                </a>

                {/* ================================
                    OTHER IMAGES
                    Hidden from page but available
                    inside GLightbox
                ================================= */}
                {images.slice(1).map((item) => {
                    const imageUrl = getGalleryImageUrl(
                        item.image
                    );

                    if (!imageUrl) return null;

                    return (
                        <a
                            key={`${galleryName}-${item.id}`}
                            href={imageUrl}
                            className="glightbox why-us-hidden-gallery"
                            data-gallery={`why-us-${galleryName}`}
                            data-title={
                                item.caption || galleryName
                            }
                        >
                            <img
                                src={imageUrl}
                                alt={
                                    item.caption ||
                                    galleryName
                                }
                            />
                        </a>
                    );
                })}
            </div>
        );
    };

    return (
        <section id="why-us" className="section why-us">
            <div className="container">

                <div className="row gy-4">

                    {/* =====================================
                        MAIN WHY US CARD
                    ====================================== */}
                    <div
                        className="col-lg-4"
                        data-aos="fade-up"
                        data-aos-delay="100"
                    >
                        <div className="why-box">

                            <h3>
                                Why Choose Our School?
                            </h3>

                            <p>
                                We are committed to providing quality
                                education and a nurturing environment where
                                every child can learn, grow, and discover
                                their potential. From Nursery to Class 12,
                                we focus on academic excellence, character
                                building, creativity, and the overall
                                development of our students.
                            </p>

                            <div className="text-center">

                                <Link
                                    to="/about"
                                    className="more-btn"
                                >
                                    <span>
                                        Learn More
                                    </span>

                                    <i className="bi bi-chevron-right"></i>
                                </Link>

                            </div>

                        </div>
                    </div>


                    {/* =====================================
                        FEATURE CARDS
                    ====================================== */}
                    <div
                        className="col-lg-8 d-flex align-items-stretch"
                        data-aos="fade-up"
                        data-aos-delay="200"
                    >

                        <div className="row gy-4">


                            {/* =================================
                                CARD 1
                            ================================= */}
                            <div
                                className="col-xl-4"
                                data-aos="fade-up"
                                data-aos-delay="200"
                            >

                                <div className="why-us-feature-card">

                                    <div className="why-us-card-content">

                                        <i className="bi bi-mortarboard"></i>

                                        <h4>
                                            Academic Excellence
                                        </h4>

                                        <p>
                                            Celebrating students who achieve
                                            outstanding results and demonstrate
                                            dedication towards their studies.
                                        </p>

                                    </div>

                                    {renderGallery(
                                        galleryMap.academic,
                                        "academic"
                                    )}

                                </div>

                            </div>


                            {/* =================================
                                CARD 2
                            ================================= */}
                            <div
                                className="col-xl-4"
                                data-aos="fade-up"
                                data-aos-delay="300"
                            >

                                <div className="why-us-feature-card">

                                    <div className="why-us-card-content">

                                        <i className="bi bi-stars"></i>

                                        <h4>
                                            Holistic Development
                                        </h4>

                                        <p>
                                            Encouraging innovation, science
                                            projects, exhibitions, creativity,
                                            and practical learning.
                                        </p>

                                    </div>

                                    {renderGallery(
                                        galleryMap.development,
                                        "development"
                                    )}

                                </div>

                            </div>


                            {/* =================================
                                CARD 3
                            ================================= */}
                            <div
                                className="col-xl-4"
                                data-aos="fade-up"
                                data-aos-delay="400"
                            >

                                <div className="why-us-feature-card">

                                    <div className="why-us-card-content">

                                        <i className="bi bi-shield-check"></i>

                                        <h4>
                                            Safe &amp; Supportive Campus
                                        </h4>

                                        <p>
                                            A welcoming school environment
                                            supported by our campus, teachers,
                                            and dedicated staff.
                                        </p>

                                    </div>

                                    {renderGallery(
                                        galleryMap.campus,
                                        "campus"
                                    )}

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>
        </section>
    );
}

export default WhyUsSection;