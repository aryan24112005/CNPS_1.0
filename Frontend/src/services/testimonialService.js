const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

export const getPublicTestimonials = async () => {
    const response = await fetch(`${API_URL}/public/testimonials`);

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to fetch testimonials."
        );
    }

    return data.testimonials || [];
};

export const getPublicTestimonialById = async (id) => {
    const response = await fetch(
        `${API_URL}/public/testimonials/${encodeURIComponent(id)}`
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to fetch testimonial."
        );
    }

    return data.testimonial;
};