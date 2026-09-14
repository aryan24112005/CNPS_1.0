import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
    getPublicCourses,
    getPublicCourseImageUrl,
} from "../services/courseService";

function CoursesSection() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCourses();
    }, []);

    const loadCourses = async () => {
        try {
            setLoading(true);

            const data = await getPublicCourses();

            setCourses(data || []);
        } catch (error) {
            console.error("Homepage Courses Error:", error);
            setCourses([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section id="courses" className="courses section">

            {/* Section Title */}
            <div className="container section-title">
                <h2>Classes</h2>
                <p>Academic Programs</p>
            </div>

            {/* Courses */}
            <div className="container">
                <div className="row">

                    {loading ? (
                        <div className="col-12 text-center">
                            <div className="spinner-border text-primary"></div>
                        </div>
                    ) : courses.length === 0 ? (
                        <div className="col-12 text-center">
                            <p className="text-muted">
                                No academic programs available.
                            </p>
                        </div>
                    ) : (
                        courses.map((course, index) => (

                            <div
                                className="col-lg-4 col-md-6 d-flex align-items-stretch mt-4"
                                data-aos="fade-up"
                                data-aos-delay={(index + 1) * 100}
                                key={course.id}
                            >

                                <div className="course-item w-100">

                                    <img
                                        src={getPublicCourseImageUrl(
                                            course.image
                                        )}
                                        className="img-fluid"
                                        alt={course.title}
                                    />

                                    <div className="course-content">

                                        <div className="d-flex justify-content-between align-items-center mb-3">

                                            <p className="category">
                                                {course.category || "Academic Program"}
                                            </p>

                                            <p className="price">
                                                {course.fee
                                                    ? course.fee
                                                    : ""}
                                            </p>

                                        </div>

                                        <h3>
                                            <Link to="/courses">
                                                {course.title}
                                            </Link>
                                        </h3>

                                        <p className="description">
                                            {course.description}
                                        </p>

                                    </div>

                                </div>

                            </div>

                        ))
                    )}

                </div>
            </div>

        </section>
    );
}

export default CoursesSection;