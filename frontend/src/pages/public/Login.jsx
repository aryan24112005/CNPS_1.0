import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { loginAdmin, forgotPassword, resetPassword } from "../../services/adminService";

/* ── Shared style helpers ────────────────────────────────── */
const inputBase = (hasError) => ({
  width: "100%", padding: "12px 16px",
  borderRadius: "var(--radius-md)",
  border: `1.5px solid ${hasError ? "var(--danger)" : "var(--border)"}`,
  fontSize: "0.95rem", color: "var(--text-main)",
  outline: "none", background: "#fff",
  fontFamily: "var(--font-body)", transition: "border-color 0.2s",
  boxSizing: "border-box",
});

const labelStyle = {
  display: "block", fontSize: "0.88rem", fontWeight: 600,
  color: "var(--navy)", marginBottom: 6,
};
const errStyle = { fontSize: "0.78rem", color: "var(--danger)", marginTop: 4 };

function FieldError({ msg }) {
  return msg ? <div style={errStyle}>{msg}</div> : null;
}

function IconInput({ id, name, type, value, onChange, onFocus, onBlur, placeholder, icon, hasError, children }) {
  return (
    <div style={{ position: "relative" }}>
      <i className={`bi bi-${icon}`} style={{
        position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
        color: "var(--text-muted)", pointerEvents: "none",
      }} />
      <input
        id={id} name={name} type={type} value={value}
        onChange={onChange} onFocus={onFocus} onBlur={onBlur}
        placeholder={placeholder}
        autoComplete={name === "email" ? "email" : name === "password" ? "current-password" : "off"}
        style={{ ...inputBase(hasError), paddingLeft: 42, paddingRight: children ? 44 : 16 }}
      />
      {children}
    </div>
  );
}

function ServerError({ msg }) {
  if (!msg) return null;
  return (
    <div style={{
      padding: "12px 16px", background: "#FEF2F2",
      border: "1px solid #FECACA", borderRadius: "var(--radius-sm)",
      color: "var(--danger)", fontSize: "0.88rem",
      marginBottom: 18, display: "flex", gap: 8, alignItems: "flex-start",
    }}>
      <i className="bi bi-exclamation-circle-fill" style={{ flexShrink: 0, marginTop: 2 }} />
      {msg}
    </div>
  );
}

function SuccessBox({ msg }) {
  if (!msg) return null;
  return (
    <div style={{
      padding: "12px 16px", background: "#F0FDF4",
      border: "1px solid #BBF7D0", borderRadius: "var(--radius-sm)",
      color: "#15803D", fontSize: "0.88rem",
      marginBottom: 18, display: "flex", gap: 8, alignItems: "flex-start",
    }}>
      <i className="bi bi-check-circle-fill" style={{ flexShrink: 0, marginTop: 2 }} />
      {msg}
    </div>
  );
}

function SubmitBtn({ loading, label, loadingLabel, icon }) {
  return (
    <button
      type="submit"
      disabled={loading}
      style={{
        width: "100%", padding: "13px 24px",
        background: loading ? "var(--text-muted)" : "linear-gradient(135deg, var(--primary), #0D8FC5)",
        color: "#fff", border: "none", borderRadius: "var(--radius-pill)",
        fontSize: "1rem", fontWeight: 700,
        cursor: loading ? "not-allowed" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        fontFamily: "var(--font-body)", transition: "opacity 0.2s",
        boxShadow: loading ? "none" : "0 4px 16px rgba(22,168,224,0.3)",
      }}
    >
      {loading ? (
        <>
          <span style={{
            width: 18, height: 18,
            border: "2.5px solid rgba(255,255,255,0.4)",
            borderTopColor: "#fff", borderRadius: "50%",
            display: "inline-block", animation: "spin 0.7s linear infinite",
          }} />
          {loadingLabel}
        </>
      ) : (
        <><i className={`bi bi-${icon}`} />{label}</>
      )}
    </button>
  );
}

