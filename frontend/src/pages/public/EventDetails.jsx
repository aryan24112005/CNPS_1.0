import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getPublicEventBySlug } from "../../services/publicService";

function fmtDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

/* ── Lightbox ─────────────────────────────────────────────── */
function Lightbox({ images, index, onClose, onPrev, onNext }) {
  const img = images[index];
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image lightbox"
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.93)",
        zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center",
      }}
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        aria-label="Close lightbox"
        style={{
          position: "absolute", top: 16, right: 16,
          background: "rgba(255,255,255,0.15)", border: "none",
          color: "#fff", fontSize: "1.3rem",
          width: 44, height: 44, minWidth: 44,
          borderRadius: "50%", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1,
        }}
      >
        <i className="bi bi-x-lg" />
      </button>

      {/* Prev */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          aria-label="Previous image"
          style={{
            position: "absolute", left: 8,
            background: "rgba(255,255,255,0.15)", border: "none",
            color: "#fff", fontSize: "1.3rem",
            width: 44, height: 44, minWidth: 44,
            borderRadius: "50%", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <i className="bi bi-chevron-left" />
        </button>
      )}

      {/* Image */}
      <img
        src={img.url}
        alt={img.caption || `Gallery ${index + 1}`}
        onClick={(e) => e.stopPropagation()}
        style={{
          maxHeight: "82vh",
          maxWidth: "calc(100vw - 96px)",
          objectFit: "contain",
          borderRadius: "var(--radius-md)",
        }}
      />

      {/* Next */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          aria-label="Next image"
          style={{
            position: "absolute", right: 8,
            background: "rgba(255,255,255,0.15)", border: "none",
            color: "#fff", fontSize: "1.3rem",
            width: 44, height: 44, minWidth: 44,
            borderRadius: "50%", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <i className="bi bi-chevron-right" />
        </button>
      )}

      {/* Counter */}
      <div style={{
        position: "absolute", bottom: 16, left: "50%",
        transform: "translateX(-50%)",
        fontSize: "0.82rem", color: "rgba(255,255,255,0.65)",
        textAlign: "center",
        background: "rgba(0,0,0,0.4)",
        padding: "4px 12px",
        borderRadius: 999,
      }}>
        {index + 1} / {images.length}
      </div>
    </div>
  );
}

export default function EventDetails() {
  const { slug }              = useParams();
  const [event, setEvent]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    getPublicEventBySlug(slug)
      .then(setEvent)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  /* Keyboard navigation for lightbox */
  useEffect(() => {
    if (lightbox === null || !event?.gallery?.length) return;
    const len = event.gallery.length;
    const handler = (e) => {
      if (e.key === "Escape")      setLightbox(null);
      if (e.key === "ArrowRight")  setLightbox((i) => (i + 1) % len);
      if (e.key === "ArrowLeft")   setLightbox((i) => (i - 1 + len) % len);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox, event]);

  if (loading) {
    return <div className="loading-state" style={{ minHeight: "60vh" }}><div className="spinner" /></div>;
  }
  if (!event) {
    return (
      <div className="empty-state" style={{ minHeight: "60vh" }}>
        <i className="bi bi-calendar-x" />
        <h4>Event not found</h4>
        <Link to="/events" className="btn btn-primary mt-2">Back to Events</Link>
      </div>
    );
  }

  const galleryLen = event.gallery?.length || 0;

  return (
    <>
      {/* Lightbox */}
      {lightbox !== null && galleryLen > 0 && (
        <Lightbox
          images={event.gallery}
          index={lightbox}
          onClose={() => setLightbox(null)}
          onPrev={() => setLightbox((i) => (i - 1 + galleryLen) % galleryLen)}
          onNext={() => setLightbox((i) => (i + 1) % galleryLen)}
        />
      )}

      <section className="page-hero">
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <h1>{event.title}</h1>
          {event.eventDate && <p><i className="bi bi-calendar3" /> {fmtDate(event.eventDate)}</p>}
          <div className="page-breadcrumb">
            <a href="/">Home</a>
            <i className="bi bi-chevron-right" />
            <a href="/events">Events</a>
            <i className="bi bi-chevron-right" />
            <span style={{ color: "#fff" }}>{event.title}</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {event.coverImage?.url && (
            <img
              src={event.coverImage.url}
              alt={event.title}
              style={{
                width: "100%", maxHeight: 440, objectFit: "cover",
                borderRadius: "var(--radius-xl)", marginBottom: 40,
                boxShadow: "var(--shadow-lg)",
              }}
            />
          )}

          {/*
            .event-detail-grid defined in global.css:
            2fr 1fr on ≥900px, single column on mobile
          */}
          <div className="event-detail-grid">
            {/* Main */}
            <div style={{ minWidth: 0 }}>
              {event.description && (
                <p style={{ fontSize: "1.02rem", lineHeight: 1.9 }}>{event.description}</p>
              )}

              {galleryLen > 0 && (
                <div style={{ marginTop: 40 }}>
                  <h3 style={{ marginBottom: 20 }}>Event Gallery</h3>
                  {/* .event-gallery-grid defined in global.css */}
                  <div className="event-gallery-grid">
                    {event.gallery.map((img, i) => (
                      <div
                        key={img._id || i}
                        onClick={() => setLightbox(i)}
                        role="button"
                        tabIndex={0}
                        aria-label={`View photo ${i + 1}`}
                        onKeyDown={(e) => e.key === "Enter" && setLightbox(i)}
                        style={{
                          cursor: "pointer", borderRadius: "var(--radius-md)",
                          overflow: "hidden", aspectRatio: "1",
                        }}
                      >
                        <img
                          src={img.url}
                          alt={img.caption || `Gallery ${i + 1}`}
                          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s" }}
                          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div style={{ minWidth: 0 }}>
              {/* .event-sidebar-card sticky defined in global.css */}
              <div className="admin-card event-sidebar-card">
                <div className="admin-card-body">
                  <h4 style={{ marginBottom: 20 }}>Event Info</h4>
                  {event.eventDate && (
                    <div style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                      <i className="bi bi-calendar3" style={{ color: "var(--primary)", flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Date</div>
                        <div style={{ fontWeight: 600, color: "var(--navy)", fontSize: "0.9rem" }}>{fmtDate(event.eventDate)}</div>
                      </div>
                    </div>
                  )}
                  {event.location && (
                    <div style={{ display: "flex", gap: 12, padding: "12px 0" }}>
                      <i className="bi bi-geo-alt" style={{ color: "var(--primary)", flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Location</div>
                        <div style={{ fontWeight: 600, color: "var(--navy)", fontSize: "0.9rem" }}>{event.location}</div>
                      </div>
                    </div>
                  )}
                  <Link
                    to="/events"
                    className="btn btn-outline btn-sm w-full"
                    style={{ marginTop: 16, justifyContent: "center" }}
                  >
                    ← All Events
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
