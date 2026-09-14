import { useState } from "react";
import { Link } from "react-router-dom";

function TeacherRegister() {
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState("");

    const [form, setForm] = useState({
        teacherName: "",
        qualification: "",
        subject: "",
        experience: "",
        mobile: "",
        email: "",
        password: "",
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
                                <h1>Teacher Registration</h1>
                                <p className="mb-0">
                                    Register as a teacher to access the school
                                    portal.
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
                                Teacher Registration
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
                                        <i className="bi bi-person-workspace"></i>
                                    </div>

                                    <h2>Teacher Registration</h2>

                                    <p>
                                        Enter your professional details to
                                        create your teacher account.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    <div className="row gy-3">

                                        <div className="col-md-6">
                                            <label>Full Name</label>
                                            <input
                                                type="text"
                                                name="teacherName"
                                                className="form-control"
                                                placeholder="Enter full name"
                                                value={form.teacherName}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label>Qualification</label>
                                            <input
                                                type="text"
                                                name="qualification"
                                                className="form-control"
                                                placeholder="e.g. B.Ed, M.Sc"
                                                value={form.qualification}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label>Subject</label>
                                            <input
                                                type="text"
                                                name="subject"
                                                className="form-control"
                                                placeholder="Enter subject"
                                                value={form.subject}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label>Experience</label>
                                            <input
                                                type="number"
                                                name="experience"
                                                className="form-control"
                                                placeholder="Years of experience"
                                                min="0"
                                                value={form.experience}
                                                onChange={handleChange}
                                                required
                                            />
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
                                                Register Teacher
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

export default TeacherRegister;