/* ── Forgot Password Modal ────────────────────────────────── */
function ForgotPasswordModal({ onClose }) {
  const [email,    setEmail]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState("");
  const [devToken, setDevToken] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError("Email address is required."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Enter a valid email address."); return; }
    setLoading(true); setError(""); setSuccess(""); setDevToken("");
    try {
      const res = await forgotPassword({ email: email.trim() });
      setSuccess(res.message || "Check your email for a reset link.");
      if (res.resetToken) setDevToken(res.resetToken);
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog" aria-modal="true" aria-label="Forgot password"
      style={{
        position: "fixed", inset: 0, background: "rgba(16,42,67,0.6)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 2000, padding: 16, animation: "fadeIn 0.2s ease",
        overflowY: "auto",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        width: "100%", maxWidth: 440, background: "#fff",
        borderRadius: "var(--radius-xl)",
        boxShadow: "0 24px 64px rgba(16,42,67,0.35)",
        overflow: "hidden", animation: "modalIn 0.25s ease",
      }}>
        <div style={{ height: 4, background: "linear-gradient(90deg, var(--primary), var(--gold))" }} />
        <div style={{ padding: "clamp(20px, 5vw, 28px) clamp(16px, 5vw, 32px)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <div style={{
                width: 44, height: 44, background: "var(--bg-soft-blue)",
                borderRadius: "var(--radius-md)", display: "flex", alignItems: "center",
                justifyContent: "center", marginBottom: 12,
              }}>
                <i className="bi bi-key-fill" style={{ fontSize: "1.3rem", color: "var(--primary)" }} />
              </div>
              <h3 style={{ margin: 0, color: "var(--navy)", fontSize: "1.2rem" }}>Forgot Password?</h3>
              <p style={{ margin: "6px 0 0", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                Enter your admin email to receive a reset link.
              </p>
            </div>
            <button onClick={onClose} aria-label="Close" style={{
              background: "var(--bg-section)", border: "none",
              borderRadius: "var(--radius-sm)", width: 32, height: 32,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "var(--text-secondary)", fontSize: "1rem", flexShrink: 0,
            }}>
              <i className="bi bi-x-lg" />
            </button>
          </div>

          <SuccessBox msg={success} />
          <ServerError msg={error} />

          {devToken && (
            <div style={{
              padding: "12px 14px", background: "#FFF7ED",
              border: "1px solid #FED7AA", borderRadius: "var(--radius-sm)",
              marginBottom: 16, fontSize: "0.8rem", color: "#92400E",
            }}>
              <strong>Dev mode:</strong> SMTP not configured. Your reset token:
              <div style={{
                marginTop: 8, padding: "8px 10px", background: "#fff",
                borderRadius: "var(--radius-sm)", border: "1px solid #FED7AA",
                fontFamily: "monospace", wordBreak: "break-all",
                userSelect: "all", fontSize: "0.78rem", color: "#92400E",
              }}>
                {devToken}
              </div>
            </div>
          )}

          {!success ? (
            <form onSubmit={handleSubmit} noValidate>
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Email Address</label>
                <IconInput
                  name="email" type="email" value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
                  onBlur={(e)  => (e.target.style.borderColor = error ? "var(--danger)" : "var(--border)")}
                  placeholder="admin@cnps.in" icon="envelope" hasError={!!error}
                />
              </div>
              <SubmitBtn loading={loading} label="Send Reset Link" loadingLabel="Sending…" icon="send-fill" />
            </form>
          ) : (
            <button onClick={onClose} style={{
              width: "100%", padding: 12, background: "var(--bg-soft-blue)",
              color: "var(--primary)", border: "none", borderRadius: "var(--radius-pill)",
              fontSize: "0.95rem", fontWeight: 600, cursor: "pointer",
              fontFamily: "var(--font-body)",
            }}>
              Back to Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Reset Password Form ──────────────────────────────────── */
function ResetPasswordForm({ token, onSuccess }) {
  const [form,     setForm]     = useState({ password: "", confirm: "" });
  const [showPwd,  setShowPwd]  = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);
  const [serverErr,setServerErr]= useState("");

  const validate = () => {
    const e = {};
    if (!form.password)              e.password = "New password is required.";
    else if (form.password.length < 8) e.password = "Password must be at least 8 characters.";
    if (!form.confirm)               e.confirm  = "Please confirm your password.";
    else if (form.password !== form.confirm) e.confirm = "Passwords do not match.";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((err) => ({ ...err, [name]: "" }));
    setServerErr("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true); setServerErr("");
    try {
      const res = await resetPassword({ token, password: form.password });
      onSuccess(res.message || "Password reset successfully.");
    } catch (err) {
      setServerErr(err?.response?.data?.message || "Failed to reset password. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  const eyeBtn = (show, toggle) => (
    <button type="button" onClick={toggle} tabIndex={-1} aria-label={show ? "Hide password" : "Show password"}
      style={{
        position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
        background: "none", border: "none", cursor: "pointer",
        color: "var(--text-muted)", fontSize: "1rem",
        display: "flex", alignItems: "center", padding: 4,
      }}>
      <i className={show ? "bi bi-eye-slash" : "bi bi-eye"} />
    </button>
  );

  return (
    <>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{
          width: 68, height: 68,
          background: "linear-gradient(135deg, var(--primary), var(--navy))",
          borderRadius: "var(--radius-lg)", display: "inline-flex",
          alignItems: "center", justifyContent: "center",
          marginBottom: 16, boxShadow: "0 8px 24px rgba(22,168,224,0.3)",
        }}>
          <i className="bi bi-shield-lock-fill" style={{ fontSize: "1.9rem", color: "#fff" }} />
        </div>
        <h1 style={{ fontSize: "1.55rem", fontFamily: "var(--font-heading)", fontWeight: 700, color: "var(--navy)", marginBottom: 4 }}>
          Reset Password
        </h1>
        <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", margin: 0 }}>
          Enter and confirm your new password below.
        </p>
      </div>
      <ServerError msg={serverErr} />
      <form onSubmit={handleSubmit} noValidate>
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>New Password</label>
          <div style={{ position: "relative" }}>
            <i className="bi bi-lock" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
            <input name="password" type={showPwd ? "text" : "password"} value={form.password}
              onChange={handleChange} placeholder="Minimum 8 characters" autoComplete="new-password"
              style={{ ...inputBase(!!errors.password), paddingLeft: 42, paddingRight: 44 }}
              onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
              onBlur={(e)  => (e.target.style.borderColor = errors.password ? "var(--danger)" : "var(--border)")}
            />
            {eyeBtn(showPwd, () => setShowPwd((s) => !s))}
          </div>
          <FieldError msg={errors.password} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Confirm New Password</label>
          <div style={{ position: "relative" }}>
            <i className="bi bi-lock-fill" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
            <input name="confirm" type={showConf ? "text" : "password"} value={form.confirm}
              onChange={handleChange} placeholder="Re-enter your new password" autoComplete="new-password"
              style={{ ...inputBase(!!errors.confirm), paddingLeft: 42, paddingRight: 44 }}
              onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
              onBlur={(e)  => (e.target.style.borderColor = errors.confirm ? "var(--danger)" : "var(--border)")}
            />
            {eyeBtn(showConf, () => setShowConf((s) => !s))}
          </div>
          <FieldError msg={errors.confirm} />
        </div>
        <SubmitBtn loading={loading} label="Set New Password" loadingLabel="Saving…" icon="check-circle-fill" />
      </form>
    </>
  );
}

/* ── Main Login Page ──────────────────────────────────────── */
export default function Login() {
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const resetToken     = searchParams.get("resetToken") || "";

  const [form,         setForm]         = useState({ email: "", password: "" });
  const [errors,       setErrors]       = useState({});
  const [loading,      setLoading]      = useState(false);
  const [serverError,  setServerError]  = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgot,   setShowForgot]   = useState(false);
  const [resetSuccess, setResetSuccess] = useState("");

  useEffect(() => {
    if (localStorage.getItem("cnps_token")) navigate("/admin", { replace: true });
  }, [navigate]);

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email address.";
    if (!form.password) e.password = "Password is required.";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((err) => ({ ...err, [name]: "" }));
    setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true); setServerError("");
    try {
      const res = await loginAdmin(form);
      localStorage.setItem("cnps_token", res.token);
      localStorage.setItem("cnps_admin", JSON.stringify(res.admin || res.data || {}));
      navigate("/admin", { replace: true });
    } catch (err) {
      setServerError(err?.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, var(--navy) 0%, #1a3a56 50%, #0D8FC5 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      /* clamp padding: 12px on tiny phones → 24px on wider */
      padding: "clamp(12px, 4vw, 24px)",
    }}>
      {/* Card — maxWidth 420px, full width on small screens */}
      <div style={{
        width: "100%", maxWidth: 420,
        background: "#fff", borderRadius: "var(--radius-xl)",
        boxShadow: "0 24px 64px rgba(16,42,67,0.35)",
        overflow: "hidden",
      }}>
        {/* Accent bar */}
        <div style={{ height: 5, background: "linear-gradient(90deg, var(--primary), var(--gold))" }} />

        {/* Card body — clamp padding for mobile safety */}
        <div style={{ padding: "clamp(20px, 6vw, 40px) clamp(16px, 6vw, 36px)" }}>

          {/* ── Reset success ── */}
          {resetSuccess ? (
            <div style={{ textAlign: "center" }}>
              <div style={{
                width: 72, height: 72, background: "#DCFCE7", borderRadius: "50%",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                marginBottom: 20,
              }}>
                <i className="bi bi-check-circle-fill" style={{ fontSize: "2.2rem", color: "#15803D" }} />
              </div>
              <h2 style={{ marginBottom: 10, color: "var(--navy)" }}>Password Updated!</h2>
              <p style={{ color: "var(--text-secondary)", marginBottom: 28, fontSize: "0.92rem" }}>
                {resetSuccess}
              </p>
              <button onClick={() => navigate("/login", { replace: true })} style={{
                width: "100%", padding: 13,
                background: "linear-gradient(135deg, var(--primary), #0D8FC5)",
                color: "#fff", border: "none", borderRadius: "var(--radius-pill)",
                fontSize: "1rem", fontWeight: 700, cursor: "pointer",
                fontFamily: "var(--font-body)", boxShadow: "0 4px 16px rgba(22,168,224,0.3)",
              }}>
                <i className="bi bi-box-arrow-in-right" /> Go to Login
              </button>
            </div>

          ) : resetToken ? (
            /* ── Reset password form ── */
            <ResetPasswordForm token={resetToken} onSuccess={(msg) => setResetSuccess(msg)} />

          ) : (
            /* ── Normal login form ── */
            <>
              <div style={{ textAlign: "center", marginBottom: 28 }}>
                <div style={{
                  width: 68, height: 68,
                  background: "linear-gradient(135deg, var(--primary), var(--navy))",
                  borderRadius: "var(--radius-lg)", display: "inline-flex",
                  alignItems: "center", justifyContent: "center",
                  marginBottom: 16, boxShadow: "0 8px 24px rgba(22,168,224,0.3)",
                }}>
                  <i className="bi bi-mortarboard-fill" style={{ fontSize: "2rem", color: "#fff" }} />
                </div>
                <h1 style={{ fontSize: "clamp(1.3rem, 4vw, 1.6rem)", fontFamily: "var(--font-heading)", fontWeight: 700, color: "var(--navy)", marginBottom: 4 }}>
                  Admin Login
                </h1>
                <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", margin: 0 }}>
                  CNPS School Management Portal
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate>
                <div style={{ marginBottom: 18 }}>
                  <label htmlFor="login-email" style={labelStyle}>Email Address</label>
                  <IconInput
                    id="login-email" name="email" type="email"
                    value={form.email} onChange={handleChange}
                    onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
                    onBlur={(e)  => (e.target.style.borderColor = errors.email ? "var(--danger)" : "var(--border)")}
                    placeholder="admin@cnps.in" icon="envelope" hasError={!!errors.email}
                  />
                  <FieldError msg={errors.email} />
                </div>

                <div style={{ marginBottom: 8 }}>
                  <label htmlFor="login-password" style={labelStyle}>Password</label>
                  <div style={{ position: "relative" }}>
                    <i className="bi bi-lock" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
                    <input
                      id="login-password" name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={form.password} onChange={handleChange}
                      placeholder="Enter your password"
                      style={{ ...inputBase(!!errors.password), paddingLeft: 42, paddingRight: 44 }}
                      onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
                      onBlur={(e)  => (e.target.style.borderColor = errors.password ? "var(--danger)" : "var(--border)")}
                    />
                    <button type="button" onClick={() => setShowPassword((s) => !s)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      style={{
                        position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                        background: "none", border: "none", cursor: "pointer",
                        color: "var(--text-muted)", fontSize: "1rem",
                        display: "flex", alignItems: "center", padding: 4,
                      }}>
                      <i className={showPassword ? "bi bi-eye-slash" : "bi bi-eye"} />
                    </button>
                  </div>
                  <FieldError msg={errors.password} />
                </div>

                <div style={{ textAlign: "right", marginBottom: 20 }}>
                  <button type="button" onClick={() => setShowForgot(true)} style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "var(--primary)", fontSize: "0.83rem", fontWeight: 600,
                    fontFamily: "var(--font-body)", padding: "2px 0",
                  }}>
                    Forgot password?
                  </button>
                </div>

                <ServerError msg={serverError} />
                <SubmitBtn loading={loading} label="Sign In" loadingLabel="Signing In…" icon="box-arrow-in-right" />
              </form>

              <p style={{ textAlign: "center", marginTop: 24, fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 0 }}>
                <i className="bi bi-shield-lock" /> Secure admin access only
              </p>
            </>
          )}
        </div>
      </div>

      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}

      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalIn { from { opacity: 0; transform: scale(0.95) translateY(-10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>
    </div>
  );
}
