import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import AOS from "aos";
import GLightbox from "glightbox";
import PureCounter from "@srexi/purecounterjs";
import Swiper from "swiper/bundle";

function useTemplateFeatures() {
    const location = useLocation();

    useEffect(() => {
        // ==========================================
        // AOS
        // ==========================================

        AOS.init({
            duration: 600,
            easing: "ease-in-out",
            once: true,
            mirror: false,
        });

        // Make sure dynamically rendered React content is detected
        AOS.refreshHard();


        // ==========================================
        // PureCounter
        // ==========================================

        new PureCounter();


        // ==========================================
        // GLightbox
        // ==========================================

        const lightbox = GLightbox({
            selector: ".glightbox",
            touchNavigation: true,
            keyboardNavigation: true,
            closeButton: true,
            loop: true,
            navigation: true,
        });

        const refreshLightbox = () => {
            lightbox.reload();
        };

        window.addEventListener(
            "why-us-gallery-updated",
            refreshLightbox
        );

        window.addEventListener(
            "event-gallery-updated",
            refreshLightbox
        );


        // ==========================================
        // Swiper
        // ==========================================

        const swiperInstances = [];

        document
            .querySelectorAll(".init-swiper")
            .forEach((swiperElement) => {

                const configElement =
                    swiperElement.querySelector(".swiper-config");

                if (!configElement) return;

                try {
                    const config = JSON.parse(
                        configElement.textContent.trim()
                    );

                    const swiper = new Swiper(
                        swiperElement,
                        config
                    );

                    swiperInstances.push(swiper);

                } catch (error) {
                    console.error(
                        "Swiper initialization failed:",
                        error
                    );
                }
            });


        // ==========================================
        // Refresh AOS after images/content load
        // ==========================================

        const refreshAOS = () => {
            AOS.refreshHard();
        };

        window.addEventListener(
            "load",
            refreshAOS
        );

        window.setTimeout(
            refreshAOS,
            300
        );


        // ==========================================
        // Cleanup
        // ==========================================

        return () => {

            window.removeEventListener(
                "load",
                refreshAOS
            );

            window.removeEventListener(
                "why-us-gallery-updated",
                refreshLightbox
            );

            window.removeEventListener(
                "event-gallery-updated",
                refreshLightbox
            );

            lightbox.destroy();

            swiperInstances.forEach((swiper) => {
                if (
                    swiper &&
                    !swiper.destroyed
                ) {
                    swiper.destroy(
                        true,
                        true
                    );
                }
            });

        };

    }, [location.pathname]);
}

export default useTemplateFeatures;