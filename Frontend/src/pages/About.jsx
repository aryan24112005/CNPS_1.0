import { React, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import CountsSection from "../components/CountsSection";
import TestimonialsSection from "../components/TestimonialsSection";

import { getPublicAbout } from "../services/aboutService";
import {
    getAboutSectionImageUrl,
    getPublicAboutSections,
} from "../services/aboutSectionsService";

const fallbackImages = {
    main: "/assets/img/hero-bg.png",
    vision: "/assets/img/primary.png",
    mission: "/assets/img/middle.png",
    values: "/assets/img/secondary.png",
};

const renderParagraphs = (text) => {
    if (!text) return null;

    return String(text)
        .split(/\n\s*\n|\n/)
        .filter(Boolean)
        .map((paragraph, index) => (
            <p key={index}>{paragraph.trim()}</p>
        ));
};

const normalizeBullets = (bullets) => {
    if (!bullets) return [];

    if (Array.isArray(bullets)) {
        return bullets;
    }

    if (typeof bullets === "string") {
        try {
            const parsed = JSON.parse(bullets);

            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return bullets
                .split("\n")
                .map((item) =>
                    item.replace(/^[-•]\s*/, "").trim()
                )
                .filter(Boolean);
        }
    }

    return [];
};

const About = () => {
    const [about, setAbout] = useState(null);
    const [sections, setSections] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadAboutPage = async () => {
            try {
                setLoading(true);
                setError("");

                const [aboutData, sectionData] = await Promise.all([
                    getPublicAbout(),
                    getPublicAboutSections(),
                ]);

                setAbout(aboutData || null);
                setSections(sectionData || []);
            } catch (err) {
                console.error("About page loading error:", err);

                setError(
                    err.message || "Failed to load About page."
                );
            } finally {
                setLoading(false);
            }
        };

        loadAboutPage();
    }, []);

    const orderedSections = useMemo(() => {
        return [...sections].sort((a, b) => {
            const orderA = Number(a.sort_order || 0);
            const orderB = Number(b.sort_order || 0);

            if (orderA !== orderB) {
                return orderA - orderB;
            }

            return Number(a.id || 0) - Number(b.id || 0);
        });
    }, [sections]);

    /* =========================
       LOADING STATE
    ========================== */

    if (loading) {
        return (
            <main>
                <section className="section">
                    <div className="container text-center">
                        <div
                            className="spinner-border"
                            role="status"
                        >
                            <span className="visually-hidden">
                                Loading...
                            </span>
                        </div>

                        <p className="mt-3 mb-0">
                            Loading About page...
                        </p>
                    </div>
                </section>
            </main>
        );
    }

    /* =========================
       ERROR STATE
    ========================== */

    if (error) {
        return (
            <main>
                <section className="section">
                    <div className="container">
                        <div
                            className="alert alert-danger"
                            role="alert"
                        >
                            {error}
                        </div>
                    </div>
                </section>
            </main>
        );
    }

    /* =========================
       EMPTY STATE
    ========================== */

    if (!about) {
        return (
            <main>
                <section className="section">
                    <div className="container text-center">
                        <h3>
                            About information is not available.
                        </h3>
                    </div>
                </section>
            </main>
        );
    }

    /* =========================
       IMAGES
    ========================== */

    const mainImage =
        getAboutSectionImageUrl(about.image) ||
        fallbackImages.main;

    const visionImage =
        getAboutSectionImageUrl(about.vision_image) ||
        fallbackImages.vision;

    const missionImage =
        getAboutSectionImageUrl(about.mission_image) ||
        fallbackImages.mission;

    const valuesImage =
        getAboutSectionImageUrl(about.values_image) ||
        fallbackImages.values;

    return (
        <main>

            {/* PAGE TITLE */}
            <div className="page-title" data-aos="fade">
                <div className="heading">
                    <div className="container">
                        <div className="row d-flex justify-content-center text-center">
                            <div className="col-lg-8">

                                <h1>
                                    {about.title || "About Our School"}
                                </h1>

                                {about.subtitle && (
                                    <p className="mb-0">
                                        {about.subtitle}
                                    </p>
                                )}

                            </div>
                        </div>
                    </div>
                </div>

                <nav className="breadcrumbs">
                    <div className="container">
                        <ol>
                            <li>
                                <Link to="/">Home</Link>
                            </li>

                            <li className="current">
                                About
                            </li>
                        </ol>
                    </div>
                </nav>
            </div>

            {/* =====================================================
                ABOUT SCHOOL
            ====================================================== */}

            <section className="section">
                <div className="container">

                    <div className="row gy-5 align-items-center">

                        <div
                            className="col-lg-6"
                            data-aos="fade-right"
                        >
                            <div className="about-image">

                                <img
                                    src={mainImage}
                                    alt={
                                        about.title ||
                                        "About Our School"
                                    }
                                    className="img-fluid rounded-4 shadow-sm"
                                />

                            </div>
                        </div>

                        <div
                            className="col-lg-6"
                            data-aos="fade-left"
                        >
                            <div className="content">

                                <h2>
                                    {about.title ||
                                        "About Our School"}
                                </h2>

                                {about.subtitle && (
                                    <h5 className="mb-4">
                                        {about.subtitle}
                                    </h5>
                                )}

                                {renderParagraphs(
                                    about.description
                                )}

                            </div>
                        </div>

                    </div>

                </div>
            </section>

            {/* =====================================================
                VISION
            ====================================================== */}

            {(about.vision_title ||
                about.vision_description) && (

                    <section className="section light-background">

                        <div className="container">

                            <div className="row gy-5 align-items-center">

                                <div
                                    className="col-lg-6 order-lg-2"
                                    data-aos="fade-left"
                                >

                                    <img
                                        src={visionImage}
                                        alt={
                                            about.vision_title ||
                                            "Our Vision"
                                        }
                                        className="img-fluid rounded-4 shadow-sm"
                                    />

                                </div>

                                <div
                                    className="col-lg-6 order-lg-1"
                                    data-aos="fade-right"
                                >

                                    <div className="content">

                                        <h2>
                                            {about.vision_title ||
                                                "Our Vision"}
                                        </h2>

                                        {renderParagraphs(
                                            about.vision_description
                                        )}

                                    </div>

                                </div>

                            </div>

                        </div>

                    </section>
                )}

            {/* =====================================================
                MISSION
            ====================================================== */}

            {(about.mission_title ||
                about.mission_description) && (

                    <section className="section">

                        <div className="container">

                            <div className="row gy-5 align-items-center">

                                <div
                                    className="col-lg-6"
                                    data-aos="fade-right"
                                >

                                    <img
                                        src={missionImage}
                                        alt={
                                            about.mission_title ||
                                            "Our Mission"
                                        }
                                        className="img-fluid rounded-4 shadow-sm"
                                    />

                                </div>

                                <div
                                    className="col-lg-6"
                                    data-aos="fade-left"
                                >

                                    <div className="content">

                                        <h2>
                                            {about.mission_title ||
                                                "Our Mission"}
                                        </h2>

                                        {renderParagraphs(
                                            about.mission_description
                                        )}

                                    </div>

                                </div>

                            </div>

                        </div>

                    </section>
                )}

            {/* =====================================================
                VALUES
            ====================================================== */}

            {(about.values_title ||
                about.values_description) && (

                    <section className="section light-background">

                        <div className="container">

                            <div className="row gy-5 align-items-center">

                                <div
                                    className="col-lg-6 order-lg-2"
                                    data-aos="fade-left"
                                >

                                    <img
                                        src={valuesImage}
                                        alt={
                                            about.values_title ||
                                            "Our Values"
                                        }
                                        className="img-fluid rounded-4 shadow-sm"
                                    />

                                </div>

                                <div
                                    className="col-lg-6 order-lg-1"
                                    data-aos="fade-right"
                                >

                                    <div className="content">

                                        <h2>
                                            {about.values_title ||
                                                "Our Values"}
                                        </h2>

                                        {renderParagraphs(
                                            about.values_description
                                        )}

                                    </div>

                                </div>

                            </div>

                        </div>

                    </section>
                )}

            {/* =====================================================
                ADDITIONAL ABOUT SECTIONS
            ====================================================== */}

            {orderedSections.map((section, index) => {

                const imageUrl =
                    getAboutSectionImageUrl(
                        section.image
                    );

                const bullets =
                    normalizeBullets(
                        section.bullets
                    );

                const isImageRight =
                    index % 2 === 0;

                return (
                    <section
                        className={
                            index % 2 === 0
                                ? "section"
                                : "section light-background"
                        }
                        key={
                            section.id ||
                            section.section_key
                        }
                    >

                        <div className="container">

                            <div className="row gy-5 align-items-center">

                                {/* IMAGE */}

                                <div
                                    className={`col-lg-6 ${isImageRight
                                        ? "order-lg-2"
                                        : "order-lg-1"
                                        }`}
                                    data-aos={
                                        isImageRight
                                            ? "fade-left"
                                            : "fade-right"
                                    }
                                >

                                    {imageUrl ? (

                                        <img
                                            src={imageUrl}
                                            alt={
                                                section.title ||
                                                "About section"
                                            }
                                            className="img-fluid rounded-4 shadow-sm"
                                        />

                                    ) : (

                                        <div
                                            className="d-flex align-items-center justify-content-center rounded-4"
                                            style={{
                                                minHeight:
                                                    "300px",
                                                background:
                                                    "rgba(0,0,0,0.05)",
                                            }}
                                        >

                                            <span className="text-muted">
                                                No image available
                                            </span>

                                        </div>
                                    )}

                                </div>

                                {/* CONTENT */}

                                <div
                                    className={`col-lg-6 ${isImageRight
                                        ? "order-lg-1"
                                        : "order-lg-2"
                                        }`}
                                    data-aos={
                                        isImageRight
                                            ? "fade-right"
                                            : "fade-left"
                                    }
                                >

                                    <div className="content">

                                        <h2>
                                            {section.title}
                                        </h2>

                                        {renderParagraphs(
                                            section.description
                                        )}

                                        {bullets.length > 0 && (

                                            <ul className="mt-4">

                                                {bullets.map(
                                                    (
                                                        bullet,
                                                        bulletIndex
                                                    ) => (

                                                        <li
                                                            key={
                                                                bulletIndex
                                                            }
                                                        >

                                                            <i className="bi bi-check-circle-fill me-2"></i>

                                                            {bullet}

                                                        </li>
                                                    )
                                                )}

                                            </ul>
                                        )}

                                    </div>

                                </div>

                            </div>

                        </div>

                    </section>
                );
            })}

            {/* =====================================================
                COUNTS
            ====================================================== */}

            <CountsSection />

            {/* =====================================================
                TESTIMONIALS
            ====================================================== */}

            <TestimonialsSection />

        </main>
    );
};

export default About;