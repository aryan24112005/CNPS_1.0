import { Link, Navigate, useParams } from "react-router-dom";
import { courses } from "../data/courses";

function CourseClasses() {
    const { courseId } = useParams();

    const course = courses[courseId];

    // Course exist nahi karta
    if (!course) {
        return (
            <div className="container section text-center">
                <h2>Course Not Found</h2>

                <Link to="/courses">
                    Back to Courses
                </Link>
            </div>
        );
    }

    // Single courses:
    // Nursery, LKG, UKG, PCM, PCB, Commerce
    if (course.type === "single") {
        return (
            <Navigate
                to={`/course-details/${courseId}`}
                replace
            />
        );
    }

    // Group courses:
    // Primary, Middle, Secondary
    return (
        <>
            <div className="page-title" data-aos="fade">

                <div className="heading">

                    <div className="container">

                        <div className="row justify-content-center text-center">

                            <div className="col-lg-8">

                                <h1>{course.title}</h1>

                                <p>
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


            <section className="courses section">

                <div className="container section-title">

                    <h2>
                        {course.category}
                    </h2>

                    <p>
                        Select Your Class
                    </p>

                </div>


                <div className="container">

                    <div className="row">

                        {course.classes.map((classItem, index) => (

                            <div
                                className="col-lg-4 col-md-6 d-flex align-items-stretch"
                                data-aos="zoom-in"
                                data-aos-delay={(index + 1) * 100}
                                key={classItem.id}
                            >

                                <div className="course-item">

                                    <img
                                        src={classItem.image}
                                        className="img-fluid"
                                        alt={classItem.title}
                                    />

                                    <div className="course-content">

                                        <h3>

                                            <Link
                                                to={`/course-details/${courseId}/${classItem.id}`}
                                            >
                                                {classItem.title}
                                            </Link>

                                        </h3>


                                        <p className="description">
                                            View syllabus, books, teacher,
                                            timetable and fee details.
                                        </p>

                                    </div>

                                </div>

                            </div>

                        ))}

                    </div>

                </div>

            </section>
        </>
    );
}

export default CourseClasses;