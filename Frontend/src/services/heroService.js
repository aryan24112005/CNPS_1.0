const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

export const getPublicHeroSlides = async () => {
    const response = await fetch(`${API_URL}/public/home/hero`);

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to fetch hero slides.");
    }

    return data.slides || [];
};

export const getHeroMediaUrl = (path) => {
    if (!path) return "";

    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }

    if (path.startsWith("/uploads/")) {
        return `${API_ORIGIN}${path}`;
    }

    return `${API_ORIGIN}/${path}`;
};