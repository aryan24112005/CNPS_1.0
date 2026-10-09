import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPublicEvents } from "../../services/publicService";

function fmtDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

export default function Events() {
  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicEvents().then(setEvents).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="page-hero">
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <h1>School Events</h1>
          <p>Stay updated with all events, activities and celebrations at CNPS.</p>
          <div className="page-breadcrumb">
            <a href="/">Home</a>
            <i className="bi bi-chevron-right" />
            <span style={{ color: "#fff" }}>Events</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {loading ? (
            <div className="loading-state"><div className="spinner" /></div>
          ) : events.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-calendar-event" />
              <h4>No events found</h4>
              <p>Check back soon for upcoming events.</p>
            </div>
          ) : (
            /* grid-3 collapses: 3-col → 2-col (≤900px) → 1-col (≤640px) via global.css */
            <div className="grid grid-3">
              {events.map((e) => (
                <div key={e._id} className="card">
                  {e.coverImage?.url ? (
                    <img className="card-img" src={e.coverImage.url} alt={e.title} />
                  ) : (
                    <div className="card-img" style={{
                      background: "var(--bg-soft-blue)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <i className="bi bi-calendar-event" style={{ fontSize: "3rem", color: "var(--primary-light)" }} />
                    </div>
                  )}
                  <div className="card-body">
                    {e.eventDate && (
                      <span className="badge badge-primary" style={{ marginBottom: 10 }}>
                        <i className="bi bi-calendar3" /> {fmtDate(e.eventDate)}
                      </span>
                    )}
                    <h4 style={{ marginBottom: 8 }}>{e.title}</h4>
                    {e.location && (
                      <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: 8 }}>
                        <i className="bi bi-geo-alt" /> {e.location}
                      </p>
                    )}
                    <p style={{
                      fontSize: "0.88rem", marginBottom: 16,
                      display: "-webkit-box", WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical", overflow: "hidden",
                    }}>
                      {e.description}
                    </p>
                    <Link to={`/events/${e.slug || e._id}`} className="btn btn-outline btn-sm">
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
