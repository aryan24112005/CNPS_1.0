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

export default function TermsAndConditions() {
  useEffect(() => {
    document.title = "Terms & Conditions — CNPS Public School";
  }, []);

  const LAST_UPDATED = "October 2026"; // update whenever terms change
  const POLICY_VERSION = "1.0";

  return (
    <>
      {/* ── Page Hero ─────────────────────────────────────── */}
      <section className="page-hero">
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <h1>Terms &amp; Conditions</h1>
          <p>Please read these terms carefully before using our website.</p>
          <div className="page-breadcrumb">
            <Link to="/">Home</Link>
            <i className="bi bi-chevron-right" />
            <span style={{ color: "#fff" }}>Terms &amp; Conditions</span>
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
              <i className="bi bi-info-circle-fill" style={{ color: "var(--primary)" }} />
              <span>
                <strong>Version {POLICY_VERSION}</strong> &nbsp;·&nbsp; Last updated:{" "}
                <strong>{LAST_UPDATED}</strong>
              </span>
              <span style={{ marginLeft: "auto", color: "var(--text-muted)", fontStyle: "italic" }}>
                Yellow highlights mark details the school must verify.
              </span>
            </div>

            <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, marginBottom: 24 }}>
              Welcome to the website of <strong>CNPS Public School</strong>{" "}
              ("<strong>the School</strong>", "<strong>we</strong>", "<strong>our</strong>").
              By accessing or using this website, you agree to the following Terms &amp; Conditions.
              If you do not agree, please do not use the site.
            </p>

            {/* 1 */}
            <SectionHeading number="1" title="Acceptance of Terms" />
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>
              These Terms &amp; Conditions govern your use of the website located at{" "}
              <Placeholder>official website URL</Placeholder>. By submitting an admission
              enquiry, contact form, or any other data, you confirm that you have read, understood,
              and accepted these Terms and our{" "}
              <Link to="/privacy-policy" style={{ color: "var(--primary)", fontWeight: 600 }}>
                Privacy Policy
              </Link>
              .
            </p>

            {/* 2 */}
            <SectionHeading number="2" title="Who We Are" />
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>
              CNPS Public School is an educational institution located at{" "}
              <Placeholder>full registered address</Placeholder>. The school is{" "}
              <Placeholder>registered / affiliated with Board name</Placeholder>. For
              enquiries, contact us at <Placeholder>official school email address</Placeholder>.
            </p>

            {/* 3 */}
            <SectionHeading number="3" title="Use of This Website" />
            <ul style={{ color: "var(--text-secondary)", lineHeight: 1.9, paddingLeft: 24 }}>
              <li>
                This website is provided for informational purposes about CNPS Public School,
                including its academic programmes, events, notices, and admissions process.
              </li>
              <li>
                You may use the site for personal, non-commercial purposes only. You may not
                reproduce, redistribute, or republish any content without prior written permission
                from the School.
              </li>
              <li>
                You must not attempt to gain unauthorised access to any part of the site, the
                administrative backend, or the underlying database.
              </li>
              <li>
                You must not submit false or misleading information in any enquiry form, including
                the Admission Enquiry Form or the Contact Form.
              </li>
            </ul>

            {/* 4 */}
            <SectionHeading number="4" title="Admission Enquiry Form" />
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>
              Submitting an Admission Enquiry Form does <strong>not</strong> constitute
              confirmation of admission or any contractual obligation on the part of the School.
              Admissions are subject to availability of seats, eligibility criteria, and the
              School's internal selection process. A member of our admissions team will contact
              you using the details provided to communicate the outcome.
            </p>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, marginTop: 10 }}>
              By submitting the form you consent to the School recording and using the submitted
              information (student name, parent/guardian details, contact number, and address)
              solely for the purpose of processing your enquiry. See our{" "}
              <Link to="/privacy-policy" style={{ color: "var(--primary)", fontWeight: 600 }}>
                Privacy Policy
              </Link>{" "}
              for full details.
            </p>

            {/* 5 */}
            <SectionHeading number="5" title="Contact Form" />
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>
              Information submitted via the Contact Us form is used solely to respond to your
              enquiry. We do not share this information with third parties for marketing purposes.
            </p>

            {/* 6 */}
            <SectionHeading number="6" title="Intellectual Property" />
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>
              All text, images, logos, and other content on this website are the property of
              CNPS Public School or are used with appropriate permission. You may not reproduce
              or distribute any content without explicit written consent.
            </p>

            {/* 7 */}
            <SectionHeading number="7" title="Third-Party Links" />
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>
              This website may contain links to third-party sites (such as social media pages).
              We are not responsible for the content, privacy practices, or terms of those sites.
            </p>

            {/* 8 */}
            <SectionHeading number="8" title="Disclaimer of Warranties" />
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>
              This website is provided on an "as is" and "as available" basis. While we strive to
              keep information accurate and up to date, we make no warranty — express or implied —
              regarding the completeness, reliability, or availability of the website or its
              content. The School shall not be liable for any loss or damage arising from your
              reliance on information found on this site.
            </p>

            {/* 9 */}
            <SectionHeading number="9" title="Limitation of Liability" />
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>
              To the fullest extent permitted by applicable law, CNPS Public School shall not be
              liable for any indirect, incidental, special, or consequential damages arising out
              of the use of, or inability to use, this website.
            </p>

            {/* 10 */}
            <SectionHeading number="10" title="Changes to These Terms" />
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>
              We reserve the right to update these Terms &amp; Conditions at any time. The date of
              the most recent revision is shown at the top of this page. Continued use of the
              website after changes are posted constitutes acceptance of the revised Terms.
            </p>

            {/* 11 */}
            <SectionHeading number="11" title="Governing Law" />
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>
              These Terms are governed by the laws of <Placeholder>State/Country</Placeholder>.
              Any disputes arising under these Terms shall be subject to the exclusive jurisdiction
              of the courts of <Placeholder>jurisdiction / city</Placeholder>.
            </p>

            {/* 12 */}
            <SectionHeading number="12" title="Contact Us" />
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>
              If you have any questions about these Terms, please contact us:
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
                to="/privacy-policy"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  color: "var(--primary)",
                  fontWeight: 600,
                }}
              >
                <i className="bi bi-shield-lock-fill" />
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
