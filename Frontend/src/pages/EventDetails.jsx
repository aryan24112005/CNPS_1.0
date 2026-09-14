import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
    getPublicEventBySlug,
    getEventImageUrl,
} from "../services/eventService";

function EventDetails() {
    const { eventSlug } = useParams();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        const loadEvent = async () => {
            try {
                setLoading(true);
                setNotFound(false);

                const data = await getPublicEventBySlug(eventSlug);

                setEvent(data);
            } catch (error) {
                console.error("Failed to load event:", error);
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        };

        if (eventSlug) {
            loadEvent();
        }
    }, [eventSlug]);

    useEffect(() => {
        if (!event) return;

        requestAnimationFrame(() => {
            window.dispatchEvent(
                new Event("event-gallery-updated")
            );
        });
    }, [event]);


    /* =========================
       LOADING
    ========================== */

    if (loading) {
        return (
            <div className="container section text-center">
                <h2>Loading Event...</h2>
            </div>
        );
    }


    /* =========================
       EVENT NOT FOUND
    ========================== */

    if (notFound || !event) {
        return (
            <div className="container section text-center">

                <h2>Event Not Found</h2>

                <p>
                    The event you are looking for is not available.
                </p>

                <Link to="/events">
                    Back to Events
                </Link>

            </div>
        );
    }


    const eventImage = getEventImageUrl(event.image);


    return (
        <>
            {/* =========================
                PAGE TITLE
            ========================== */}

            <div
                className="page-title"
                data-aos="fade"
            >

                <div className="heading">

                    <div className="container">

                        <div className="row justify-content-center text-center">

                            <div className="col-lg-8">

                                <h1>
                                    {event.title}
                                </h1>

                                <p className="mb-0">
                                    {event.short_description ||
                                        event.description}
                                </p>

                            </div>

                        </div>

                    </div>

                </div>


                <nav className="breadcrumbs">

                    <div className="container">

                        <ol>

                            <li>
                                <Link to="/">
                                    Home
                                </Link>
                            </li>

                            <li>
                                <Link to="/events">
                                    Events
                                </Link>
                            </li>

                            <li className="current">
                                {event.title}
                            </li>

                        </ol>

                    </div>

                </nav>

            </div>


            {/* =========================
                EVENT DETAILS
            ========================== */}

            <section className="event-details section">

                <div className="container">

                    {/* =====================
                        MAIN BANNER
                    ===================== */}

                    {eventImage && (
                        <div
                            className="event-detail-banner"
                            data-aos="fade-up"
                        >

                            <img
                                src={eventImage}
                                alt={event.title}
                            />

                        </div>
                    )}


                    {/* =====================
                        DESCRIPTION
                    ===================== */}

                    <div
                        className="event-detail-content"
                        data-aos="fade-up"
                    >

                        <h2>
                            {event.title}
                        </h2>

                        <p>
                            {event.description ||
                                event.short_description}
                        </p>

                    </div>


                    {/* =====================
                        EVENT INFORMATION
                    ===================== */}

                    {(event.event_date ||
                        event.start_time ||
                        event.end_time ||
                        event.venue) && (

                            <div
                                className="event-info"
                                data-aos="fade-up"
                            >

                                {event.event_date && (
                                    <p>
                                        <strong>Date:</strong>{" "}
                                        {event.event_date}
                                    </p>
                                )}

                                {event.start_time && (
                                    <p>
                                        <strong>Start Time:</strong>{" "}
                                        {event.start_time}
                                    </p>
                                )}

                                {event.end_time && (
                                    <p>
                                        <strong>End Time:</strong>{" "}
                                        {event.end_time}
                                    </p>
                                )}

                                {event.venue && (
                                    <p>
                                        <strong>Venue:</strong>{" "}
                                        {event.venue}
                                    </p>
                                )}

                            </div>
                        )}


                    {/* =====================
                      GALLERY
                    ===================== */}

                    {event.gallery && event.gallery.length > 0 && (
                        <div
                            className="event-gallery-section"
                            data-aos="fade-up"
                        >
                            <div className="section-title">
                                <h2>Event Gallery</h2>

                                <p>
                                    {event.title} Moments
                                </p>
                            </div>

                            <div className="row gy-4">
                                {event.gallery.map((galleryImage, index) => {
                                    const imageUrl = getEventImageUrl(
                                        galleryImage.image
                                    );

                                    return (
                                        <div
                                            className="col-lg-4 col-md-6"
                                            key={galleryImage.id}
                                            data-aos="zoom-in"
                                            data-aos-delay={(index + 1) * 100}
                                        >
                                            <a
                                                href={imageUrl}
                                                className="glightbox event-gallery-item"
                                                data-gallery={`event-${event.id}`}
                                                data-title={
                                                    galleryImage.caption ||
                                                    `${event.title} ${index + 1}`
                                                }
                                            >
                                                <img
                                                    src={imageUrl}
                                                    alt={
                                                        galleryImage.caption ||
                                                        `${event.title} ${index + 1}`
                                                    }
                                                    className="img-fluid"
                                                />

                                                <div className="event-gallery-overlay">
                                                    <i className="bi bi-zoom-in"></i>
                                                </div>
                                            </a>

                                            {galleryImage.caption && (
                                                <div className="event-gallery-caption">
                                                    {galleryImage.caption}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}


                    {/* =====================
                        BACK BUTTON
                    ===================== */}

                    <div className="event-back-button">

                        <Link
                            to="/events"
                            className="read-more"
                        >

                            <i className="bi bi-arrow-left"></i>

                            <span>
                                Back to Events
                            </span>

                        </Link>

                    </div>

                </div>

            </section>
        </>
    );
}

export default EventDetails;