import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getPublicCourseBySlug } from "../../services/publicService";

export default function CourseDetails() {
  const { slug }            = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");

  useEffect(() => {
    getPublicCourseBySlug(slug)
      .then(setCourse)
      .catch(() => setError("Course not found."))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="loading-state" style={{ minHeight: "60vh" }}><div className="spinner" /></div>;
  if (error || !course) return (
    <div className="empty-state" style={{ minHeight: "60vh" }}>
      <i className="bi bi-exclamation-circle" />
      <h4>{error || "Course not found"}</h4>
      <Link to="/courses" className="btn btn-primary mt-2">Back to Courses</Link>
    </div>
  );

  return (
    <>
      <section className="page-hero">
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <h1>{course.title}</h1>
          {course.shortDescription && <p>{course.shortDescription}</p>}
          <div className="page-breadcrumb">
            <a href="/">Home</a><i className="bi bi-chevron-right" />
            <a href="/courses">Courses</a><i className="bi bi-chevron-right" />
            <span style={{ color: "#fff" }}>{course.title}</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 40 }}>
            {/* Main */}
            <div>
              {course.image?.url && (
                <img src={course.image.url} alt={course.title} style={{ width: "100%", borderRadius: "var(--radius-lg)", marginBottom: 32, maxHeight: 380, objectFit: "cover" }} />
              )}
              {course.description && (
                <>
                  <h3 style={{ marginBottom: 16 }}>Course Overview</h3>
                  <p style={{ lineHeight: 1.9, marginBottom: 32 }}>{course.description}</p>
                </>
              )}

              {/* Subjects */}
              {course.subjects?.length > 0 && (
                <div style={{ marginBottom: 32 }}>
                  <h3 style={{ marginBottom: 16 }}>Subjects</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {course.subjects.map((s, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 14px", background: "var(--bg-soft-blue)", borderRadius: "var(--radius-md)" }}>
                        <i className="bi bi-check-circle-fill" style={{ color: "var(--primary)", flexShrink: 0 }} />
                        <span style={{ fontSize: "0.9rem" }}>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Books */}
              {course.books?.length > 0 && (
                <div>
                  <h3 style={{ marginBottom: 16 }}>Recommended Books</h3>
                  <div className="grid grid-3">
                    {course.books.map((b, i) => (
                      <div key={i} style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: 16, textAlign: "center" }}>
                        {b.image?.url && <img src={b.image.url} alt={b.name} style={{ width: "100%", height: 120, objectFit: "contain", marginBottom: 10 }} />}
                        <div style={{ fontWeight: 600, fontSize: "0.88rem", color: "var(--navy)" }}>{b.name}</div>
                        {b.publisher && <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{b.publisher}</div>}
                        {b.price     && <div style={{ fontSize: "0.82rem", color: "var(--primary)", marginTop: 4 }}>₹{b.price}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div>
              <div className="admin-card" style={{ position: "sticky", top: 90 }}>
                <div className="admin-card-body">
                  <h4 style={{ marginBottom: 20 }}>Course Details</h4>
                  {[
                    { icon: "bi-tag",       label: "Category",     value: course.category },
                    { icon: "bi-journal",   label: "Class",        value: course.className },
                    { icon: "bi-person",    label: "Class Teacher",value: course.classTeacher },
                    { icon: "bi-clock",     label: "Timing",       value: course.timing },
                  ].filter((i) => i.value).map((item) => (
                    <div key={item.label} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                      <i className={`bi ${item.icon}`} style={{ color: "var(--primary)", width: 20, textAlign: "center", flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{item.label}</div>
                        <div style={{ fontWeight: 600, color: "var(--navy)", fontSize: "0.9rem" }}>{item.value}</div>
                      </div>
                    </div>
                  ))}

                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}>
                    {course.feePdf?.url && (
                      <a href={course.feePdf.url} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                        <i className="bi bi-file-earmark-pdf" /> Fee Structure
                      </a>
                    )}
                    {course.timetablePdf?.url && (
                      <a href={course.timetablePdf.url} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                        <i className="bi bi-calendar3" /> Timetable
                      </a>
                    )}
                    <Link to="/admission" className="btn btn-primary btn-sm">
                      <i className="bi bi-pencil-square" /> Apply for Admission
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
