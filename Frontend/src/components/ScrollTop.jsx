import { useEffect, useState } from "react";

function ScrollTop() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setVisible(window.scrollY > 100);
        };

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <button
            id="scroll-top"
            className={`scroll-top d-flex align-items-center justify-content-center ${visible ? "active" : ""
                }`}
            onClick={scrollToTop}
            aria-label="Scroll to top"
        >
            <i className="bi bi-arrow-up-short"></i>
        </button>
    );
}

export default ScrollTop;