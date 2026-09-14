const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");


// Get all public events
export const getPublicEvents = async () => {
    const response = await fetch(`${API_URL}/public/events`);

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to fetch events."
        );
    }

    return data.events || [];
};


// Get single public event by slug
export const getPublicEventBySlug = async (slug) => {
    const response = await fetch(
        `${API_URL}/public/events/${encodeURIComponent(slug)}`
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to fetch event."
        );
    }

    return data.event;
};


// Convert backend image path into browser URL
export const getEventImageUrl = (image) => {
    if (!image) return "";

    if (
        image.startsWith("http://") ||
        image.startsWith("https://")
    ) {
        return image;
    }

    if (image.startsWith("/assets/")) {
        return image;
    }

    if (image.startsWith("/uploads/")) {
        return `${API_ORIGIN}${image}`;
    }

    return `${API_ORIGIN}/${image}`;
};