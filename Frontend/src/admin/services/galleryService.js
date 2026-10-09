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
    title = "",
    description = "",
    category = "",
    status = "active",
    sort_order = 0,
}) => {
    const formData = new FormData();

    files.forEach((file) => {
        formData.append("images", file);
    });

    formData.append("title", title);
    formData.append("description", description);
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
            title: galleryData.title ?? null,
            description: galleryData.description ?? null,
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

// ===============================
// ALBUMS
// ===============================

export const getAdminAlbums = async () => {
    const response = await fetch(`${API_URL}/gallery/albums`, {
        headers: { ...getAuthHeaders() },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to fetch albums.");
    return data.data || [];
};

export const createAdminAlbum = async (albumData) => {
    const response = await fetch(`${API_URL}/gallery/albums`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(albumData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to create album.");
    return data;
};

export const updateAdminAlbum = async (id, albumData) => {
    const response = await fetch(`${API_URL}/gallery/albums/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(albumData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to update album.");
    return data;
};

export const deleteAdminAlbum = async (id) => {
    const response = await fetch(`${API_URL}/gallery/albums/${id}`, {
        method: "DELETE",
        headers: { ...getAuthHeaders() },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to delete album.");
    return data;
};

export const getAdminAlbumImages = async (albumId) => {
    const response = await fetch(`${API_URL}/gallery/albums/${albumId}/images`, {
        headers: { ...getAuthHeaders() },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to fetch album images.");
    return data.data || [];
};

export const uploadAlbumImages = async (albumId, files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));

    const response = await fetch(`${API_URL}/gallery/albums/${albumId}/images`, {
        method: "POST",
        headers: { ...getAuthHeaders() },
        body: formData,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to upload album images.");
    return data;
};

export const deleteAdminAlbumImage = async (imageId) => {
    const response = await fetch(`${API_URL}/gallery/albums/images/${imageId}`, {
        method: "DELETE",
        headers: { ...getAuthHeaders() },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to delete image.");
    return data;
};
