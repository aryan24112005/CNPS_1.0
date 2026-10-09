import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  getHeroSlides, getHomepageContent, getPublicFaculty,
  getPublicCourses, getPublicTestimonials, getPublicNotices,
} from "../../services/publicService";

/* ── Reusable mini components ────────────────────────────── */
function SectionHeader({ badge, title, subtitle }) {
  return (
    <div className="section-header">
      {badge && <span className="badge-label">{badge}</span>}
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}

/* ── Hero Section ────────────────────────────────────────── */
function HeroSection({ slides }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setCurrent((p) => (p + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides]);

  const prev = () => setCurrent((p) => (p - 1 + slides.length) % slides.length);
  const next = () => setCurrent((p) => (p + 1) % slides.length);

  if (!slides.length) {
    return (
      <section style={{
        minHeight: "560px", background: "linear-gradient(135deg,var(--navy) 0%,var(--primary-dark) 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div className="container text-center" style={{ color: "#fff", padding: "80px 0" }}>
          <h1 style={{ color: "#fff", marginBottom: 16 }}>Welcome to CNPS Public School</h1>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "1.1rem", marginBottom: 32 }}>
            Quality Education for a Bright Future
          </p>
          <Link to="/admission" className="btn btn-gold btn-lg">Apply for Admission</Link>
        </div>
      </section>
    );
  }

  const slide = slides[current];
  return (
    <section style={{ position: "relative", height: "clamp(420px,70vh,680px)", overflow: "hidden" }}>
      {/* Slides */}
      {slides.map((s, i) => (
        <div key={s._id} style={{
          position: "absolute", inset: 0, transition: "opacity 0.8s ease",
          opacity: i === current ? 1 : 0,
        }}>
          {s.image?.url ? (
            <img src={s.image.url} alt={s.title || "Hero"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,var(--navy),var(--primary-dark))" }} />
          )}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to right, rgba(16,42,67,0.75) 0%, rgba(16,42,67,0.3) 100%)",
          }} />
        </div>
      ))}

      {/* Content */}
      <div className="container" style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", alignItems: "center" }}>
        <div style={{ maxWidth: 580 }}>
          {slide.subtitle && (
            <span style={{
              display: "inline-block", background: "var(--gold)", color: "var(--navy)",
              padding: "4px 16px", borderRadius: "999px", fontSize: "0.8rem",
              fontWeight: 700, marginBottom: 16, letterSpacing: "0.5px",
            }}>{slide.subtitle}</span>
          )}
          {slide.title && <h1 style={{ color: "#fff", marginBottom: 16, lineHeight: 1.15 }}>{slide.title}</h1>}
          {slide.description && <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "1.05rem", marginBottom: 28 }}>{slide.description}</p>}
          {slide.buttonText && (
            <Link to={slide.buttonUrl || "/admission"} className="btn btn-primary btn-lg">
              {slide.buttonText}
            </Link>
          )}
        </div>
      </div>

      {/* Prev/Next */}
      {slides.length > 1 && (
        <>
          <button onClick={prev} aria-label="Previous" style={arrowStyle("left")}>
            <i className="bi bi-chevron-left" />
          </button>
          <button onClick={next} aria-label="Next" style={arrowStyle("right")}>
            <i className="bi bi-chevron-right" />
          </button>
          <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8, zIndex: 3 }}>
            {slides.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)} aria-label={`Slide ${i + 1}`} style={{
                width: i === current ? 24 : 8, height: 8, borderRadius: 999,
                background: i === current ? "var(--gold)" : "rgba(255,255,255,0.5)",
                border: "none", cursor: "pointer", transition: "all 0.3s",
              }} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

const arrowStyle = (side) => ({
  position: "absolute", [side]: 16, top: "50%", transform: "translateY(-50%)",
  zIndex: 3, width: 44, height: 44, borderRadius: "50%",
  background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)",
  color: "#fff", fontSize: "1.2rem", cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
  backdropFilter: "blur(4px)", transition: "all 0.2s",
});

