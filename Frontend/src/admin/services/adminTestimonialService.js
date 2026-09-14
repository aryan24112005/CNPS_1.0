const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

// ---------------------------------------
// AUTH TOKEN
// ---------------------------------------
const getToken = () => {
    return localStorage.getItem("cms_token");
};

// ---------------------------------------
// AUTH HEADERS
// ---------------------------------------
const getAuthHeaders = () => {
    const token = getToken();

    return {
        Authorization: `Bearer ${token}`,
    };
};

// ---------------------------------------
// AVATAR URL
// ---------------------------------------
export const getAdminTestimonialAvatarUrl = (avatar) => {
    if (!avatar) return "";

    if (
        avatar.startsWith("http://") ||
        avatar.startsWith("https://")
    ) {
        return avatar;
    }

    if (avatar.startsWith("/assets/")) {
        return avatar;
    }

    if (avatar.startsWith("/uploads/")) {
        return `${API_ORIGIN}${avatar}`;
    }

    return `${API_ORIGIN}/${avatar}`;
};

// ---------------------------------------
// GET ALL TESTIMONIALS
// ---------------------------------------
export const getAdminTestimonials = async () => {
    const response = await fetch(`${API_URL}/testimonials`, {
        headers: {
            ...getAuthHeaders(),
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to fetch testimonials."
        );
    }

    return data.testimonials || [];
};

// ---------------------------------------
// GET SINGLE TESTIMONIAL
// ---------------------------------------
export const getAdminTestimonialById = async (id) => {
    const response = await fetch(
        `${API_URL}/testimonials/${id}`,
        {
            headers: {
                ...getAuthHeaders(),
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to fetch testimonial."
        );
    }

    return data.testimonial;
};

// ---------------------------------------
// CREATE TESTIMONIAL
// ---------------------------------------
export const createTestimonial = async (testimonialData) => {
    const response = await fetch(`${API_URL}/testimonials`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
        body: JSON.stringify(testimonialData),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to create testimonial."
        );
    }

    return data.testimonial || data.data || data;
};

// ---------------------------------------
// UPDATE TESTIMONIAL
// ---------------------------------------
export const updateTestimonial = async (
    id,
    testimonialData
) => {
    const response = await fetch(
        `${API_URL}/testimonials/${id}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
            },
            body: JSON.stringify(testimonialData),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to update testimonial."
        );
    }

    return data.testimonial || data.data || data;
};

// ---------------------------------------
// DELETE TESTIMONIAL
// ---------------------------------------
export const deleteTestimonial = async (id) => {
    const response = await fetch(
        `${API_URL}/testimonials/${id}`,
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
            data.message || "Failed to delete testimonial."
        );
    }

    return data;
};

// ---------------------------------------
// UPLOAD AVATAR
// ---------------------------------------
export const uploadTestimonialAvatar = async (
    id,
    file
) => {
    const formData = new FormData();

    formData.append("avatar", file);

    const response = await fetch(
        `${API_URL}/testimonials/${id}/avatar`,
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
            "Failed to upload testimonial avatar."
        );
    }

    return (
        data.testimonial ||
        data.data ||
        data
    );
};