import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function ForgotPassword() {
    const navigate = useNavigate();

    const API_URL =
        import.meta.env.VITE_API_URL ||
        "http://localhost:5000/api";

    const [step, setStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("info");

    const [resetToken, setResetToken] = useState("");

    const [form, setForm] = useState({
        email: "",
        otp: "",
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

    /*
    |--------------------------------------------------------------------------
    | Step 1 - Send OTP
    |--------------------------------------------------------------------------
    */

    const sendOtp = async (e) => {
        e.preventDefault();

        if (!form.email.trim()) {
            setMessage("Please enter your registered email.");
            setMessageType("error");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const response = await fetch(
                `${API_URL}/auth/forgot-password`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: form.email.trim(),
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to send OTP."
                );
            }

            setMessage(
                "If an account exists with this email, an OTP has been sent. Please check your inbox."
            );

            setMessageType("success");

            setStep(2);
        } catch (error) {
            console.error(
                "Send OTP Error:",
                error
            );

            setMessage(
                error.message ||
                "Unable to send OTP. Please try again."
            );

            setMessageType("error");
        } finally {
            setLoading(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Step 2 - Verify OTP
    |--------------------------------------------------------------------------
    */

    const verifyOtp = async (e) => {
        e.preventDefault();

        const cleanOtp = form.otp.trim();

        if (!cleanOtp) {
            setMessage("Please enter the OTP.");
            setMessageType("error");
            return;
        }

        if (!/^\d{6}$/.test(cleanOtp)) {
            setMessage(
                "Please enter a valid 6-digit OTP."
            );
            setMessageType("error");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const response = await fetch(
                `${API_URL}/auth/verify-reset-otp`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: form.email.trim(),
                        otp: cleanOtp,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Invalid OTP."
                );
            }

            if (!data.resetToken) {
                throw new Error(
                    "OTP verified but reset session was not created."
                );
            }

            // Store reset token only in component state.
            setResetToken(data.resetToken);

            setMessage("");
            setMessageType("success");

            setStep(3);
        } catch (error) {
            console.error(
                "Verify OTP Error:",
                error
            );

            setMessage(
                error.message ||
                "Unable to verify OTP."
            );

            setMessageType("error");
        } finally {
            setLoading(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Step 3 - Reset Password
    |--------------------------------------------------------------------------
    */

    const resetPassword = async (e) => {
        e.preventDefault();

        if (!resetToken) {
            setMessage(
                "Reset session is missing. Please start again."
            );
            setMessageType("error");
            return;
        }

        if (form.password.length < 8) {
            setMessage(
                "Password must be at least 8 characters long."
            );
            setMessageType("error");
            return;
        }

        if (
            form.password !==
            form.confirmPassword
        ) {
            setMessage(
                "Passwords do not match."
            );
            setMessageType("error");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const response = await fetch(
                `${API_URL}/auth/reset-password`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        resetToken,
                        password: form.password,
                        confirmPassword:
                            form.confirmPassword,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to reset password."
                );
            }

            setMessage(
                "Password reset successfully! Redirecting to login..."
            );

            setMessageType("success");

            // Clear sensitive values
            setForm({
                email: "",
                otp: "",
                password: "",
                confirmPassword: "",
            });

            setResetToken("");

            // Redirect after 2 seconds
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (error) {
            console.error(
                "Reset Password Error:",
                error
            );

            setMessage(
                error.message ||
                "Unable to reset password. Please try again."
            );

            setMessageType("error");
        } finally {
            setLoading(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Change Email
    |--------------------------------------------------------------------------
    */

    const changeEmail = () => {
        setStep(1);
        setMessage("");
        setMessageType("info");

        setForm({
            ...form,
            otp: "",
            password: "",
            confirmPassword: "",
        });

        setResetToken("");
    };

    return (
        <>
            <div
                className="page-title"
                data-aos="fade"
            >
                <div className="heading">
                    <div className="container">
                        <div className="row justify-content-center text-center">
                            <div className="col-lg-8">
                                <h1>Forgot Password</h1>

                                <p className="mb-0">
                                    Recover your school portal account securely.
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
                                <Link to="/login">
                                    Login
                                </Link>
                            </li>

                            <li className="current">
                                Forgot Password
                            </li>
                        </ol>
                    </div>
                </nav>
            </div>

            <section className="forgot-password-section section">
                <div
                    className="container"
                    data-aos="fade-up"
                >
                    <div className="row justify-content-center">
                        <div className="col-lg-5 col-md-8">

                            <div className="forgot-password-card">

                                <div className="forgot-password-icon">
                                    <i className="bi bi-shield-lock-fill"></i>
                                </div>

                                {/* ==================================================
                                    STEP 1
                                ================================================== */}

                                {step === 1 && (
                                    <>
                                        <div className="forgot-header">
                                            <h2>
                                                Forgot Password?
                                            </h2>

                                            <p>
                                                Enter your registered email
                                                address and we'll send you an
                                                OTP to verify your account.
                                            </p>
                                        </div>

                                        <form onSubmit={sendOtp}>

                                            <label>
                                                Email Address
                                            </label>

                                            <div className="forgot-input">
                                                <i className="bi bi-envelope"></i>

                                                <input
                                                    type="email"
                                                    name="email"
                                                    className="form-control"
                                                    placeholder="Enter registered email"
                                                    value={form.email}
                                                    onChange={handleChange}
                                                    required
                                                    disabled={loading}
                                                />
                                            </div>

                                            {message && (
                                                <div
                                                    className={`forgot-message ${messageType === "error"
                                                        ? "error"
                                                        : "success"
                                                        }`}
                                                >
                                                    <i
                                                        className={
                                                            messageType === "error"
                                                                ? "bi bi-exclamation-circle"
                                                                : "bi bi-check-circle"
                                                        }
                                                    ></i>

                                                    {message}
                                                </div>
                                            )}

                                            <button
                                                type="submit"
                                                className="forgot-submit"
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    <>
                                                        <span
                                                            className="spinner-border spinner-border-sm me-2"
                                                            role="status"
                                                        ></span>
                                                        Sending OTP...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="bi bi-send"></i>
                                                        Send OTP
                                                    </>
                                                )}
                                            </button>

                                        </form>
                                    </>
                                )}

                                {/* ==================================================
                                    STEP 2
                                ================================================== */}

                                {step === 2 && (
                                    <>
                                        <div className="forgot-header">
                                            <h2>
                                                Verify OTP
                                            </h2>

                                            <p>
                                                Enter the OTP sent to your
                                                registered email address.
                                            </p>
                                        </div>

                                        <form onSubmit={verifyOtp}>

                                            <label>
                                                OTP
                                            </label>

                                            <div className="forgot-input">
                                                <i className="bi bi-key"></i>

                                                <input
                                                    type="text"
                                                    name="otp"
                                                    className="form-control"
                                                    placeholder="Enter 6-digit OTP"
                                                    maxLength="6"
                                                    inputMode="numeric"
                                                    autoComplete="one-time-code"
                                                    value={form.otp}
                                                    onChange={(e) => {
                                                        const value =
                                                            e.target.value.replace(
                                                                /\D/g,
                                                                ""
                                                            );

                                                        setForm({
                                                            ...form,
                                                            otp: value,
                                                        });

                                                        setMessage("");
                                                    }}
                                                    required
                                                    disabled={loading}
                                                />
                                            </div>

                                            {message && (
                                                <div
                                                    className={`forgot-message ${messageType === "error"
                                                        ? "error"
                                                        : "success"
                                                        }`}
                                                >
                                                    <i
                                                        className={
                                                            messageType === "error"
                                                                ? "bi bi-exclamation-circle"
                                                                : "bi bi-check-circle"
                                                        }
                                                    ></i>

                                                    {message}
                                                </div>
                                            )}

                                            <button
                                                type="submit"
                                                className="forgot-submit"
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    <>
                                                        <span
                                                            className="spinner-border spinner-border-sm me-2"
                                                            role="status"
                                                        ></span>
                                                        Verifying...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="bi bi-check-circle"></i>
                                                        Verify OTP
                                                    </>
                                                )}
                                            </button>

                                            <button
                                                type="button"
                                                className="forgot-back"
                                                onClick={changeEmail}
                                                disabled={loading}
                                            >
                                                Change Email
                                            </button>

                                        </form>
                                    </>
                                )}

                                {/* ==================================================
                                    STEP 3
                                ================================================== */}

                                {step === 3 && (
                                    <>
                                        <div className="forgot-header">
                                            <h2>
                                                Reset Password
                                            </h2>

                                            <p>
                                                Create a new password for your
                                                school portal account.
                                            </p>
                                        </div>

                                        <form
                                            onSubmit={
                                                resetPassword
                                            }
                                        >

                                            <label>
                                                New Password
                                            </label>

                                            <div className="forgot-password-input">

                                                <input
                                                    type={
                                                        showPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    name="password"
                                                    className="form-control"
                                                    placeholder="Enter new password"
                                                    value={
                                                        form.password
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                    minLength="8"
                                                    autoComplete="new-password"
                                                    required
                                                    disabled={loading}
                                                />

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setShowPassword(
                                                            !showPassword
                                                        )
                                                    }
                                                    disabled={loading}
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

                                            <label className="mt-3">
                                                Confirm Password
                                            </label>

                                            <div className="forgot-password-input">

                                                <input
                                                    type={
                                                        showConfirm
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    name="confirmPassword"
                                                    className="form-control"
                                                    placeholder="Confirm new password"
                                                    value={
                                                        form.confirmPassword
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                    minLength="8"
                                                    autoComplete="new-password"
                                                    required
                                                    disabled={loading}
                                                />

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setShowConfirm(
                                                            !showConfirm
                                                        )
                                                    }
                                                    disabled={loading}
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

                                            <small
                                                style={{
                                                    display: "block",
                                                    marginTop: "8px",
                                                    color: "#777",
                                                }}
                                            >
                                                Password must be at least
                                                8 characters long.
                                            </small>

                                            {message && (
                                                <div
                                                    className={`forgot-message ${messageType === "error"
                                                        ? "error"
                                                        : "success"
                                                        }`}
                                                >
                                                    <i
                                                        className={
                                                            messageType === "error"
                                                                ? "bi bi-exclamation-circle"
                                                                : "bi bi-check-circle"
                                                        }
                                                    ></i>

                                                    {message}
                                                </div>
                                            )}

                                            <button
                                                type="submit"
                                                className="forgot-submit"
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    <>
                                                        <span
                                                            className="spinner-border spinner-border-sm me-2"
                                                            role="status"
                                                        ></span>
                                                        Resetting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="bi bi-arrow-repeat"></i>
                                                        Reset Password
                                                    </>
                                                )}
                                            </button>

                                        </form>
                                    </>
                                )}

                                <div className="forgot-footer">
                                    Remember your password?

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

export default ForgotPassword;