const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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


// =========================
// EVENTS
// =========================

export const getAdminEvents = async () => {
    const response = await fetch(`${API_URL}/events`, {
        headers: {
            ...getAuthHeaders(),
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to fetch events."
        );
    }

    return data.data || [];
};


export const getAdminEventById = async (id) => {
    const response = await fetch(
        `${API_URL}/events/${id}`,
        {
            headers: {
                ...getAuthHeaders(),
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to fetch event."
        );
    }

    return data.data;
};


export const createEvent = async (eventData) => {
    const response = await fetch(`${API_URL}/events`, {
        method: "POST",

        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },

        body: JSON.stringify(eventData),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to create event."
        );
    }

    return data;
};


export const updateEvent = async (id, eventData) => {
    const response = await fetch(
        `${API_URL}/events/${id}`,
        {
            method: "PUT",

            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
            },

            body: JSON.stringify(eventData),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to update event."
        );
    }

    return data;
};


export const deleteEvent = async (id) => {
    const response = await fetch(
        `${API_URL}/events/${id}`,
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
            data.message || "Failed to delete event."
        );
    }

    return data;
};


// =========================
// EVENT BANNER
// =========================

export const uploadEventBanner = async (
    eventId,
    imageFile
) => {
    const formData = new FormData();

    formData.append("image", imageFile);

    const response = await fetch(
        `${API_URL}/events/${eventId}/image`,
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
            "Failed to upload event banner."
        );
    }

    return data;
};


// =========================
// EVENT GALLERY
// =========================

export const uploadEventGalleryImages = async (
    eventId,
    imageFiles
) => {
    const formData = new FormData();

    imageFiles.forEach((file) => {
        formData.append("images", file);
    });

    const response = await fetch(
        `${API_URL}/events/${eventId}/images`,
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
            "Failed to upload event gallery images."
        );
    }

    return data;
};


export const updateEventGalleryImage = async (
    imageId,
    galleryData
) => {
    const response = await fetch(
        `${API_URL}/events/images/${imageId}`,
        {
            method: "PUT",

            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
            },

            body: JSON.stringify({
                caption:
                    galleryData.caption ?? null,

                sort_order:
                    galleryData.sort_order ?? 0,
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to update gallery image."
        );
    }

    return data;
};


export const deleteEventGalleryImage = async (
    imageId
) => {
    const response = await fetch(
        `${API_URL}/events/images/${imageId}`,
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
            "Failed to delete gallery image."
        );
    }

    return data;
};


// =========================
// IMAGE URL
// =========================

export const API_ORIGIN = API_URL.replace(
    /\/api\/?$/,
    ""
);


export const getAdminEventImageUrl = (image) => {
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