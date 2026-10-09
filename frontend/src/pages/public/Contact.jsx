import { useEffect, useState } from "react";
import { getSiteSettings, submitContact } from "../../services/publicService";

const EMPTY_FORM = { name: "", email: "", phone: "", subject: "", message: "" };

export default function Contact() {
  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    getSiteSettings().then(setSettings).catch(() => {});
  }, []);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required.";
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email address.";
    if (!form.subject.trim()) e.subject = "Subject is required.";
    if (!form.message.trim()) e.message = "Message is required.";
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

    setSubmitting(true);
    setServerError("");
    try {
      await submitContact(form);
      setSuccess(true);
      setForm(EMPTY_FORM);
    } catch (err) {
      setServerError(err?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = (field) => ({
    width: "100%",
    padding: "12px 16px",
    borderRadius: "var(--radius-md)",
    border: `1.5px solid ${errors[field] ? "var(--danger)" : "var(--border)"}`,
    fontSize: "0.95rem",
    color: "var(--text-main)",
    outline: "none",
    background: "#fff",
    transition: "border-color 0.2s",
    fontFamily: "var(--font-body)",
  });

  const labelStyle = {
    display: "block",
    fontSize: "0.88rem",
    fontWeight: 600,
    color: "var(--navy)",
    marginBottom: 6,
  };

  const errorStyle = {
    fontSize: "0.78rem",
    color: "var(--danger)",
    marginTop: 4,
  };

  return (
    <>
      {/* Hero */}
      <section className="page-hero">
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <h1>Contact Us</h1>
          <p>Get in touch with CNPS — we're here to help.</p>
          <div className="page-breadcrumb">
            <a href="/">Home</a>
            <i className="bi bi-chevron-right" />
            <span style={{ color: "#fff" }}>Contact</span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="section">
        <div className="container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1.6fr",
              gap: 40,
              alignItems: "start",
            }}
            className="contact-grid"
          >
            {/* ── Left: Contact Info ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <span className="badge-label">Get in Touch</span>
                <h2 style={{ marginTop: 8, marginBottom: 10 }}>We'd Love to Hear From You</h2>
                <p style={{ fontSize: "0.95rem" }}>
                  Whether you have a question about admissions, academics, or anything else, our team is ready to answer.
                </p>
              </div>

              {/* Info items */}
              {[
                { icon: "bi-geo-alt-fill", label: "Address", value: settings?.address, color: "var(--primary)" },
                { icon: "bi-telephone-fill", label: "Phone", value: settings?.phone, color: "var(--gold)" },
                { icon: "bi-envelope-fill", label: "Email", value: settings?.email, color: "var(--primary)" },
              ].map(({ icon, label, value, color }) =>
                value ? (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      gap: 16,
                      alignItems: "flex-start",
                      padding: "18px 20px",
                      background: "var(--bg-soft-blue)",
                      borderRadius: "var(--radius-md)",
                    }}
                  >
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: "var(--radius-sm)",
                        background: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        boxShadow: "var(--shadow-sm)",
                      }}
                    >
                      <i className={`bi ${icon}`} style={{ fontSize: "1.1rem", color }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.82rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 2 }}>
                        {label}
                      </div>
                      <div style={{ fontSize: "0.95rem", color: "var(--navy)", fontWeight: 500 }}>
                        {value}
                      </div>
                    </div>
                  </div>
                ) : null
              )}

              {/* Map embed */}
              {(() => {
                // The stored value may be:
                //   a) A valid Google Maps embed URL  → use directly
                //   b) A full <iframe>…</iframe> string → extract src
                //   c) A short share link (maps.app.goo.gl) → not embeddable, use fallback
                //   d) Empty → use fallback
                const FALLBACK_EMBED =
                  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4212.697217159162!2d79.48014427609375!3d27.233761176457268!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39747beda2b542b3%3A0x3b884b32c2beea73!2sCnps%20Public%20School!5e1!3m2!1sen!2sin!4v1791519023414!5m2!1sen!2sin";

                const resolveEmbedSrc = (raw) => {
                  if (!raw || !raw.trim()) return FALLBACK_EMBED;

                  // Case: full iframe HTML — extract src attribute
                  const srcMatch = raw.match(/src=["']([^"']+)["']/i);
                  if (srcMatch) return srcMatch[1];

                  // Case: already a valid embed URL
                  if (raw.startsWith("https://www.google.com/maps/embed")) return raw;

                  // Case: short link or regular maps link — not embeddable
                  return FALLBACK_EMBED;
                };

                const embedSrc = resolveEmbedSrc(settings?.mapEmbedUrl);

                return (
                  <div style={{ borderRadius: "var(--radius-md)", overflow: "hidden", border: "1px solid var(--border)" }}>
                    <iframe
                      src={embedSrc}
                      title="CNPS Public School Location"
                      width="100%"
                      height="280"
                      style={{ border: 0, display: "block" }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="strict-origin-when-cross-origin"
                    />
                  </div>
                );
              })()}
            </div>

            {/* ── Right: Form ── */}
            <div className="card" style={{ padding: 36 }}>
              {success ? (
                <div style={{ textAlign: "center", padding: "40px 20px" }}>
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      background: "#DCFCE7",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 20px",
                    }}
                  >
                    <i className="bi bi-check-lg" style={{ fontSize: "2rem", color: "var(--success)" }} />
                  </div>
                  <h3 style={{ marginBottom: 10 }}>Message Sent!</h3>
                  <p>Thank you for reaching out. We'll get back to you as soon as possible.</p>
                  <button
                    className="btn btn-primary"
                    style={{ marginTop: 16 }}
                    onClick={() => setSuccess(false)}
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  <h3 style={{ marginBottom: 24 }}>Send Us a Message</h3>

                  {/* Name & Email row */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                    <div>
                      <label htmlFor="contact-name" style={labelStyle}>
                        Full Name <span style={{ color: "var(--danger)" }}>*</span>
                      </label>
                      <input
                        id="contact-name"
                        name="name"
                        type="text"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Your full name"
                        style={inputStyle("name")}
                        onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
                        onBlur={(e) => (e.target.style.borderColor = errors.name ? "var(--danger)" : "var(--border)")}
                      />
                      {errors.name && <div style={errorStyle}>{errors.name}</div>}
                    </div>
                    <div>
                      <label htmlFor="contact-email" style={labelStyle}>
                        Email Address <span style={{ color: "var(--danger)" }}>*</span>
                      </label>
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        style={inputStyle("email")}
                        onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
                        onBlur={(e) => (e.target.style.borderColor = errors.email ? "var(--danger)" : "var(--border)")}
                      />
                      {errors.email && <div style={errorStyle}>{errors.email}</div>}
                    </div>
                  </div>

                  {/* Phone & Subject row */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                    <div>
                      <label htmlFor="contact-phone" style={labelStyle}>Phone (Optional)</label>
                      <input
                        id="contact-phone"
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+91 XXXXX XXXXX"
                        style={inputStyle("phone")}
                        onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
                        onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-subject" style={labelStyle}>
                        Subject <span style={{ color: "var(--danger)" }}>*</span>
                      </label>
                      <input
                        id="contact-subject"
                        name="subject"
                        type="text"
                        value={form.subject}
                        onChange={handleChange}
                        placeholder="e.g. Admission enquiry"
                        style={inputStyle("subject")}
                        onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
                        onBlur={(e) => (e.target.style.borderColor = errors.subject ? "var(--danger)" : "var(--border)")}
                      />
                      {errors.subject && <div style={errorStyle}>{errors.subject}</div>}
                    </div>
                  </div>

                  {/* Message */}
                  <div style={{ marginBottom: 20 }}>
                    <label htmlFor="contact-message" style={labelStyle}>
                      Message <span style={{ color: "var(--danger)" }}>*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={5}
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Write your message here..."
                      style={{ ...inputStyle("message"), resize: "vertical", minHeight: 120 }}
                      onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
                      onBlur={(e) => (e.target.style.borderColor = errors.message ? "var(--danger)" : "var(--border)")}
                    />
                    {errors.message && <div style={errorStyle}>{errors.message}</div>}
                  </div>

                  {/* Server error */}
                  {serverError && (
                    <div
                      style={{
                        padding: "12px 16px",
                        background: "#FEF2F2",
                        border: "1px solid #FECACA",
                        borderRadius: "var(--radius-sm)",
                        color: "var(--danger)",
                        fontSize: "0.88rem",
                        marginBottom: 16,
                        display: "flex",
                        gap: 8,
                        alignItems: "flex-start",
                      }}
                    >
                      <i className="bi bi-exclamation-circle-fill" style={{ flexShrink: 0, marginTop: 2 }} />
                      {serverError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    {submitting ? (
                      <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Sending…</>
                    ) : (
                      <><i className="bi bi-send" /> Send Message</>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Responsive fix for contact grid */}
      <style>{`
        @media (max-width: 768px) {
          .contact-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
