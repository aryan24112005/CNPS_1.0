import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    getPublicCourses,
    getPublicCourseImageUrl
} from "../services/courseService";

function Courses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadCourses();
    }, []);

    const loadCourses = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getPublicCourses();

            setCourses(data || []);
        } catch (err) {
            console.error("Courses Error:", err);
            setError(err.message || "Failed to load courses.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container section text-center">
                <div className="spinner-border text-primary"></div>
                <p className="mt-3">Loading academic programs...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container section text-center">
                <h3>Unable to load courses</h3>
                <p className="text-muted">{error}</p>

                <button
                    className="btn btn-primary"
                    onClick={loadCourses}
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <>
            {/* PAGE TITLE */}
            <div className="page-title" data-aos="fade">
                <div className="heading">
                    <div className="container">
                        <div className="row d-flex justify-content-center text-center">
                            <div className="col-lg-8">
                                <h1>Academic Programs</h1>

                                <p className="mb-0">
                                    Explore our academic programs and
                                    learning opportunities.
                                </p>
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
                                Courses
                            </li>
                        </ol>
                    </div>
                </nav>
            </div>

            {/* COURSES */}
            <section
                id="courses"
                className="courses section"
            >
                <div className="container">

                    <div className="row gy-4">

                        {courses.length === 0 ? (
                            <div className="col-12 text-center">
                                <h4>No academic programs available.</h4>
                            </div>
                        ) : (
                            courses.map((course) => (
                                <div
                                    className="col-lg-4 col-md-6"
                                    key={course.id}
                                >
                                    <div className="course-item">

                                        {/* IMAGE */}
                                        <div className="course-img">
                                            {course.image ? (
                                                <img
                                                    src={getPublicCourseImageUrl(
                                                        course.image
                                                    )}
                                                    className="img-fluid"
                                                    alt={course.title}
                                                />
                                            ) : (
                                                <img
                                                    src="/assets/img/hero-bg.png"
                                                    className="img-fluid"
                                                    alt={course.title}
                                                />
                                            )}
                                        </div>

                                        {/* CONTENT */}
                                        <div className="course-content">

                                            <h3>
                                                <Link
                                                    to={`/course-details/${course.id}`}
                                                >
                                                    {course.title}
                                                </Link>
                                            </h3>

                                            <p className="category">
                                                {course.category || ""}
                                            </p>

                                            <p>
                                                {course.short_description ||
                                                    course.description ||
                                                    ""}
                                            </p>

                                            <Link
                                                to={`/course-details/${course.id}`}
                                                className="read-more"
                                            >
                                                View Details
                                                <i className="bi bi-arrow-right ms-2"></i>
                                            </Link>

                                        </div>

                                    </div>
                                </div>
                            ))
                        )}

                    </div>

                </div>
            </section>
        </>
    );
}

export default Courses;