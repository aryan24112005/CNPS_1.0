import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPublicCourses } from "../../services/publicService";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("all");

  useEffect(() => {
    getPublicCourses().then(setCourses).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const categories = ["all", ...new Set(courses.map((c) => c.category).filter(Boolean))];
  const filtered   = filter === "all" ? courses : courses.filter((c) => c.category === filter);

  return (
    <>
      <section className="page-hero">
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <h1>Our Courses</h1>
          <p>Comprehensive education from Nursery to Class 12 with specialised streams.</p>
          <div className="page-breadcrumb">
            <a href="/">Home</a>
            <i className="bi bi-chevron-right" />
            <span style={{ color: "#fff" }}>Courses</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {/* Category filter — flex-wrap keeps buttons from overflowing on small screens */}
          {categories.length > 1 && (
            <div style={{
              display: "flex",
              gap: "clamp(6px, 2vw, 10px)",
              flexWrap: "wrap",
              marginBottom: 36,
              justifyContent: "center",
            }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`btn btn-sm ${filter === cat ? "btn-primary" : "btn-outline"}`}
                >
                  {cat === "all" ? "All Courses" : cat}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="loading-state"><div className="spinner" /><p>Loading courses...</p></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-book" />
              <h4>No courses found</h4>
              <p>Check back soon for new courses.</p>
            </div>
          ) : (
            <div className="grid grid-3">
              {filtered.map((c) => (
                <div key={c._id} className="card">
                  {c.image?.url ? (
                    <img className="card-img" src={c.image.url} alt={c.title} />
                  ) : (
                    <div className="card-img" style={{
                      background: "var(--bg-soft-blue)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <i className="bi bi-book" style={{ fontSize: "3rem", color: "var(--primary-light)" }} />
                    </div>
                  )}
                  <div className="card-body">
                    {c.category  && <span className="badge badge-primary" style={{ marginBottom: 8 }}>{c.category}</span>}
                    {c.className && <span className="badge badge-navy" style={{ marginBottom: 8, marginLeft: 6 }}>Class {c.className}</span>}
                    <h4 style={{ marginBottom: 8 }}>{c.title}</h4>
                    {c.classTeacher && (
                      <p style={{ fontSize: "0.82rem", color: "var(--primary)", marginBottom: 6 }}>
                        <i className="bi bi-person" /> {c.classTeacher}
                      </p>
                    )}
                    <p style={{
                      fontSize: "0.88rem", marginBottom: 16,
                      display: "-webkit-box", WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical", overflow: "hidden",
                    }}>
                      {c.shortDescription || c.description || "Comprehensive curriculum designed for excellence."}
                    </p>
                    <Link to={`/courses/${c.slug || c._id}`} className="btn btn-primary btn-sm">
                      View Details <i className="bi bi-arrow-right" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
