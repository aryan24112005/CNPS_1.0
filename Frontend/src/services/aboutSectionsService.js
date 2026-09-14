const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";


export const API_ORIGIN =
    API_URL.replace(/\/api\/?$/, "");


/*
 * ==========================================
 * IMAGE URL HELPER
 * ==========================================
 */
export const getAboutSectionImageUrl = (image) => {
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


/*
 * ==========================================
 * GET PUBLIC ABOUT SECTIONS
 * ==========================================
 *
 * Returns:
 *
 * Academic Journey
 * Senior Secondary Education
 * Learning Beyond Classroom
 *
 */
export const getPublicAboutSections = async () => {
    const response = await fetch(
        `${API_URL}/public/about/sections`
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to fetch About sections."
        );
    }

    return data.data || [];
};