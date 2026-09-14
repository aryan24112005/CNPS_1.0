import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
    getPublicCourseById,
    getPublicCourseImageUrl,
    getPublicCourseFileUrl,
} from "../services/courseService";

function CourseDetails() {
    const { courseId } = useParams();

    const [course, setCourse] = useState(null);
    const [activeTab, setActiveTab] = useState("overview");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadCourse();
    }, [courseId]);

    const loadCourse = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getPublicCourseById(courseId);
            setCourse(data);
        } catch (err) {
            console.error("Course Details Error:", err);
            setError(err.message || "Failed to load course details.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container section text-center">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="mt-3">Loading course details...</p>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="container section text-center">
                <h2>Course Details Not Found</h2>
                <p>{error || "Details for this course are not available yet."}</p>
                <Link to="/courses">Back to Courses</Link>
            </div>
        );
    }

    const courseImage = getPublicCourseImageUrl(course.image);
    const feePdf = getPublicCourseFileUrl(course.fee_pdf);
    const timetablePdf = getPublicCourseFileUrl(course.timetable_pdf);

    return (
        <>
            {/* =========================
                PAGE TITLE
            ========================= */}

            <div className="page-title" data-aos="fade">

                <div className="heading">

                    <div className="container">

                        <div className="row justify-content-center text-center">

                            <div className="col-lg-8">

                                <h1>{course.title}</h1>

                                <p className="mb-0">
                                    {course.description}
                                </p>

                            </div>

                        </div>

                    </div>

                </div>


                <nav className="breadcrumbs">

                    <div className="container">

                        <ol>

                            <li>
                                <Link to="/">
                                    Home
                                </Link>
                            </li>

                            <li>
                                <Link to="/courses">
                                    Courses
                                </Link>
                            </li>

                            <li className="current">
                                {course.title}
                            </li>

                        </ol>

                    </div>

                </nav>

            </div>


            {/* =========================
                COURSE DETAILS
            ========================= */}

            <section
                id="courses-course-details"
                className="courses-course-details section"
            >

                <div
                    className="container"
                    data-aos="fade-up"
                >

                    <div className="row g-4">


                        {/* IMAGE + DESCRIPTION */}

                        <div className="col-lg-8">

                            <img
                                src={courseImage || "/assets/img/hero-bg.png"}
                                className="img-fluid course-detail-main-image"
                                alt={course.title}
                            />

                            <h3 className="mt-4">
                                {course.title}
                            </h3>

                            <p>
                                {course.description}
                            </p>

                        </div>


                        {/* INFORMATION */}

                        <div className="col-lg-4">

                            <div className="course-info">

                                <div className="course-info-row">
                                    <strong>Programme</strong>
                                    <span>
                                        {course.category}
                                    </span>
                                </div>


                                <div className="course-info-row">
                                    <strong>Class Teacher</strong>
                                    <span>
                                        {course.class_teacher || "To be updated"}
                                    </span>
                                </div>


                                <div className="course-info-row">
                                    <strong>Class Timing</strong>
                                    <span>
                                        {course.timing}
                                    </span>
                                </div>

                            </div>


                            {/* PDF LINKS */}

                            <div className="course-documents mt-4">

                                <a
                                    href={feePdf}
                                    download
                                    className="course-document-link"
                                >
                                    <i className="bi bi-file-earmark-pdf"></i>

                                    <span>
                                        Fee Structure
                                        <small>
                                            Download PDF
                                        </small>
                                    </span>

                                    <i className="bi bi-download"></i>
                                </a>


                                <a
                                    href={timetablePdf}
                                    download
                                    className="course-document-link"
                                >
                                    <i className="bi bi-calendar3"></i>

                                    <span>
                                        Time Table
                                        <small>
                                            Download PDF
                                        </small>
                                    </span>

                                    <i className="bi bi-download"></i>
                                </a>

                            </div>

                        </div>

                    </div>

                </div>

            </section>


            {/* =========================
                COURSE TABS
            ========================= */}

            <section className="course-tabs section">

                <div className="container">

                    <div className="row">

                        {/* TAB MENU */}
                        <div className="col-lg-3">

                            <div className="course-tab-nav">

                                <button
                                    type="button"
                                    className={
                                        activeTab === "overview"
                                            ? "active"
                                            : ""
                                    }
                                    onClick={() =>
                                        setActiveTab("overview")
                                    }
                                >
                                    Overview
                                </button>


                                <button
                                    type="button"
                                    className={
                                        activeTab === "learning"
                                            ? "active"
                                            : ""
                                    }
                                    onClick={() =>
                                        setActiveTab("learning")
                                    }
                                >
                                    Learning Approach
                                </button>


                                <button
                                    type="button"
                                    className={
                                        activeTab === "support"
                                            ? "active"
                                            : ""
                                    }
                                    onClick={() =>
                                        setActiveTab("support")
                                    }
                                >
                                    Academic Support
                                </button>


                                <button
                                    type="button"
                                    className={
                                        activeTab === "activities"
                                            ? "active"
                                            : ""
                                    }
                                    onClick={() =>
                                        setActiveTab("activities")
                                    }
                                >
                                    Activities
                                </button>


                                <button
                                    type="button"
                                    className={
                                        activeTab === "future"
                                            ? "active"
                                            : ""
                                    }
                                    onClick={() =>
                                        setActiveTab("future")
                                    }
                                >
                                    Future Preparation
                                </button>

                            </div>

                        </div>


                        {/* TAB CONTENT */}
                        <div className="col-lg-9">

                            <div className="course-tab-content">


                                {/* OVERVIEW */}
                                {activeTab === "overview" && (

                                    <div>

                                        <h3>
                                            {course.title} Overview
                                        </h3>

                                        <p>
                                            {course.description}
                                        </p>

                                        <div className="row mt-4">

                                            <div className="col-md-6">

                                                <strong>
                                                    Class Teacher
                                                </strong>

                                                <p>
                                                    {course.class_teacher || "To be updated"}
                                                </p>

                                            </div>


                                            <div className="col-md-6">

                                                <strong>
                                                    Class Timing
                                                </strong>

                                                <p>
                                                    {course.timing}
                                                </p>

                                            </div>

                                        </div>

                                    </div>

                                )}


                                {/* LEARNING APPROACH */}
                                {activeTab === "learning" && (

                                    <div>

                                        <h3>
                                            Learning Approach
                                        </h3>

                                        <p>
                                            Our learning approach focuses
                                            on concept clarity, active
                                            participation, creativity,
                                            confidence, and practical
                                            understanding.
                                        </p>

                                        <ul>

                                            <li>
                                                Concept-based learning
                                            </li>

                                            <li>
                                                Interactive classroom
                                                activities
                                            </li>

                                            <li>
                                                Practical and
                                                activity-based learning
                                            </li>

                                            <li>
                                                Continuous assessment
                                            </li>

                                        </ul>

                                    </div>

                                )}


                                {/* ACADEMIC SUPPORT */}
                                {activeTab === "support" && (

                                    <div>

                                        <h3>
                                            Academic Support
                                        </h3>

                                        <p>
                                            Students receive academic
                                            guidance and support to
                                            strengthen their understanding
                                            and improve their learning
                                            outcomes.
                                        </p>

                                        <ul>

                                            <li>
                                                Individual attention
                                            </li>

                                            <li>
                                                Doubt clarification
                                            </li>

                                            <li>
                                                Regular assessments
                                            </li>

                                            <li>
                                                Parent-teacher communication
                                            </li>

                                        </ul>

                                    </div>

                                )}


                                {/* ACTIVITIES */}
                                {activeTab === "activities" && (

                                    <div>

                                        <h3>
                                            Activities
                                        </h3>

                                        <p>
                                            Students are encouraged to
                                            participate in activities that
                                            support creativity, teamwork,
                                            confidence, and personality
                                            development.
                                        </p>

                                        <ul>

                                            <li>
                                                Sports activities
                                            </li>

                                            <li>
                                                Cultural activities
                                            </li>

                                            <li>
                                                Competitions
                                            </li>

                                            <li>
                                                Creative activities
                                            </li>

                                        </ul>

                                    </div>

                                )}


                                {/* FUTURE PREPARATION */}
                                {activeTab === "future" && (

                                    <div>

                                        <h3>
                                            Future Preparation
                                        </h3>

                                        <p>
                                            The academic programme prepares
                                            students for the next stage of
                                            their educational journey by
                                            developing strong concepts,
                                            confidence, and essential
                                            learning skills.
                                        </p>

                                        <ul>

                                            <li>
                                                Strong academic foundation
                                            </li>

                                            <li>
                                                Problem-solving skills
                                            </li>

                                            <li>
                                                Communication skills
                                            </li>

                                            <li>
                                                Independent learning
                                            </li>

                                        </ul>

                                    </div>

                                )}

                            </div>

                        </div>

                    </div>

                </div>

            </section>

            {/* =========================
                SUBJECTS
            ========================= */}

            <section className="section">

                <div
                    className="container"
                    data-aos="fade-up"
                >

                    <div className="section-title">

                        <h2>Subjects</h2>

                        <p>
                            Subjects Offered
                        </p>

                    </div>


                    {course.subjects?.length > 0 ? (

                        <div className="row gy-3">

                            {course.subjects.map((subject) => (

                                <div
                                    className="col-lg-3 col-md-4 col-sm-6"
                                    key={subject.id}
                                >

                                    <div className="subject-item">

                                        <i className="bi bi-book"></i>

                                        <span>
                                            {subject.subject_name}
                                        </span>

                                    </div>

                                </div>

                            ))}

                        </div>

                    ) : (

                        <p className="text-center">
                            Subject information will be updated soon.
                        </p>

                    )}

                </div>

            </section>


            {/* =========================
                SUBJECT BOOKS
            ========================= */}

            <section className="courses section">

                <div
                    className="container"
                    data-aos="fade-up"
                >

                    <div className="section-title">

                        <h2>Books</h2>

                        <p>
                            Subject Books
                        </p>

                    </div>


                    {course.books?.length > 0 ? (

                        <div className="row gy-4">

                            {course.books.map((book, index) => {
                                const bookImage = getPublicCourseImageUrl(book.image);

                                return (
                                    <div
                                        className="col-lg-4 col-md-6"
                                        key={book.id}
                                        data-aos="zoom-in"
                                        data-aos-delay={(index + 1) * 100}
                                    >

                                        <div className="course-item book-item">

                                            {bookImage ? (
                                                <img
                                                    src={bookImage}
                                                    className="img-fluid"
                                                    alt={book.book_name}
                                                />
                                            ) : (
                                                <div
                                                    className="d-flex align-items-center justify-content-center"
                                                    style={{
                                                        height: "220px",
                                                        background: "#f5f5f5",
                                                    }}
                                                >
                                                    <i
                                                        className="bi bi-book"
                                                        style={{
                                                            fontSize: "60px",
                                                            opacity: 0.4,
                                                        }}
                                                    ></i>
                                                </div>
                                            )}

                                            <div className="course-content">

                                                <h3>
                                                    {book.book_name}
                                                </h3>

                                                {book.publisher && (
                                                    <p className="mb-0">
                                                        <strong>Publisher:</strong>{" "}
                                                        {book.publisher}
                                                    </p>
                                                )}

                                            </div>

                                        </div>

                                    </div>
                                );
                            })}

                        </div>

                    ) : (

                        <p className="text-center">
                            Book information will be updated soon.
                        </p>

                    )}

                </div>

            </section>

        </>
    );
}

export default CourseDetails;