import { useEffect, useState } from "react";
import { getSiteSettings } from "../../services/publicService";

export default function About() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    getSiteSettings().then(setSettings).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading-state" style={{ minHeight: "60vh" }}>
        <div className="spinner" /><p>Loading...</p>
      </div>
    );
  }

  const s = settings || {};

  return (
    <>
      {/* Page Hero */}
      <section className="page-hero">
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <h1>About Us</h1>
          <p>Learn about our school, our mission, and our commitment to quality education.</p>
          <div className="page-breadcrumb">
            <a href="/">Home</a>
            <i className="bi bi-chevron-right" />
            <span style={{ color: "#fff" }}>About</span>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="section">
        <div className="container">

          {/*
            About intro — uses .about-intro-grid defined in global.css:
            2-col on desktop (≥768px), 1-col on mobile
          */}
          <div className="about-intro-grid">
            <div>
              <span className="badge-label">Who We Are</span>
              <h2 style={{ marginTop: 12, marginBottom: 20 }}>
                {s.aboutHeading || "About CNPS Public School"}
              </h2>
              <p style={{ fontSize: "1rem", lineHeight: 1.8 }}>
                {s.aboutDescription || "CNPS Public School is committed to providing quality education that empowers students to achieve their full potential."}
              </p>
            </div>
            <div>
              {s.aboutImage1?.url ? (
                <img
                  src={s.aboutImage1.url}
                  alt="About school"
                  style={{ width: "100%", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-lg)" }}
                />
              ) : (
                <div style={{
                  aspectRatio: "4/3", background: "var(--bg-soft-blue)",
                  borderRadius: "var(--radius-xl)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  minHeight: 220,
                }}>
                  <i className="bi bi-building" style={{ fontSize: "4rem", color: "var(--primary-light)" }} />
                </div>
              )}
            </div>
          </div>

          {/* Mission / Vision / Values — uses .grid.grid-3 (responsive via global.css) */}
          <div className="grid grid-3" style={{ marginBottom: "clamp(40px, 8vw, 64px)" }}>
            {[
              {
                icon: "bi-bullseye",
                title: "Our Mission",
                text: s.aboutMission || "To provide quality education that nurtures holistic development and prepares students for a successful future.",
              },
              {
                icon: "bi-eye",
                title: "Our Vision",
                text: s.aboutVision || "To be a centre of excellence in education, producing responsible, skilled, and compassionate citizens.",
              },
              {
                icon: "bi-stars",
                title: "Our Values",
                text: s.aboutValues || "Integrity, Excellence, Respect, Innovation, and Compassion — values that guide everything we do.",
              },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  background: "var(--bg-soft-blue)", borderRadius: "var(--radius-lg)",
                  padding: "clamp(20px, 5vw, 32px) clamp(16px, 4vw, 28px)", textAlign: "center",
                }}
              >
                <div style={{
                  width: 64, height: 64, background: "var(--primary)", borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 16px", color: "#fff", fontSize: "1.6rem",
                }}>
                  <i className={`bi ${item.icon}`} />
                </div>
                <h4 style={{ marginBottom: 12 }}>{item.title}</h4>
                <p style={{ fontSize: "0.92rem", margin: 0 }}>{item.text}</p>
              </div>
            ))}
          </div>

          {/* Extra images — render from aboutImages array (new) or legacy aboutImage1/2/3 */}
          {(() => {
            // Prefer the new aboutImages array if it has entries
            const imgs = Array.isArray(s.aboutImages) && s.aboutImages.length > 0
              ? s.aboutImages.map(img => img.url || img).filter(Boolean)
              : [s.aboutImage1?.url, s.aboutImage2?.url, s.aboutImage3?.url].filter(Boolean);
            if (!imgs.length) return null;
            return (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "clamp(12px, 3vw, 20px)",
                marginTop: "clamp(24px, 5vw, 40px)",
              }}>
                {imgs.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`About CNPS ${i + 2}`}
                    style={{ width: "100%", borderRadius: "var(--radius-lg)", height: 220, objectFit: "cover" }}
                  />
                ))}
              </div>
            );
          })()}
        </div>
      </section>
    </>
  );
}
