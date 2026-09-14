const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";


// Get all active public notices
export const getPublicNotices = async () => {
    const response = await fetch(`${API_URL}/public/notices`);

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to fetch notices."
        );
    }

    return data.notices || [];
};


// Get single notice by slug
export const getPublicNoticeBySlug = async (slug) => {
    const response = await fetch(
        `${API_URL}/public/notices/${encodeURIComponent(slug)}`
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to fetch notice."
        );
    }

    return data.notice;
};