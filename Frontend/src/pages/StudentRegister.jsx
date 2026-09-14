import { useState } from "react";
import { Link } from "react-router-dom";

function StudentRegister() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [message, setMessage] = useState("");

    const [form, setForm] = useState({
        studentName: "",
        dob: "",
        className: "",
        mobile: "",
        fatherName: "",
        motherName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
        setMessage("");
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (form.password !== form.confirmPassword) {
            setMessage("Passwords do not match.");
            return;
        }

        // Backend API will be connected later.
        console.log(form);

        setMessage(
            "Registration service will be connected with the school portal soon."
        );
    };

    return (
        <>
            <div className="page-title" data-aos="fade">
                <div className="heading">
                    <div className="container">
                        <div className="row justify-content-center text-center">
                            <div className="col-lg-8">
                                <h1>Student Registration</h1>
                                <p className="mb-0">
                                    Create your student account to access the
                                    school portal.
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
                            <li>
                                <Link to="/login">Login</Link>
                            </li>
                            <li className="current">
                                Student Registration
                            </li>
                        </ol>
                    </div>
                </nav>
            </div>

            <section className="registration-section section">
                <div className="container" data-aos="fade-up">
                    <div className="row justify-content-center">
                        <div className="col-lg-9">
                            <div className="registration-card">

                                <div className="registration-header">
                                    <div className="registration-icon">
                                        <i className="bi bi-mortarboard-fill"></i>
                                    </div>

                                    <h2>Student Registration</h2>
                                    <p>
                                        Enter your details to create your
                                        student account.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    <div className="row gy-3">

                                        <div className="col-md-6">
                                            <label>Student Name</label>
                                            <input
                                                type="text"
                                                name="studentName"
                                                className="form-control"
                                                placeholder="Enter student name"
                                                value={form.studentName}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label>Date of Birth</label>
                                            <input
                                                type="date"
                                                name="dob"
                                                className="form-control"
                                                value={form.dob}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label>Class</label>
                                            <select
                                                name="className"
                                                className="form-select"
                                                value={form.className}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">
                                                    Select Class
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
                                                            Class {index + 1}
                                                        </option>
                                                    )
                                                )}
                                            </select>
                                        </div>

                                        <div className="col-md-6">
                                            <label>Mobile</label>
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

                                        <div className="col-md-6">
                                            <label>Father Name</label>
                                            <input
                                                type="text"
                                                name="fatherName"
                                                className="form-control"
                                                placeholder="Enter father's name"
                                                value={form.fatherName}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label>Mother Name</label>
                                            <input
                                                type="text"
                                                name="motherName"
                                                className="form-control"
                                                placeholder="Enter mother's name"
                                                value={form.motherName}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label>Email</label>
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

                                        <div className="col-md-6">
                                            <label>Password</label>

                                            <div className="registration-password">
                                                <input
                                                    type={
                                                        showPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    name="password"
                                                    className="form-control"
                                                    placeholder="Create password"
                                                    value={form.password}
                                                    onChange={handleChange}
                                                    required
                                                />

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setShowPassword(
                                                            !showPassword
                                                        )
                                                    }
                                                >
                                                    <i
                                                        className={
                                                            showPassword
                                                                ? "bi bi-eye-slash"
                                                                : "bi bi-eye"
                                                        }
                                                    ></i>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <label>Confirm Password</label>

                                            <div className="registration-password">
                                                <input
                                                    type={
                                                        showConfirm
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    name="confirmPassword"
                                                    className="form-control"
                                                    placeholder="Confirm password"
                                                    value={
                                                        form.confirmPassword
                                                    }
                                                    onChange={handleChange}
                                                    required
                                                />

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setShowConfirm(
                                                            !showConfirm
                                                        )
                                                    }
                                                >
                                                    <i
                                                        className={
                                                            showConfirm
                                                                ? "bi bi-eye-slash"
                                                                : "bi bi-eye"
                                                        }
                                                    ></i>
                                                </button>
                                            </div>
                                        </div>

                                        {message && (
                                            <div className="col-12">
                                                <div className="registration-message">
                                                    <i className="bi bi-info-circle"></i>
                                                    {message}
                                                </div>
                                            </div>
                                        )}

                                        <div className="col-12 text-center mt-4">
                                            <button
                                                type="submit"
                                                className="registration-submit"
                                            >
                                                <i className="bi bi-person-plus-fill"></i>
                                                Register Student
                                            </button>
                                        </div>

                                    </div>
                                </form>

                                <div className="registration-footer">
                                    Already registered?
                                    <Link to="/login">
                                        Login Here
                                    </Link>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

export default StudentRegister;