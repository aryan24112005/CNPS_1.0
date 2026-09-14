const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";

export const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

const getImageUrl = (path) => {
    if (!path) return "";

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


// =========================
// PUBLIC FACULTY
// =========================

export const getPublicFaculty = async () => {
    const response = await fetch(
        `${API_URL}/public/faculty`
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to fetch faculty."
        );
    }

    return data.faculty || [];
};


export const getPublicFacultyById = async (id) => {
    const response = await fetch(
        `${API_URL}/public/faculty/${encodeURIComponent(id)}`
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to fetch faculty member."
        );
    }

    return data.faculty;
};


// =========================
// IMAGE URL
// =========================

export const getPublicFacultyImageUrl = (photo) => {
    return getImageUrl(photo);
};