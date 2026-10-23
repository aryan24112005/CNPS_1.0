import { useState } from "react";
import { submitAdmission } from "../../services/publicService";

const CLASS_OPTIONS = [
  { label: "Nursery",             value: "Nursery", senior: false },
  { label: "LKG",                 value: "LKG",     senior: false },
  { label: "UKG",                 value: "UKG",     senior: false },
  { label: "Class 1",             value: "1",       senior: false },
  { label: "Class 2",             value: "2",       senior: false },
  { label: "Class 3",             value: "3",       senior: false },
  { label: "Class 4",             value: "4",       senior: false },
  { label: "Class 5",             value: "5",       senior: false },
  { label: "Class 6",             value: "6",       senior: false },
  { label: "Class 7",             value: "7",       senior: false },
  { label: "Class 8",             value: "8",       senior: false },
  { label: "Class 9",             value: "9",       senior: false },
  { label: "Class 10",            value: "10",      senior: false },
  { label: "Class 11 (PCM)",      value: "11",      senior: true,  stream: "Science",  scienceGroup: "PCM" },
  { label: "Class 11 (PCB)",      value: "11",      senior: true,  stream: "Science",  scienceGroup: "PCB" },
  { label: "Class 11 (Commerce)", value: "11",      senior: true,  stream: "Commerce", scienceGroup: "" },
  { label: "Class 12 (PCM)",      value: "12",      senior: true,  stream: "Science",  scienceGroup: "PCM" },
  { label: "Class 12 (PCB)",      value: "12",      senior: true,  stream: "Science",  scienceGroup: "PCB" },
  { label: "Class 12 (Commerce)", value: "12",      senior: true,  stream: "Commerce", scienceGroup: "" },
];

const EMPTY_FORM = {
  studentName: "", dob: "", gender: "", classChoice: "",
  fatherName: "", motherName: "", mobile: "", email: "", address: "",
};

