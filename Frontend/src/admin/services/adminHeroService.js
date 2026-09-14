const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";

/* ----------------------------------------
   Auth
----------------------------------------- */

const getToken = () => {
    return localStorage.getItem("cms_token");
};

const getAuthHeaders = () => {
    const token = getToken();

    return token
        ? {
            Authorization: `Bearer ${token}`,
        }
        : {};
};

/* ----------------------------------------
   Media URL
----------------------------------------- */

export const getAdminHeroMediaUrl = (path) => {
    if (!path) return "";

    if (
        path.startsWith("http://") ||
        path.startsWith("https://")
    ) {
        return path;
    }

    const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

    if (path.startsWith("/uploads/")) {
        return `${API_ORIGIN}${path}`;
    }

    return `${API_ORIGIN}/${path}`;
};

/* ----------------------------------------
   GET ALL HERO SLIDES
----------------------------------------- */

export const getAdminHeroSlides = async () => {
    const response = await fetch(`${API_URL}/home/hero`, {
        headers: {
            ...getAuthHeaders(),
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to fetch hero slides."
        );
    }

    return data.data || [];
};

/* ----------------------------------------
   GET SINGLE HERO SLIDE
----------------------------------------- */

export const getAdminHeroSlideById = async (id) => {
    const response = await fetch(
        `${API_URL}/home/hero/${id}`,
        {
            headers: {
                ...getAuthHeaders(),
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to fetch hero slide."
        );
    }

    return data.data;
};

/* ----------------------------------------
   CREATE HERO SLIDE
----------------------------------------- */

export const createHeroSlide = async (
    slideData,
    mediaFile
) => {
    const formData = new FormData();

    formData.append(
        "title",
        slideData.title || ""
    );

    formData.append(
        "subtitle",
        slideData.subtitle || ""
    );

    formData.append(
        "description",
        slideData.description || ""
    );

    formData.append(
        "button_text",
        slideData.button_text || ""
    );

    formData.append(
        "button_url",
        slideData.button_url || ""
    );

    formData.append(
        "status",
        slideData.status || "active"
    );

    formData.append(
        "sort_order",
        slideData.sort_order ?? 0
    );

    if (mediaFile) {
        formData.append("media", mediaFile);
    }

    const response = await fetch(
        `${API_URL}/home/hero`,
        {
            method: "POST",
            headers: {
                ...getAuthHeaders(),
            },
            body: formData,
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to create hero slide."
        );
    }

    return data;
};

/* ----------------------------------------
   UPDATE HERO SLIDE
----------------------------------------- */

export const updateHeroSlide = async (
    id,
    slideData,
    mediaFile
) => {
    const formData = new FormData();

    formData.append(
        "title",
        slideData.title || ""
    );

    formData.append(
        "subtitle",
        slideData.subtitle || ""
    );

    formData.append(
        "description",
        slideData.description || ""
    );

    formData.append(
        "button_text",
        slideData.button_text || ""
    );

    formData.append(
        "button_url",
        slideData.button_url || ""
    );

    formData.append(
        "status",
        slideData.status || "active"
    );

    formData.append(
        "sort_order",
        slideData.sort_order ?? 0
    );

    if (mediaFile) {
        formData.append("media", mediaFile);
    }

    const response = await fetch(
        `${API_URL}/home/hero/${id}`,
        {
            method: "PUT",
            headers: {
                ...getAuthHeaders(),
            },
            body: formData,
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to update hero slide."
        );
    }

    return data;
};

/* ----------------------------------------
   DELETE HERO SLIDE
----------------------------------------- */

export const deleteHeroSlide = async (id) => {
    const response = await fetch(
        `${API_URL}/home/hero/${id}`,
        {
            method: "DELETE",
            headers: {
                ...getAuthHeaders(),
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to delete hero slide."
        );
    }

    return data;
};