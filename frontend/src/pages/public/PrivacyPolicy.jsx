import { useEffect } from "react";
import { Link } from "react-router-dom";

/* ── Helpers ─────────────────────────────────────────────── */
function SectionHeading({ number, title }) {
  return (
    <h2
      style={{
        fontSize: "clamp(1.1rem, 2.5vw, 1.35rem)",
        color: "var(--navy)",
        fontFamily: "var(--font-heading)",
        fontWeight: 700,
        marginTop: 40,
        marginBottom: 14,
        paddingBottom: 10,
        borderBottom: "2px solid var(--border)",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: "var(--primary)",
          color: "#fff",
          fontSize: "0.85rem",
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {number}
      </span>
      {title}
    </h2>
  );
}

function Placeholder({ children }) {
  return (
    <mark
      style={{
        background: "#FEF3C7",
        color: "#92400E",
        padding: "2px 6px",
        borderRadius: 4,
        fontSize: "0.88em",
        fontStyle: "italic",
        border: "1px dashed #FDE68A",
      }}
    >
      [SCHOOL TO CONFIRM: {children}]
    </mark>
  );
}

export default function PrivacyPolicy() {
  useEffect(() => {
    document.title = "Privacy Policy — CNPS Public School";
  }, []);

  const LAST_UPDATED = "October 2026";
  const POLICY_VERSION = "1.0";

  return (
    <>
      {/* ── Page Hero ─────────────────────────────────────── */}
      <section className="page-hero">
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <h1>Privacy Policy</h1>
          <p>How we collect, use, and protect information submitted on this website.</p>
          <div className="page-breadcrumb">
            <Link to="/">Home</Link>
            <i className="bi bi-chevron-right" />
            <span style={{ color: "#fff" }}>Privacy Policy</span>
          </div>
        </div>
      </section>

      {/* ── Content ───────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div
            style={{
              maxWidth: 860,
              margin: "0 auto",
              background: "#fff",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border)",
              padding: "clamp(24px, 5vw, 52px)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            {/* Meta */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 18px",
                background: "var(--bg-soft-blue)",
                borderRadius: "var(--radius-md)",
                marginBottom: 32,
                fontSize: "0.88rem",
                color: "var(--text-secondary)",
                flexWrap: "wrap",
              }}
            >
              <i className="bi bi-shield-lock-fill" style={{ color: "var(--primary)" }} />
              <span>
                <strong>Version {POLICY_VERSION}</strong> &nbsp;·&nbsp; Last updated:{" "}
                <strong>{LAST_UPDATED}</strong>
              </span>
              <span style={{ marginLeft: "auto", color: "var(--text-muted)", fontStyle: "italic" }}>
                Yellow highlights mark details the school must verify.
              </span>
            </div>

            <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, marginBottom: 16 }}>
              CNPS Public School ("<strong>we</strong>", "<strong>our</strong>",
              "<strong>the School</strong>") is committed to protecting the privacy of everyone
              who uses this website. This Privacy Policy explains what personal data we collect,
              why we collect it, how it is used, and your rights in relation to it.
            </p>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>
              By using this website or submitting any form, you agree to the practices described
              in this Policy. Please read it alongside our{" "}
              <Link to="/terms-and-conditions" style={{ color: "var(--primary)", fontWeight: 600 }}>
                Terms &amp; Conditions
              </Link>
              .
            </p>

            {/* 1 */}
            <SectionHeading number="1" title="What Information We Collect" />
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, marginBottom: 10 }}>
              We collect personal information only when you voluntarily provide it through forms on
              this website. This includes:
            </p>

            {/* 1a Admission */}
            <div
              style={{
                background: "var(--bg-section)",
                borderRadius: "var(--radius-md)",
                padding: "16px 20px",
                marginBottom: 16,
              }}
            >
              <h3
                style={{
                  fontSize: "1rem",
                  color: "var(--navy)",
                  marginBottom: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <i className="bi bi-mortarboard" style={{ color: "var(--primary)" }} />
                Admission Enquiry Form
              </h3>
              <ul
                style={{
                  color: "var(--text-secondary)",
                  lineHeight: 1.9,
                  paddingLeft: 20,
                  fontSize: "0.93rem",
                }}
              >
                <li>Student's full name and date of birth</li>
                <li>Gender</li>
                <li>Class applied for (including stream/science group where applicable)</li>
                <li>Father's and mother's names</li>
                <li>Mobile number (required)</li>
                <li>Email address (optional)</li>
                <li>Residential address</li>
                <li>
                  Consent record — timestamp of form submission and policy version accepted
                </li>
              </ul>
            </div>

            {/* 1b Contact */}
            <div
              style={{
                background: "var(--bg-section)",
                borderRadius: "var(--radius-md)",
                padding: "16px 20px",
                marginBottom: 16,
              }}
            >
              <h3
                style={{
                  fontSize: "1rem",
                  color: "var(--navy)",
                  marginBottom: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <i className="bi bi-envelope" style={{ color: "var(--primary)" }} />
                Contact Form
              </h3>
              <ul
                style={{
                  color: "var(--text-secondary)",
                  lineHeight: 1.9,
                  paddingLeft: 20,
                  fontSize: "0.93rem",
                }}
              >
                <li>Full name</li>
                <li>Email address</li>
                <li>Phone number (optional)</li>
                <li>Subject and message</li>
              </ul>
            </div>

            {/* 1c Technical */}
            <div
              style={{
                background: "var(--bg-section)",
                borderRadius: "var(--radius-md)",
                padding: "16px 20px",
                marginBottom: 16,
              }}
            >
              <h3
                style={{
                  fontSize: "1rem",
                  color: "var(--navy)",
                  marginBottom: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <i className="bi bi-gear" style={{ color: "var(--primary)" }} />
                Technical &amp; Usage Data
              </h3>
              <p
                style={{
                  color: "var(--text-secondary)",
                  lineHeight: 1.8,
                  fontSize: "0.93rem",
                  margin: 0,
                }}
              >
                We do not currently operate analytics tracking, advertising pixels, or cookie
                consent tools. Standard web server logs (IP address, browser type, pages visited,
                and timestamps) may be recorded by our hosting provider for security and
                operational purposes.
              </p>
            </div>

            {/* 2 */}
            <SectionHeading number="2" title="Why We Collect Your Information" />
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.9rem",
                color: "var(--text-secondary)",
                marginBottom: 16,
              }}
            >
              <thead>
                <tr style={{ background: "var(--bg-soft-blue)" }}>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "10px 14px",
                      borderBottom: "2px solid var(--border)",
                      color: "var(--navy)",
                    }}
                  >
                    Data collected
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "10px 14px",
                      borderBottom: "2px solid var(--border)",
                      color: "var(--navy)",
                    }}
                  >
                    Purpose
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  [
                    "Admission enquiry details",
                    "To process and respond to admission applications",
                  ],
                  [
                    "Contact form details",
                    "To respond to your enquiry or feedback",
                  ],
                  [
                    "Policy consent record",
                    "To maintain a record that you accepted our terms at time of submission",
                  ],
                  [
                    "Server logs",
                    "To maintain website security and diagnose technical issues",
                  ],
                ].map(([data, purpose], i) => (
                  <tr
                    key={i}
                    style={{
                      borderBottom: "1px solid var(--border)",
                      background: i % 2 === 1 ? "var(--bg-section)" : "#fff",
                    }}
                  >
                    <td style={{ padding: "10px 14px", fontWeight: 500 }}>{data}</td>
                    <td style={{ padding: "10px 14px" }}>{purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* 3 */}
            <SectionHeading number="3" title="How We Store Your Data" />
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>
              Personal data submitted through this website is stored in a MySQL database hosted on{" "}
              <Placeholder>hosting provider name and location, e.g. Hostinger, India</Placeholder>.
              Access to this database is restricted to authorised school administrators via a
              password-protected admin interface. Passwords are hashed using bcrypt and are never
              stored in plain text.
            </p>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, marginTop: 10 }}>
              Uploaded images and documents (if any) may also be stored in the same database as
              binary data and are accessible only through the website's media serving mechanism.
            </p>

            {/* 4 */}
            <SectionHeading number="4" title="How Long We Keep Your Data" />
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>
              We keep admission enquiry records for{" "}
              <Placeholder>e.g. 2 years after the academic year of application</Placeholder>.
              Contact messages are kept for{" "}
              <Placeholder>e.g. 12 months</Placeholder> unless there is an ongoing correspondence
              that requires them to be retained longer. You may request deletion at any time by
              contacting us — see Section 7 below.
            </p>

            {/* 5 */}
            <SectionHeading number="5" title="Who We Share Your Data With" />
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>
              We do <strong>not</strong> sell, trade, or rent your personal information to third
              parties. Data may be shared only in the following limited circumstances:
            </p>
            <ul style={{ color: "var(--text-secondary)", lineHeight: 1.9, paddingLeft: 24 }}>
              <li>
                <strong>Hosting provider:</strong> Our hosting provider may process data as part
                of operating our server infrastructure. They act as data processors and do not
                independently use your data.
              </li>
              <li>
                <strong>Email service:</strong> Password-reset emails for administrators are sent
                via the Gmail API. No enquiry or student data is transmitted through this service.
              </li>
              <li>
                <strong>Legal requirement:</strong> We may disclose data if required to do so by
                law or in response to valid requests by public authorities.
              </li>
            </ul>

            {/* 6 */}
            <SectionHeading number="6" title="Cookies" />
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>
              This website does not currently set cookies in your browser beyond those that are
              strictly necessary for the admin interface to function (e.g. storing a JWT token in
              browser <code>localStorage</code> when an administrator logs in). No tracking
              cookies or advertising cookies are used.
            </p>

            {/* 7 */}
            <SectionHeading number="7" title="Your Rights" />
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, marginBottom: 10 }}>
              Depending on applicable law, you may have the right to:
            </p>
            <ul style={{ color: "var(--text-secondary)", lineHeight: 1.9, paddingLeft: 24 }}>
              <li>Request a copy of the personal data we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your data</li>
              <li>Withdraw consent given at the time of form submission</li>
            </ul>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, marginTop: 10 }}>
              To exercise any of these rights, please contact us using the details in Section 8
              below. We will respond within{" "}
              <Placeholder>e.g. 30 days</Placeholder>.
            </p>

            {/* 8 */}
            <SectionHeading number="8" title="Changes to This Policy" />
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>
              We may update this Privacy Policy from time to time. When we do, we will revise the
              "Last updated" date at the top of this page and increase the version number. We
              encourage you to review this Policy periodically. Continued use of this website
              after changes are posted constitutes acceptance of the revised Policy.
            </p>

            {/* 9 */}
            <SectionHeading number="9" title="Contact Us" />
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>
              If you have any questions or concerns about this Privacy Policy, or to exercise
              your rights, please contact:
            </p>
            <div
              style={{
                background: "var(--bg-section)",
                borderRadius: "var(--radius-md)",
                padding: "18px 22px",
                marginTop: 12,
                lineHeight: 1.9,
                color: "var(--text-secondary)",
                fontSize: "0.93rem",
              }}
            >
              <strong style={{ color: "var(--navy)" }}>CNPS Public School</strong>
              <br />
              <Placeholder>Full school address</Placeholder>
              <br />
              Email:{" "}
              <Placeholder>school contact email</Placeholder>
              <br />
              Phone:{" "}
              <Placeholder>school phone number</Placeholder>
            </div>

            {/* Policy links */}
            <div
              style={{
                marginTop: 40,
                paddingTop: 24,
                borderTop: "1px solid var(--border)",
                display: "flex",
                gap: 16,
                flexWrap: "wrap",
                alignItems: "center",
                fontSize: "0.88rem",
              }}
            >
              <span style={{ color: "var(--text-muted)" }}>Also read:</span>
              <Link
                to="/terms-and-conditions"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  color: "var(--primary)",
                  fontWeight: 600,
                }}
              >
                <i className="bi bi-file-text-fill" />
                Terms &amp; Conditions
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
