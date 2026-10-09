import { useEffect, useState } from "react";
import { getPublicGallery } from "../../services/publicService";

/* ── Lightbox ─────────────────────────────────────────────── */
function Lightbox({ images, index, onClose, onPrev, onNext }) {
  const img = images[index];
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Photo lightbox"
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.93)",
        zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center",
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
        alt={img.caption || "Gallery image"}
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "calc(100vw - 96px)",
          maxHeight: "80vh",
          objectFit: "contain",
          borderRadius: "var(--radius-md)",
          boxShadow: "0 8px 48px rgba(0,0,0,0.6)",
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

      {/* Caption & counter */}
      <div style={{
        position: "absolute", bottom: 16, left: "50%",
        transform: "translateX(-50%)",
        textAlign: "center", color: "rgba(255,255,255,0.8)",
        fontSize: "0.88rem", width: "100%",
        padding: "0 60px",
        pointerEvents: "none",
      }}>
        {img.caption && (
          <p style={{ margin: "0 0 4px", color: "rgba(255,255,255,0.9)" }}>{img.caption}</p>
        )}
        <span style={{
          fontSize: "0.78rem", opacity: 0.65,
          background: "rgba(0,0,0,0.4)",
          padding: "2px 10px", borderRadius: 999,
        }}>
          {index + 1} / {images.length}
        </span>
      </div>
    </div>
  );
}

export default function Gallery() {
  const [albums, setAlbums]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [expandedAlbum, setExpandedAlbum] = useState(null);
  const [lightbox, setLightbox]           = useState(null); // { images, index }

  useEffect(() => {
    getPublicGallery().then(setAlbums).catch(() => {}).finally(() => setLoading(false));
  }, []);

  /* Keyboard navigation */
  useEffect(() => {
    if (!lightbox) return;
    const len = lightbox.images.length;
    const handler = (e) => {
      if (e.key === "Escape")     setLightbox(null);
      if (e.key === "ArrowRight") setLightbox((lb) => lb && ({ ...lb, index: (lb.index + 1) % len }));
      if (e.key === "ArrowLeft")  setLightbox((lb) => lb && ({ ...lb, index: (lb.index - 1 + len) % len }));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox]);

  const toggleAlbum = (slug) => {
    setExpandedAlbum((prev) => (prev === slug ? null : slug));
    setLightbox(null);
  };

  const openLightbox = (images, index) => setLightbox({ images, index });

  return (
    <>
      <section className="page-hero">
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <h1>Photo Gallery</h1>
          <p>Explore memories, events and moments captured at CNPS.</p>
          <div className="page-breadcrumb">
            <a href="/">Home</a>
            <i className="bi bi-chevron-right" />
            <span style={{ color: "#fff" }}>Gallery</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {loading ? (
            <div className="loading-state"><div className="spinner" /></div>
          ) : albums.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-images" />
              <h4>No albums found</h4>
              <p>Check back soon for photos and gallery updates.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              {/* Album cards grid */}
              <div className="grid grid-3">
                {albums.map((album) => {
                  const isExpanded = expandedAlbum === (album.slug || album._id);
                  return (
                    <div
                      key={album._id}
                      className="card"
                      style={{
                        cursor: "pointer",
                        outline: isExpanded ? "2px solid var(--primary)" : "none",
                        outlineOffset: 2,
                        transition: "var(--transition)",
                      }}
                      onClick={() => toggleAlbum(album.slug || album._id)}
                      role="button"
                      tabIndex={0}
                      aria-expanded={isExpanded}
                      aria-label={`${album.title} album`}
                      onKeyDown={(e) => e.key === "Enter" && toggleAlbum(album.slug || album._id)}
                    >
                      {album.coverImage?.url ? (
                        <img
                          className="card-img"
                          src={album.coverImage.url}
                          alt={album.title}
                          style={{ objectFit: "cover", height: 200 }}
                        />
                      ) : (
                        <div className="card-img" style={{
                          height: 200, background: "var(--bg-soft-blue)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <i className="bi bi-image" style={{ fontSize: "3rem", color: "var(--primary-light)" }} />
                        </div>
                      )}
                      <div className="card-body">
                        {album.category && (
                          <span style={{
                            display: "inline-block", background: "var(--bg-soft-blue)",
                            color: "var(--primary)", fontSize: "0.75rem", fontWeight: 600,
                            padding: "3px 10px", borderRadius: "var(--radius-pill)",
                            marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px",
                          }}>
                            {album.category}
                          </span>
                        )}
                        <h4 style={{ margin: "0 0 6px", fontSize: "1rem" }}>{album.title}</h4>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                          <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                            <i className="bi bi-images" />{" "}
                            {album.images?.length || 0} photo{(album.images?.length || 0) !== 1 ? "s" : ""}
                          </span>
                          <span style={{ fontSize: "0.82rem", color: "var(--primary)", fontWeight: 600 }}>
                            {isExpanded ? (
                              <><i className="bi bi-chevron-up" /> Collapse</>
                            ) : (
                              <><i className="bi bi-chevron-down" /> View Photos</>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Expanded album images */}
              {expandedAlbum && (() => {
                const album = albums.find((a) => (a.slug || a._id) === expandedAlbum);
                if (!album || !album.images?.length) return null;
                return (
                  <div className="gallery-expanded-section">
                    <div style={{
                      display: "flex", alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 20, flexWrap: "wrap", gap: 8,
                    }}>
                      <h3 style={{ margin: 0 }}>
                        <i className="bi bi-images" style={{ color: "var(--primary)", marginRight: 8 }} />
                        {album.title}
                      </h3>
                      <button
                        onClick={() => setExpandedAlbum(null)}
                        aria-label="Close album"
                        style={{
                          background: "none", border: "none", cursor: "pointer",
                          fontSize: "1.4rem", color: "var(--text-muted)",
                          display: "flex", alignItems: "center", padding: 4,
                          minWidth: 36, minHeight: 36,
                        }}
                      >
                        <i className="bi bi-x-lg" />
                      </button>
                    </div>
                    {/* .gallery-photo-grid defined in global.css — responsive minmax */}
                    <div className="gallery-photo-grid">
                      {album.images.map((img, idx) => (
                        <div
                          key={img._id || idx}
                          onClick={() => openLightbox(album.images, idx)}
                          role="button"
                          tabIndex={0}
                          aria-label={`View photo ${idx + 1}`}
                          onKeyDown={(e) => e.key === "Enter" && openLightbox(album.images, idx)}
                          style={{
                            aspectRatio: "1", overflow: "hidden",
                            borderRadius: "var(--radius-md)", cursor: "pointer", position: "relative",
                          }}
                        >
                          <img
                            src={img.url}
                            alt={img.caption || `Photo ${idx + 1}`}
                            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s ease" }}
                            onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.06)")}
                            onMouseOut={(e)  => (e.currentTarget.style.transform = "scale(1)")}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <Lightbox
          images={lightbox.images}
          index={lightbox.index}
          onClose={() => setLightbox(null)}
          onPrev={() => setLightbox((lb) => ({ ...lb, index: (lb.index - 1 + lb.images.length) % lb.images.length }))}
          onNext={() => setLightbox((lb) => ({ ...lb, index: (lb.index + 1) % lb.images.length }))}
        />
      )}
    </>
  );
}
