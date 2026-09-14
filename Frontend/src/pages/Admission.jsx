import { useState } from "react";
import { Link } from "react-router-dom";

import {
    submitAdmissionApplication,
} from "../services/admissionService.js";

function Admission() {
    const [form, setForm] = useState({
        student_name: "",
        dob: "",
        gender: "",
        class_name: "",
        stream: "",
        science_group: "",
        father_name: "",
        mother_name: "",
        mobile: "",
        email: "",
        address: "",
    });

    const [status, setStatus] = useState("");

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((current) => ({
            ...current,
            [name]: value,

            // Reset dependent fields
            ...(name === "class_name" && !["11", "12"].includes(value)
                ? {
                    stream: "",
                    science_group: "",
                }
                : {}),

            ...(name === "stream" && value !== "Science"
                ? {
                    science_group: "",
                }
                : {}),
        }));

        setStatus("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setStatus("");

        try {
            const response =
                await submitAdmissionApplication(form);

            setStatus(
                response.message ||
                "Admission application submitted successfully. Our admission team will contact you soon."
            );

            // Reset form only after successful submission
            setForm({
                student_name: "",
                dob: "",
                gender: "",
                class_name: "",
                stream: "",
                science_group: "",
                father_name: "",
                mother_name: "",
                mobile: "",
                email: "",
                address: "",
            });
        } catch (error) {
            console.error(
                "Admission Submission Error:",
                error
            );

            setStatus(
                error.message ||
                "Unable to submit admission application. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const isSeniorClass =
        form.class_name === "11" || form.class_name === "12";

    return (
        <>
            {/* =========================
                Page Title
            ========================== */}
            <div className="page-title" data-aos="fade">
                <div className="heading">
                    <div className="container">
                        <div className="row justify-content-center text-center">
                            <div className="col-lg-8">
                                <h1>Admission</h1>

                                <p className="mb-0">
                                    Begin your child's educational journey
                                    with DS Convent School. Fill out the
                                    admission application form below.
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
                            <li className="current">Admission</li>
                        </ol>
                    </div>
                </nav>
            </div>

            {/* =========================
                Admission Section
            ========================== */}
            <section className="admission-section section">
                <div
                    className="container"
                    data-aos="fade-up"
                >
                    <div className="row gy-5">

                        {/* =========================
                            Left Information
                        ========================== */}
                        <div className="col-lg-4">

                            <div className="admission-info">

                                <div className="admission-info-header">
                                    <div className="admission-icon">
                                        <i className="bi bi-mortarboard-fill"></i>
                                    </div>

                                    <h2>Admissions Open</h2>

                                    <p>
                                        Take the first step towards a
                                        bright and meaningful educational
                                        journey.
                                    </p>
                                </div>

                                <div className="admission-feature">
                                    <i className="bi bi-book-fill"></i>

                                    <div>
                                        <h4>Quality Education</h4>
                                        <p>
                                            A strong academic foundation
                                            with a focus on overall
                                            development.
                                        </p>
                                    </div>
                                </div>

                                <div className="admission-feature">
                                    <i className="bi bi-lightbulb-fill"></i>

                                    <div>
                                        <h4>Smart Learning</h4>
                                        <p>
                                            Digital classrooms and
                                            activity-based learning.
                                        </p>
                                    </div>
                                </div>

                                <div className="admission-feature">
                                    <i className="bi bi-trophy-fill"></i>

                                    <div>
                                        <h4>Sports & Activities</h4>
                                        <p>
                                            Balanced focus on academics
                                            and extracurricular activities.
                                        </p>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* =========================
                            Admission Form
                        ========================== */}
                        <div className="col-lg-8">

                            <div className="admission-card">

                                <div className="admission-card-header">
                                    <h2>Admission Application Form</h2>

                                    <p>
                                        Please provide the required
                                        information carefully.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit}>

                                    <div className="row gy-3">

                                        {/* Student Name */}
                                        <div className="col-md-6">
                                            <label>
                                                Student Name
                                            </label>

                                            <input
                                                type="text"
                                                name="student_name"
                                                className="form-control"
                                                placeholder="Enter student name"
                                                value={form.student_name}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        {/* DOB */}
                                        <div className="col-md-6">
                                            <label>
                                                Date of Birth
                                            </label>

                                            <input
                                                type="date"
                                                name="dob"
                                                className="form-control"
                                                value={form.dob}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        {/* Gender */}
                                        <div className="col-md-6">
                                            <label>
                                                Gender
                                            </label>

                                            <select
                                                name="gender"
                                                className="form-select"
                                                value={form.gender}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">
                                                    Select Gender
                                                </option>

                                                <option value="Male">
                                                    Male
                                                </option>

                                                <option value="Female">
                                                    Female
                                                </option>

                                                <option value="Other">
                                                    Other
                                                </option>
                                            </select>
                                        </div>

                                        {/* Class */}
                                        <div className="col-md-6">
                                            <label>
                                                Class Applying For
                                            </label>

                                            <select
                                                name="class_name"
                                                className="form-select"
                                                value={form.class_name}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">
                                                    Select Class
                                                </option>

                                                <option value="Nursery">
                                                    Nursery
                                                </option>

                                                <option value="LKG">
                                                    LKG
                                                </option>

                                                <option value="UKG">
                                                    UKG
                                                </option>

                                                {Array.from(
                                                    { length: 12 },
                                                    (_, index) => (
                                                        <option
                                                            key={index + 1}
                                                            value={
                                                                index + 1
                                                            }
                                                        >
                                                            Class{" "}
                                                            {index + 1}
                                                        </option>
                                                    )
                                                )}
                                            </select>
                                        </div>

                                        {/* Stream */}
                                        {isSeniorClass && (
                                            <div className="col-md-6">
                                                <label>
                                                    Stream
                                                </label>

                                                <select
                                                    name="stream"
                                                    className="form-select"
                                                    value={form.stream}
                                                    onChange={handleChange}
                                                    required
                                                >
                                                    <option value="">
                                                        Select Stream
                                                    </option>

                                                    <option value="Science">
                                                        Science
                                                    </option>

                                                    <option value="Commerce">
                                                        Commerce
                                                    </option>

                                                    <option value="Arts">
                                                        Arts
                                                    </option>
                                                </select>
                                            </div>
                                        )}

                                        {/* Science Group */}
                                        {isSeniorClass &&
                                            form.stream === "Science" && (
                                                <div className="col-md-6">
                                                    <label>
                                                        Science Group
                                                    </label>

                                                    <select
                                                        name="science_group"
                                                        className="form-select"
                                                        value={
                                                            form.science_group
                                                        }
                                                        onChange={
                                                            handleChange
                                                        }
                                                        required
                                                    >
                                                        <option value="">
                                                            Select Group
                                                        </option>

                                                        <option value="PCM">
                                                            Physics +
                                                            Chemistry +
                                                            Mathematics (PCM)
                                                        </option>

                                                        <option value="PCB">
                                                            Physics +
                                                            Chemistry +
                                                            Biology (PCB)
                                                        </option>
                                                    </select>
                                                </div>
                                            )}

                                        {/* Father */}
                                        <div className="col-md-6">
                                            <label>
                                                Father's Name
                                            </label>

                                            <input
                                                type="text"
                                                name="father_name"
                                                className="form-control"
                                                placeholder="Enter father's name"
                                                value={form.father_name}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        {/* Mother */}
                                        <div className="col-md-6">
                                            <label>
                                                Mother's Name
                                            </label>

                                            <input
                                                type="text"
                                                name="mother_name"
                                                className="form-control"
                                                placeholder="Enter mother's name"
                                                value={form.mother_name}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        {/* Mobile */}
                                        <div className="col-md-6">
                                            <label>
                                                Mobile Number
                                            </label>

                                            <input
                                                type="tel"
                                                name="mobile"
                                                className="form-control"
                                                placeholder="Enter mobile number"
                                                value={form.mobile}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        {/* Email */}
                                        <div className="col-md-6">
                                            <label>
                                                Email Address
                                            </label>

                                            <input
                                                type="email"
                                                name="email"
                                                className="form-control"
                                                placeholder="Enter email address"
                                                value={form.email}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        {/* Address */}
                                        <div className="col-md-12">
                                            <label>
                                                Address
                                            </label>

                                            <textarea
                                                name="address"
                                                className="form-control"
                                                rows="4"
                                                placeholder="Enter complete address"
                                                value={form.address}
                                                onChange={handleChange}
                                                required
                                            ></textarea>
                                        </div>

                                        {/* Success */}
                                        {status && (
                                            <div className="col-md-12">
                                                <div className="admission-success">
                                                    <i className="bi bi-check-circle-fill"></i>

                                                    <span>
                                                        {status}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Submit */}
                                        <div className="col-md-12 text-center mt-4">
                                            <button
                                                type="submit"
                                                className="admission-submit"
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    <>
                                                        <span
                                                            className="spinner-border spinner-border-sm me-2"
                                                            role="status"
                                                            aria-hidden="true"
                                                        ></span>

                                                        Submitting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="bi bi-send-fill"></i>
                                                        Submit Admission Application
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                    </div>
                                </form>

                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

export default Admission;