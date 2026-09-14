const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getToken = () => localStorage.getItem("cms_token");

const getAuthHeaders = () => {
    const token = getToken();

    return token
        ? { Authorization: `Bearer ${token}` }
        : {};
};

// ===============================
// GET ALL GALLERY IMAGES
// ===============================
export const getAdminGallery = async () => {
    const response = await fetch(`${API_URL}/gallery`, {
        headers: {
            ...getAuthHeaders(),
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to fetch gallery images."
        );
    }

    return data.data || [];
};

// ===============================
// GET SINGLE GALLERY IMAGE
// ===============================
export const getAdminGalleryImageById = async (id) => {
    const response = await fetch(`${API_URL}/gallery/${id}`, {
        headers: {
            ...getAuthHeaders(),
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to fetch gallery image."
        );
    }

    return data.data;
};

// ===============================
// UPLOAD GALLERY IMAGES
// ===============================
export const uploadGalleryImages = async ({
    files,
    caption = "",
    category = "",
    status = "active",
    sort_order = 0,
}) => {
    const formData = new FormData();

    files.forEach((file) => {
        formData.append("images", file);
    });

    formData.append("caption", caption);
    formData.append("category", category);
    formData.append("status", status);
    formData.append("sort_order", sort_order);

    const response = await fetch(`${API_URL}/gallery/images`, {
        method: "POST",
        headers: {
            ...getAuthHeaders(),
        },
        body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to upload gallery images."
        );
    }

    return data;
};

// ===============================
// UPDATE GALLERY IMAGE
// ===============================
export const updateGalleryImage = async (id, galleryData) => {
    const response = await fetch(`${API_URL}/gallery/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
        body: JSON.stringify({
            caption: galleryData.caption ?? null,
            category: galleryData.category ?? null,
            status: galleryData.status ?? "active",
            sort_order: galleryData.sort_order ?? 0,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to update gallery image."
        );
    }

    return data;
};

// ===============================
// DELETE GALLERY IMAGE
// ===============================
export const deleteGalleryImage = async (id) => {
    const response = await fetch(`${API_URL}/gallery/${id}`, {
        method: "DELETE",
        headers: {
            ...getAuthHeaders(),
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to delete gallery image."
        );
    }

    return data;
};

// ===============================
// IMAGE URL HELPER
// ===============================
export const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

export const getAdminGalleryImageUrl = (image) => {
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