export default function Admission() {
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [errors,      setErrors]      = useState({});
  const [submitting,  setSubmitting]  = useState(false);
  const [success,     setSuccess]     = useState(false);
  const [serverError, setServerError] = useState("");

  const validate = () => {
    const e = {};
    if (!form.studentName.trim()) e.studentName = "Student name is required.";
    if (!form.gender)             e.gender      = "Gender is required.";
    if (!form.classChoice)        e.classChoice = "Please select a class.";
    if (!form.mobile.trim())      e.mobile      = "Mobile number is required.";
    if (!form.address.trim())     e.address     = "Address is required.";
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

    const opt = CLASS_OPTIONS[Number(form.classChoice)];
    const payload = {
      studentName:  form.studentName.trim(),
      dob:          form.dob,
      gender:       form.gender,
      className:    opt.value,
      stream:       opt.stream       || "",
      scienceGroup: opt.scienceGroup || "",
      fatherName:   form.fatherName.trim(),
      motherName:   form.motherName.trim(),
      mobile:       form.mobile.trim(),
      email:        form.email.trim(),
      address:      form.address.trim(),
    };

    setSubmitting(true);
    setServerError("");
    try {
      await submitAdmission(payload);
      setSuccess(true);
      setForm(EMPTY_FORM);
    } catch (err) {
      setServerError(err?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = (field) => ({
    width: "100%", padding: "11px 15px",
    borderRadius: "var(--radius-md)",
    border: `1.5px solid ${errors[field] ? "var(--danger)" : "var(--border)"}`,
    fontSize: "0.95rem", color: "var(--text-main)",
    outline: "none", background: "#fff",
    transition: "border-color 0.2s",
    fontFamily: "var(--font-body)", boxSizing: "border-box",
  });

  const focus = (e) => (e.target.style.borderColor = "var(--primary)");
  const blur  = (e, field) => (e.target.style.borderColor = errors[field] ? "var(--danger)" : "var(--border)");

  const labelStyle = {
    display: "block", fontSize: "0.88rem", fontWeight: 600,
    color: "var(--navy)", marginBottom: 6,
  };
  const errorStyle = { fontSize: "0.78rem", color: "var(--danger)", marginTop: 4 };
  const star = <span style={{ color: "var(--danger)" }}>*</span>;

  return (
    <>
      {/* Page Hero */}
      <section className="page-hero">
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <h1>Apply for Admission</h1>
          <p>Take the first step towards a bright future at CNPS Public School.</p>
          <div className="page-breadcrumb">
            <a href="/">Home</a>
            <i className="bi bi-chevron-right" />
            <span style={{ color: "#fff" }}>Admission</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div style={{ maxWidth: 860, margin: "0 auto" }}>

            {/* Step cards — auto-fit so they wrap naturally */}
            {!success && (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))",
                gap: 20, marginBottom: 48,
              }}>
                {[
                  { icon: "bi-pencil-square",      title: "Fill the Form",     desc: "Submit your admission enquiry online with ease." },
                  { icon: "bi-telephone-outbound", title: "We'll Contact You", desc: "Our admissions team will reach out to confirm details." },
                  { icon: "bi-mortarboard",        title: "Join CNPS",         desc: "Complete the process and welcome your child to CNPS." },
                ].map((step) => (
                  <div key={step.title} style={{
                    display: "flex", gap: 16, padding: "20px 22px",
                    background: "var(--bg-soft-blue)", borderRadius: "var(--radius-md)",
                    alignItems: "flex-start",
                  }}>
                    <div style={{
                      width: 44, height: 44, background: "var(--primary)",
                      borderRadius: "var(--radius-sm)", display: "flex",
                      alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <i className={`bi ${step.icon}`} style={{ fontSize: "1.2rem", color: "#fff" }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: "var(--navy)", marginBottom: 4 }}>{step.title}</div>
                      <div style={{ fontSize: "0.88rem", color: "var(--text-secondary)" }}>{step.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Success screen */}
            {success ? (
              <div className="card" style={{ padding: "clamp(24px, 6vw, 48px)", textAlign: "center" }}>
                <div style={{
                  width: 80, height: 80, background: "#DCFCE7", borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 24px",
                }}>
                  <i className="bi bi-check-circle-fill" style={{ fontSize: "2.4rem", color: "var(--success)" }} />
                </div>
                <h2 style={{ marginBottom: 12 }}>Application Submitted!</h2>
                <p style={{ maxWidth: 480, margin: "0 auto 24px" }}>
                  Thank you for applying to CNPS. Our admissions team will review your application and contact you shortly.
                </p>
                <button className="btn btn-primary" onClick={() => setSuccess(false)}>
                  <i className="bi bi-plus-circle" /> Submit Another Application
                </button>
              </div>
            ) : (
              /* Form card — .admission-form-card uses responsive padding from global.css */
              <div className="card admission-form-card" style={{ padding: "36px 40px" }}>
                <div style={{ marginBottom: 28 }}>
                  <h3 style={{ marginBottom: 6 }}>Admission Enquiry Form</h3>
                  <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-muted)" }}>
                    Fields marked {star} are required.
                  </p>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                  {/* Row 1 — Student Name + DOB */}
                  <div className="form-row">
                    <div>
                      <label style={labelStyle}>Student's Full Name {star}</label>
                      <input name="studentName" type="text" value={form.studentName}
                        onChange={handleChange} placeholder="Student's full name"
                        style={inputStyle("studentName")} onFocus={focus}
                        onBlur={(e) => blur(e, "studentName")} />
                      {errors.studentName && <div style={errorStyle}>{errors.studentName}</div>}
                    </div>
                    <div>
                      <label style={labelStyle}>Date of Birth</label>
                      <input name="dob" type="date" value={form.dob}
                        onChange={handleChange} style={inputStyle("dob")}
                        onFocus={focus} onBlur={(e) => blur(e, "dob")} />
                    </div>
                  </div>

                  {/* Row 2 — Gender + Class */}
                  <div className="form-row">
                    <div>
                      <label style={labelStyle}>Gender {star}</label>
                      <select name="gender" value={form.gender} onChange={handleChange}
                        style={{ ...inputStyle("gender"), cursor: "pointer" }}
                        onFocus={focus} onBlur={(e) => blur(e, "gender")}>
                        <option value="">Select gender…</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors.gender && <div style={errorStyle}>{errors.gender}</div>}
                    </div>
                    <div>
                      <label style={labelStyle}>Class Applying For {star}</label>
                      <select name="classChoice" value={form.classChoice} onChange={handleChange}
                        style={{ ...inputStyle("classChoice"), cursor: "pointer" }}
                        onFocus={focus} onBlur={(e) => blur(e, "classChoice")}>
                        <option value="">Select a class…</option>
                        {CLASS_OPTIONS.map((c, i) => (
                          <option key={`${c.label}-${i}`} value={i}>{c.label}</option>
                        ))}
                      </select>
                      {errors.classChoice && <div style={errorStyle}>{errors.classChoice}</div>}
                    </div>
                  </div>

                  {/* Row 3 — Father + Mother Name */}
                  <div className="form-row">
                    <div>
                      <label style={labelStyle}>Father's Name</label>
                      <input name="fatherName" type="text" value={form.fatherName}
                        onChange={handleChange} placeholder="Father's full name"
                        style={inputStyle("fatherName")} onFocus={focus}
                        onBlur={(e) => blur(e, "fatherName")} />
                    </div>
                    <div>
                      <label style={labelStyle}>Mother's Name</label>
                      <input name="motherName" type="text" value={form.motherName}
                        onChange={handleChange} placeholder="Mother's full name"
                        style={inputStyle("motherName")} onFocus={focus}
                        onBlur={(e) => blur(e, "motherName")} />
                    </div>
                  </div>

                  {/* Row 4 — Mobile + Email */}
                  <div className="form-row">
                    <div>
                      <label style={labelStyle}>Mobile Number {star}</label>
                      <input name="mobile" type="tel" value={form.mobile}
                        onChange={handleChange} placeholder="+91 XXXXX XXXXX"
                        style={inputStyle("mobile")} onFocus={focus}
                        onBlur={(e) => blur(e, "mobile")} />
                      {errors.mobile && <div style={errorStyle}>{errors.mobile}</div>}
                    </div>
                    <div>
                      <label style={labelStyle}>Email Address</label>
                      <input name="email" type="email" value={form.email}
                        onChange={handleChange} placeholder="your@email.com"
                        style={inputStyle("email")} onFocus={focus}
                        onBlur={(e) => blur(e, "email")} />
                    </div>
                  </div>

                  {/* Address */}
                  <div style={{ marginBottom: 24 }}>
                    <label style={labelStyle}>Residential Address {star}</label>
                    <textarea name="address" rows={3} value={form.address}
                      onChange={handleChange} placeholder="Your residential address"
                      style={{ ...inputStyle("address"), resize: "vertical", minHeight: 80 }}
                      onFocus={focus} onBlur={(e) => blur(e, "address")} />
                    {errors.address && <div style={errorStyle}>{errors.address}</div>}
                  </div>

                  {serverError && (
                    <div style={{
                      padding: "12px 16px", background: "#FEF2F2",
                      border: "1px solid #FECACA", borderRadius: "var(--radius-sm)",
                      color: "var(--danger)", fontSize: "0.88rem",
                      marginBottom: 20, display: "flex", gap: 8, alignItems: "flex-start",
                    }}>
                      <i className="bi bi-exclamation-circle-fill" style={{ flexShrink: 0, marginTop: 2 }} />
                      {serverError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={submitting}
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    {submitting ? (
                      <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />&nbsp;Submitting…</>
                    ) : (
                      <><i className="bi bi-send-fill" />&nbsp;Submit Application</>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
