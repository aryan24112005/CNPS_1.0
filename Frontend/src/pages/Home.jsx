import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import AboutSection from "../components/AboutSection";
import NoticeTicker from "../components/NoticeTicker";
import CountsSection from "../components/CountsSection";
import WhyUsSection from "../components/WhyUsSection";
import CoursesSection from "../components/CoursesSection";
import TrainersSection from "../components/TrainersSection";

import {
    getPublicHeroSlides,
    getHeroMediaUrl,
} from "../services/heroService";


function Home() {
    const [heroSlides, setHeroSlides] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [heroLoading, setHeroLoading] = useState(true);

    useEffect(() => {
        const loadHeroSlides = async () => {
            try {
                const slides = await getPublicHeroSlides();
                setHeroSlides(slides);
            } catch (error) {
                console.error("Failed to load hero slides:", error);
            } finally {
                setHeroLoading(false);
            }
        };

        loadHeroSlides();
    }, []);

    useEffect(() => {
        if (heroSlides.length <= 1) return;

        const current = heroSlides[currentSlide];

        // Video apne end par next slide karega
        if (current?.media_type === "video") return;

        const timer = setInterval(() => {
            setCurrentSlide((prev) =>
                (prev + 1) % heroSlides.length
            );
        }, 5000);

        return () => clearInterval(timer);
    }, [heroSlides, currentSlide]);


    const nextSlide = () => {
        setCurrentSlide((prev) =>
            (prev + 1) % heroSlides.length
        );
    };

    const prevSlide = () => {
        setCurrentSlide((prev) =>
            (prev - 1 + heroSlides.length) % heroSlides.length
        );
    };


    return (
        <main className="main">

            {/* ================= HERO ================= */}
            <section
                id="hero"
                className="hero section dark-background"
            >

                {heroLoading ? (
                    <img
                        src="/assets/img/hero-bg.png"
                        alt="DS Convent School"
                    />
                ) : heroSlides.length === 0 ? (

                    // DB me koi active slide nahi hai
                    <img
                        src="/assets/img/hero-bg.png"
                        alt="DS Convent School"
                    />

                ) : (

                    <>

                        {heroSlides.map((slide, index) => {

                            const mediaUrl = getHeroMediaUrl(
                                slide.media_path
                            );

                            return (
                                <div
                                    key={slide.id}
                                    className={`hero-slide ${index === currentSlide
                                            ? "active"
                                            : ""
                                        }`}
                                >

                                    {slide.media_type === "video" ? (

                                        <video
                                            className="hero-media"
                                            src={mediaUrl}
                                            autoPlay={index === currentSlide}
                                            muted
                                            playsInline
                                            preload="metadata"
                                            onEnded={() => {
                                                if (
                                                    index === currentSlide
                                                ) {
                                                    nextSlide();
                                                }
                                            }}
                                        />

                                    ) : (

                                        <img
                                            className="hero-media"
                                            src={mediaUrl}
                                            alt={
                                                slide.title ||
                                                "DS Convent School"
                                            }
                                        />

                                    )}

                                </div>
                            );
                        })}


                        {/* Hero Content */}
                        <div className="container">

                            {heroSlides[currentSlide]?.subtitle && (
                                <h6
                                    data-aos="fade-up"
                                    data-aos-delay="50"
                                >
                                    {heroSlides[currentSlide].subtitle}
                                </h6>
                            )}

                            {heroSlides[currentSlide]?.title && (
                                <h2
                                    data-aos="fade-up"
                                    data-aos-delay="100"
                                >
                                    {heroSlides[currentSlide].title}
                                </h2>
                            )}

                            {heroSlides[currentSlide]?.description && (
                                <p
                                    data-aos="fade-up"
                                    data-aos-delay="200"
                                >
                                    {heroSlides[currentSlide].description}
                                </p>
                            )}

                            {heroSlides[currentSlide]?.button_text && (
                                <div
                                    className="d-flex mt-4"
                                    data-aos="fade-up"
                                    data-aos-delay="300"
                                >
                                    <Link
                                        to={
                                            heroSlides[currentSlide]
                                                .button_url || "/admission"
                                        }
                                        className="btn-get-started"
                                    >
                                        {
                                            heroSlides[currentSlide]
                                                .button_text
                                        }
                                    </Link>
                                </div>
                            )}

                        </div>


                        {/* Previous / Next */}
                        {heroSlides.length > 1 && (
                            <>
                                <button
                                    type="button"
                                    className="hero-slider-prev"
                                    onClick={prevSlide}
                                    aria-label="Previous slide"
                                >
                                    <i className="bi bi-chevron-left"></i>
                                </button>

                                <button
                                    type="button"
                                    className="hero-slider-next"
                                    onClick={nextSlide}
                                    aria-label="Next slide"
                                >
                                    <i className="bi bi-chevron-right"></i>
                                </button>


                                {/* Dots */}
                                <div className="hero-slider-dots">

                                    {heroSlides.map((slide, index) => (
                                        <button
                                            key={slide.id}
                                            type="button"
                                            className={
                                                index === currentSlide
                                                    ? "active"
                                                    : ""
                                            }
                                            onClick={() =>
                                                setCurrentSlide(index)
                                            }
                                            aria-label={`Go to slide ${index + 1
                                                }`}
                                        />
                                    ))}

                                </div>
                            </>
                        )}

                    </>
                )}

            </section>


            {/* About Section */}
            <AboutSection />

            {/* Notice Board */}
            <NoticeTicker />

            {/* Counts Section */}
            <CountsSection />

            {/* Why Us Section */}
            <WhyUsSection />

            {/* Courses Section */}
            <CoursesSection />

            {/* Trainers Section */}
            <TrainersSection />

        </main>
    );
}

export default Home;