/* ── Notice Ticker ────────────────────────────────────────── */
function NoticeTicker({ notices }) {
  if (!notices.length) return null;
  const items = [...notices, ...notices]; // duplicate for seamless loop
  return (
    <div className="notice-ticker">
      <div className="container" style={{ display: "flex", alignItems: "center", overflow: "hidden" }}>
        <span className="notice-ticker-label"><i className="bi bi-megaphone-fill" /> NOTICES</span>
        <div className="notice-ticker-scroll">
          <div className="notice-ticker-track">
            {items.map((n, i) => (
              <Link key={`${n._id}-${i}`} to={`/notices/${n.slug || n._id}`}>
                <i className="bi bi-dot" /> {n.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── About Section ────────────────────────────────────────── */
function AboutSection({ content }) {
  if (!content) return null;
  return (
    <section className="section">
      <div className="container">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "center" }}>
          <div>
            <span className="badge-label">About Us</span>
            <h2 style={{ marginTop: 12, marginBottom: 16 }}>{content.aboutHeading || "About CNPS Public School"}</h2>
            {content.aboutSubheading && (
              <p style={{ color: "var(--primary)", fontWeight: 600, marginBottom: 12 }}>{content.aboutSubheading}</p>
            )}
            <p style={{ marginBottom: 20 }}>{content.aboutDescription}</p>
            {content.aboutPoints?.length > 0 && (
              <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
                {content.aboutPoints.map((pt, i) => (
                  <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <i className="bi bi-check-circle-fill" style={{ color: "var(--primary)", marginTop: 3, flexShrink: 0 }} />
                    <span style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>{pt}</span>
                  </li>
                ))}
              </ul>
            )}
            <Link to="/about" className="btn btn-primary">Learn More <i className="bi bi-arrow-right" /></Link>
          </div>
          <div>
            {content.aboutImage?.url ? (
              <img src={content.aboutImage.url} alt="About CNPS" style={{ width: "100%", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-lg)" }} />
            ) : (
              <div style={{
                aspect: "4/3", background: "var(--bg-soft-blue)", borderRadius: "var(--radius-xl)",
                display: "flex", alignItems: "center", justifyContent: "center", minHeight: 320,
              }}>
                <i className="bi bi-building" style={{ fontSize: "4rem", color: "var(--primary-light)" }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Stats / Counts ───────────────────────────────────────── */
function CountsSection({ stats }) {
  if (!stats?.length) return null;
  return (
    <section className="section-sm" style={{ background: "var(--navy)" }}>
      <div className="container">
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(stats.length, 4)}, 1fr)`, gap: 24 }}>
          {stats.map((s, i) => (
            <div key={i} style={{ textAlign: "center", padding: "32px 20px" }}>
              <i className={`bi ${s.icon || "bi-star"}`} style={{ fontSize: "2rem", color: "var(--gold)", marginBottom: 12, display: "block" }} />
              <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "#fff", lineHeight: 1 }}>
                {s.value}{s.suffix || "+"}
              </div>
              <div style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.9rem", marginTop: 8 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Courses Section ──────────────────────────────────────── */
function CoursesSection({ courses }) {
  if (!courses.length) return null;
  return (
    <section className="section section-bg">
      <div className="container">
        <SectionHeader badge="Academics" title="Our Courses" subtitle="Explore our comprehensive range of courses designed to provide holistic education." />
        <div className="grid grid-3">
          {courses.slice(0, 6).map((c) => (
            <div key={c._id} className="card">
              {c.image?.url ? (
                <img className="card-img" src={c.image.url} alt={c.title} />
              ) : (
                <div className="card-img" style={{ background: "var(--bg-soft-blue)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className="bi bi-book" style={{ fontSize: "2.5rem", color: "var(--primary-light)" }} />
                </div>
              )}
              <div className="card-body">
                {c.category && <span className="badge badge-primary" style={{ marginBottom: 8 }}>{c.category}</span>}
                <h4 style={{ marginBottom: 8 }}>{c.title}</h4>
                <p style={{ fontSize: "0.88rem", marginBottom: 16, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {c.shortDescription || c.description}
                </p>
                <Link to={`/courses/${c.slug || c._id}`} className="btn btn-outline btn-sm">
                  View Details <i className="bi bi-arrow-right" />
                </Link>
              </div>
            </div>
          ))}
        </div>
        {courses.length > 6 && (
          <div className="text-center mt-4">
            <Link to="/courses" className="btn btn-primary">View All Courses</Link>
          </div>
        )}
      </div>
    </section>
  );
}

/* ── Faculty Section ──────────────────────────────────────── */
function FacultySection({ faculty }) {
  if (!faculty.length) return null;
  return (
    <section className="section">
      <div className="container">
        <SectionHeader badge="Our Team" title="Meet Our Faculty" subtitle="Experienced and dedicated educators committed to student success." />
        <div className="grid grid-4">
          {faculty.slice(0, 8).map((f) => (
            <div key={f._id} className="card" style={{ textAlign: "center" }}>
              <div style={{ padding: "28px 20px 16px" }}>
                {f.photo?.url ? (
                  <img src={f.photo.url} alt={f.name} style={{
                    width: 90, height: 90, borderRadius: "50%", objectFit: "cover",
                    margin: "0 auto 14px", border: "3px solid var(--border)",
                  }} />
                ) : (
                  <div style={{
                    width: 90, height: 90, borderRadius: "50%", background: "var(--bg-soft-blue)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 14px", fontSize: "2rem", color: "var(--primary)",
                  }}>
                    <i className="bi bi-person-fill" />
                  </div>
                )}
                <h5 style={{ marginBottom: 4 }}>{f.name}</h5>
                <p style={{ fontSize: "0.82rem", color: "var(--primary)", marginBottom: 4, fontWeight: 600 }}>{f.designation}</p>
                {f.qualification && <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", margin: 0 }}>{f.qualification}</p>}
              </div>
              {(f.facebook || f.instagram || f.linkedin) && (
                <div style={{ borderTop: "1px solid var(--border)", padding: "12px 20px", display: "flex", justifyContent: "center", gap: 10 }}>
                  {f.facebook  && <a href={f.facebook}  target="_blank" rel="noreferrer" style={{ color: "var(--text-muted)", fontSize: "1rem" }}><i className="bi bi-facebook" /></a>}
                  {f.instagram && <a href={f.instagram} target="_blank" rel="noreferrer" style={{ color: "var(--text-muted)", fontSize: "1rem" }}><i className="bi bi-instagram" /></a>}
                  {f.linkedin  && <a href={f.linkedin}  target="_blank" rel="noreferrer" style={{ color: "var(--text-muted)", fontSize: "1rem" }}><i className="bi bi-linkedin" /></a>}
                </div>
              )}
            </div>
          ))}
        </div>
        {faculty.length > 8 && (
          <div className="text-center mt-4">
            <Link to="/trainers" className="btn btn-outline">View All Faculty</Link>
          </div>
        )}
      </div>
    </section>
  );
}

/* ── Testimonials ─────────────────────────────────────────── */
function TestimonialsSection({ testimonials }) {
  if (!testimonials.length) return null;
  return (
    <section className="section section-soft">
      <div className="container">
        <SectionHeader badge="Testimonials" title="What Parents & Students Say" />
        <div className="grid grid-3">
          {testimonials.slice(0, 6).map((t) => (
            <div key={t._id} style={{
              background: "var(--bg-white)", borderRadius: "var(--radius-lg)",
              padding: 28, border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)",
            }}>
              <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
                {Array.from({ length: t.rating || 5 }).map((_, i) => (
                  <i key={i} className="bi bi-star-fill" style={{ color: "var(--gold)", fontSize: "0.85rem" }} />
                ))}
              </div>
              <p style={{ fontSize: "0.92rem", fontStyle: "italic", marginBottom: 20 }}>"{t.content}"</p>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                {t.avatar?.url ? (
                  <img src={t.avatar.url} alt={t.name} style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--bg-soft-blue)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}>
                    <i className="bi bi-person-fill" />
                  </div>
                )}
                <div>
                  <div style={{ fontWeight: 600, color: "var(--navy)", fontSize: "0.9rem" }}>{t.name}</div>
                  {t.designation && <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{t.designation}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── CTA Banner ───────────────────────────────────────────── */
function CtaBanner({ content }) {
  return (
    <section style={{ background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)", padding: "64px 0", textAlign: "center" }}>
      <div className="container">
        <h2 style={{ color: "#fff", marginBottom: 14 }}>{content?.ctaHeading || "Ready to Join CNPS Public School?"}</h2>
        <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "1.05rem", marginBottom: 32, maxWidth: 520, margin: "0 auto 32px" }}>
          {content?.ctaDescription || "Give your child the best education. Apply today and secure your child's bright future."}
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <Link to={content?.ctaButtonUrl || "/admission"} className="btn btn-gold btn-lg">
            {content?.ctaButtonText || "Apply for Admission"}
          </Link>
          <Link to="/contact" className="btn btn-lg" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "2px solid rgba(255,255,255,0.4)" }}>
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── Main Home Page ───────────────────────────────────────── */
export default function Home() {
  const [heroSlides,    setHeroSlides]    = useState([]);
  const [content,       setContent]       = useState(null);
  const [faculty,       setFaculty]       = useState([]);
  const [courses,       setCourses]       = useState([]);
  const [testimonials,  setTestimonials]  = useState([]);
  const [notices,       setNotices]       = useState([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    Promise.allSettled([
      getHeroSlides(),
      getHomepageContent(),
      getPublicFaculty(),
      getPublicCourses(),
      getPublicTestimonials(),
      getPublicNotices(),
    ]).then(([h, c, f, co, t, n]) => {
      if (h.status  === "fulfilled") setHeroSlides(h.value   || []);
      if (c.status  === "fulfilled") setContent(c.value);
      if (f.status  === "fulfilled") setFaculty(f.value      || []);
      if (co.status === "fulfilled") setCourses(co.value     || []);
      if (t.status  === "fulfilled") setTestimonials(t.value || []);
      if (n.status  === "fulfilled") setNotices(n.value      || []);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="loading-state" style={{ minHeight: "60vh" }}>
        <div className="spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <HeroSection slides={heroSlides} />
      <NoticeTicker notices={notices} />
      <AboutSection content={content} />
      <CountsSection stats={content?.countStats} />
      <CoursesSection courses={courses} />
      <FacultySection faculty={faculty} />
      <TestimonialsSection testimonials={testimonials} />
      <CtaBanner content={content} />
    </>
  );
}
