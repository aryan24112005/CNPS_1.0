import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getPublicEvents,
  getEventImageUrl,
} from "../services/eventService";

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await getPublicEvents();
        setEvents(data);
      } catch (error) {
        console.error("Failed to load events:", error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  return (
    <>
      {/* Page Title */}
      <div className="page-title" data-aos="fade">
        <div className="heading">
          <div className="container">
            <div className="row justify-content-center text-center">
              <div className="col-lg-8">
                <h1>Events</h1>

                <p>
                  Discover the latest events, activities,
                  celebrations, and memorable moments from
                  DS Convent School.
                </p>
              </div>
            </div>
          </div>
        </div>

        <nav className="breadcrumbs">
          <div className="container">
            <ol>
              <li>
                <Link to="/">Home</Link>
              </li>

              <li className="current">
                Events
              </li>
            </ol>
          </div>
        </nav>
      </div>

      {/* Events Section */}
      <section id="events" className="events section">

        <div
          className="container section-title"
          data-aos="fade-up"
        >
          <h2>Events</h2>
          <p>Latest Events</p>
        </div>

        <div className="container">
          <div className="row">

            {/* Loading */}
            {loading ? (
              <div className="col-12 text-center">
                <p>Loading events...</p>
              </div>
            ) : events.length > 0 ? (

              events.map((event, index) => {

                const imageUrl =
                  getEventImageUrl(event.image);

                return (
                  <div
                    className="col-lg-4 col-md-6 d-flex align-items-stretch"
                    key={event.id}
                    data-aos="fade-up"
                    data-aos-delay={
                      (index + 1) * 100
                    }
                  >
                    <div className="card">

                      {/* Event Image */}
                      <Link
                        to={`/events/${event.slug}`}
                        className="event-card-image-link"
                        aria-label={`View ${event.title}`}
                      >
                        <div className="card-img">

                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={event.title}
                              className="img-fluid"
                            />
                          ) : (
                            <div className="event-image-placeholder">
                              No Image
                            </div>
                          )}

                        </div>
                      </Link>

                      {/* Event Content */}
                      <div className="card-body">

                        {/* Event Title */}
                        <h5 className="card-title">
                          <Link
                            to={`/events/${event.slug}`}
                          >
                            {event.title}
                          </Link>
                        </h5>

                        {/* Event Description */}
                        <p className="card-text event-description">
                          {event.short_description ||
                            event.description}
                        </p>

                        {/* Read More */}
                        <Link
                          to={`/events/${event.slug}`}
                          className="event-read-more"
                        >
                          Read More
                          <i className="bi bi-arrow-right"></i>
                        </Link>

                      </div>

                    </div>
                  </div>
                );
              })

            ) : (

              <div className="col-12 text-center">
                <p>Events are updated soon.</p>
              </div>

            )}

          </div>
        </div>

      </section>
    </>
  );
}

export default Events;