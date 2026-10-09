import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getPublicEventBySlug } from "../../services/publicService";

function fmtDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

export default function EventDetails() {
  const { slug }           = useParams();
  const [event, setEvent]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    getPublicEventBySlug(slug)
      .then(setEvent)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="loading-state" style={{ minHeight: "60vh" }}><div className="spinner" /></div>;
  if (!event) return (
    <div className="empty-state" style={{ minHeight: "60vh" }}>
      <i className="bi bi-calendar-x" />
      <h4>Event not found</h4>
      <Link to="/events" className="btn btn-primary mt-2">Back to Events</Link>
    </div>
  );

  return (
    <>
      {/* Lightbox */}
      {lightbox !== null && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setLightbox(null)}>
          <img src={event.gallery[lightbox].url} alt="" style={{ maxHeight: "90vh", maxWidth: "90vw", borderRadius: "var(--radius-md)" }} />
          <button onClick={() => setLightbox(null)} style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", color: "#fff", fontSize: "2rem", cursor: "pointer" }}>×</button>
        </div>
      )}

      <section className="page-hero">
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <h1>{event.title}</h1>
          {event.eventDate && <p><i className="bi bi-calendar3" /> {fmtDate(event.eventDate)}</p>}
          <div className="page-breadcrumb">
            <a href="/">Home</a><i className="bi bi-chevron-right" />
            <a href="/events">Events</a><i className="bi bi-chevron-right" />
            <span style={{ color: "#fff" }}>{event.title}</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {event.coverImage?.url && (
            <img src={event.coverImage.url} alt={event.title} style={{ width: "100%", maxHeight: 440, objectFit: "cover", borderRadius: "var(--radius-xl)", marginBottom: 40, boxShadow: "var(--shadow-lg)" }} />
          )}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 40 }}>
            <div>
              {event.description && <p style={{ fontSize: "1.02rem", lineHeight: 1.9 }}>{event.description}</p>}
              {event.gallery?.length > 0 && (
                <div style={{ marginTop: 40 }}>
                  <h3 style={{ marginBottom: 20 }}>Event Gallery</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                    {event.gallery.map((img, i) => (
                      <div key={img._id || i} onClick={() => setLightbox(i)} style={{ cursor: "pointer", borderRadius: "var(--radius-md)", overflow: "hidden", aspectRatio: "1" }}>
                        <img src={img.url} alt={img.caption || `Gallery ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s" }}
                          onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"}
                          onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div>
              <div className="admin-card" style={{ position: "sticky", top: 90 }}>
                <div className="admin-card-body">
                  <h4 style={{ marginBottom: 20 }}>Event Info</h4>
                  {event.eventDate && (
                    <div style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                      <i className="bi bi-calendar3" style={{ color: "var(--primary)" }} />
                      <div><div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Date</div><div style={{ fontWeight: 600, color: "var(--navy)", fontSize: "0.9rem" }}>{fmtDate(event.eventDate)}</div></div>
                    </div>
                  )}
                  {event.location && (
                    <div style={{ display: "flex", gap: 12, padding: "12px 0" }}>
                      <i className="bi bi-geo-alt" style={{ color: "var(--primary)" }} />
                      <div><div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Location</div><div style={{ fontWeight: 600, color: "var(--navy)", fontSize: "0.9rem" }}>{event.location}</div></div>
                    </div>
                  )}
                  <Link to="/events" className="btn btn-outline btn-sm w-full" style={{ marginTop: 16, justifyContent: "center" }}>← All Events</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
