const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";

export const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

const getImageUrl = (path) => {
    if (!path) return null;

    if (
        path.startsWith("http://") ||
        path.startsWith("https://")
    ) {
        return path;
    }

    if (path.startsWith("/assets/")) {
        return path;
    }

    if (path.startsWith("/uploads/")) {
        return `${API_ORIGIN}${path}`;
    }

    return `${API_ORIGIN}/${path}`;
};


export const getPublicCourseImageUrl = (image) => {
    return getImageUrl(image);
};


export const getPublicCourseFileUrl = (file) => {
    return getImageUrl(file);
};


export const getPublicCourses = async () => {
    const response = await fetch(
        `${API_URL}/public/courses`
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to fetch courses."
        );
    }

    return data.courses || [];
};


export const getPublicCourseById = async (id) => {
    const response = await fetch(
        `${API_URL}/public/courses/${encodeURIComponent(id)}`
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to fetch course."
        );
    }

    return data.course;
};