import { useEffect, useRef, useState } from "react";
import Swiper from "swiper/bundle";
import { getPublicTestimonials, API_ORIGIN, } from "../services/testimonialService.js";

function TestimonialsSection() {
    const swiperRef = useRef(null);

    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                const data = await getPublicTestimonials();
                console.log("TESTIMONIALS FROM API:", data);
                setTestimonials(data);
            } catch (error) {
                console.error("Testimonials error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTestimonials();
    }, []);

    const getAvatarUrl = (avatar) => {
        if (!avatar) {
            return "";
        }

        if (
            avatar.startsWith("http://") ||
            avatar.startsWith("https://")
        ) {
            return avatar;
        }

        if (avatar.startsWith("/assets/")) {
            return avatar;
        }

        if (avatar.startsWith("/uploads/")) {
            return `${API_ORIGIN}${avatar}`;
        }

        return `${API_ORIGIN}/${avatar}`;
    };

    useEffect(() => {
        if (
            !swiperRef.current ||
            loading ||
            testimonials.length === 0
        ) {
            return;
        }

        const swiper = new Swiper(swiperRef.current, {
            loop: testimonials.length > 2,
            speed: 600,

            autoplay: {
                delay: 5000,
                disableOnInteraction: false,
            },

            slidesPerView: 1,
            spaceBetween: 40,

            pagination: {
                el: swiperRef.current.querySelector(
                    ".swiper-pagination"
                ),
                clickable: true,
            },

            breakpoints: {
                320: {
                    slidesPerView: 1,
                    spaceBetween: 40,
                },

                1200: {
                    slidesPerView: 2,
                    spaceBetween: 20,
                },
            },
        });

        return () => {
            if (swiper && !swiper.destroyed) {
                swiper.destroy(true, true);
            }
        };
    }, [loading, testimonials]);

    // Don't show empty section
    if (!loading && testimonials.length === 0) {
        return null;
    }

    return (
        <section
            id="testimonials"
            className="testimonials section"
        >

            <div
                className="container section-title"
                data-aos="fade-up"
            >
                <h2>Testimonials</h2>
                <p>What Our Parents &amp; Students Say</p>
            </div>

            <div
                className="container"
                data-aos="fade-up"
                data-aos-delay="100"
            >
                <div
                    ref={swiperRef}
                    className="testimonials-slider swiper"
                >

                    <div className="swiper-wrapper">



                        {testimonials.map((testimonial) => (
                            <div
                                className="swiper-slide"
                                key={testimonial.id}
                            >

                                <div className="testimonial-item">

                                    {/* Profile */}
                                    <div className="profile mt-auto">

                                        {getAvatarUrl(testimonial.image) ? (
                                            <img
                                                src={getAvatarUrl(testimonial.image)}
                                                className="testimonial-img"
                                                alt={testimonial.name}
                                            />
                                        ) : (
                                            <div
                                                className="testimonial-img d-flex align-items-center justify-content-center bg-light rounded-circle"
                                                style={{ width: "60px", height: "60px", flexShrink: 0 }}
                                            >
                                                <i className="bi bi-person-fill text-muted" style={{ fontSize: "28px" }}></i>
                                            </div>
                                        )}

                                        <div>
                                            <h3>
                                                {testimonial.name}
                                            </h3>

                                            <h4>
                                                {testimonial.designation ||
                                                    "Parent"}
                                            </h4>
                                        </div>

                                    </div>

                                    {/* Rating */}
                                    <div className="stars">

                                        {Array.from({
                                            length: 5,
                                        }).map((_, starIndex) => (
                                            <i
                                                key={starIndex}
                                                className={
                                                    starIndex <
                                                        testimonial.rating
                                                        ? "bi bi-star-fill"
                                                        : "bi bi-star"
                                                }
                                            ></i>
                                        ))}

                                    </div>

                                    {/* Review */}
                                    <p>
                                        {testimonial.message}
                                    </p>

                                </div>

                            </div>
                        ))}

                    </div>

                    {/* Pagination */}
                    <div className="swiper-pagination"></div>

                </div>
            </div>

        </section>
    );
}

export default TestimonialsSection;