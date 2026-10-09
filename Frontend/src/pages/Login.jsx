import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminLogin } from "../admin/services/authService";

function Login() {
  const navigate = useNavigate();

  const [role, setRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    loginId: "",
    password: "",
    remember: false,
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.loginId.trim() || !formData.password.trim()) {
      setError("Please enter your Login ID and Password.");
      return;
    }

    if (role !== "admin") {
      setError(
        "Only Admin login is connected with the CMS currently."
      );
      return;
    }

    try {
      setError("");

      await adminLogin(
        formData.loginId.trim(),
        formData.password
      );

      navigate("/admin");
    } catch (error) {
      setError(
        error.message || "Invalid Admin credentials."
      );
    }
  };

  return (
    <>
      {/* Page Title */}
      <div className="page-title" data-aos="fade">
        <div className="heading">
          <div className="container">
            <div className="row justify-content-center text-center">
              <div className="col-lg-8">
                <h1>Login Portal</h1>

                <p className="mb-0">
                  Welcome to <strong>DS Convent School</strong>.
                  Login securely as a Student, Teacher or
                  Administrator.
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

              <li className="current">Login</li>
            </ol>
          </div>
        </nav>
      </div>

      {/* Login Section */}
      <section className="login-section section">
        <div className="container" data-aos="fade-up">

          <div className="row justify-content-center">

            <div className="col-lg-5 col-md-8">

              <div className="login-card">

                {/* Header */}
                <div className="login-card-header">
                  <div className="login-icon">
                    <i className="bi bi-person-circle"></i>
                  </div>

                  <h2>Welcome Back</h2>

                  <p>
                    Login to access your school portal
                  </p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit}>

                  {/* Role */}
                  <div className="mb-4">

                    <label className="form-label fw-semibold">
                      Login As
                    </label>

                    <div className="login-role-options">

                      <button
                        type="button"
                        className={
                          role === "student"
                            ? "login-role active"
                            : "login-role"
                        }
                        onClick={() =>
                          setRole("student")
                        }
                      >
                        <i className="bi bi-mortarboard-fill"></i>
                        <span>Student</span>
                      </button>

                      <button
                        type="button"
                        className={
                          role === "teacher"
                            ? "login-role active"
                            : "login-role"
                        }
                        onClick={() =>
                          setRole("teacher")
                        }
                      >
                        <i className="bi bi-person-workspace"></i>
                        <span>Teacher</span>
                      </button>

                      <button
                        type="button"
                        className={
                          role === "admin"
                            ? "login-role active"
                            : "login-role"
                        }
                        onClick={() =>
                          setRole("admin")
                        }
                      >
                        <i className="bi bi-shield-lock-fill"></i>
                        <span>Admin</span>
                      </button>

                    </div>
                  </div>

                  {/* Login ID */}
                  <div className="mb-3">

                    <label
                      htmlFor="loginId"
                      className="form-label"
                    >
                      Login ID
                    </label>

                    <div className="login-input-group">

                      <i className="bi bi-person"></i>

                      <input
                        type="text"
                        id="loginId"
                        name="loginId"
                        className="form-control"
                        placeholder={
                          role === "student"
                            ? "Enter Enrollment Number"
                            : role === "teacher"
                              ? "Enter Teacher ID"
                              : "Enter Admin ID"
                        }
                        value={formData.loginId}
                        onChange={handleChange}
                        required
                      />

                    </div>
                  </div>

                  {/* Password */}
                  <div className="mb-3">

                    <label
                      htmlFor="password"
                      className="form-label"
                    >
                      Password
                    </label>

                    <div className="login-input-group">

                      <i className="bi bi-lock-fill"></i>

                      <input
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        id="password"
                        name="password"
                        className="form-control"
                        placeholder="Enter Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />

                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() =>
                          setShowPassword(
                            !showPassword
                          )
                        }
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
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

                  {/* Remember + Forgot */}
                  <div className="login-options">

                    <label className="remember-me">
                      <input
                        type="checkbox"
                        name="remember"
                        checked={formData.remember}
                        onChange={handleChange}
                      />

                      <span>Remember Me</span>
                    </label>

                    <Link
                      to="/forgot-password"
                      className="forgot-password"
                    >
                      Forgot Password?
                    </Link>

                  </div>

                  {/* Error / Info */}
                  {error && (
                    <div className="login-message">
                      <i className="bi bi-info-circle"></i>
                      {error}
                    </div>
                  )}

                  {/* Login Button */}
                  <button
                    type="submit"
                    className="login-submit"
                  >
                    <i className="bi bi-box-arrow-in-right"></i>
                    Login
                  </button>

                </form>

                {/* Registration */}
                <div className="login-register">

                  {/* Register links disabled — StudentRegister and TeacherRegister pages have no backend */}
                  {/* <p>Don't have an account?</p>

                  <div className="register-buttons">

                    <Link
                      to="/student-register"
                      className="register-student"
                    >
                      Student Register
                    </Link>

                    <Link
                      to="/teacher-register"
                      className="register-teacher"
                    >
                      Teacher Register
                    </Link>

                  </div> */}

                </div>

              </div>

            </div>

          </div>

        </div>
      </section>
    </>
  );
}

export default Login;