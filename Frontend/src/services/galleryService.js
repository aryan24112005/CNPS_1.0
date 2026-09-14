const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";


// ========================================
// API ORIGIN
// ========================================

export const API_ORIGIN =
    API_URL.replace(/\/api\/?$/, "");


// ========================================
// ADMIN TOKEN
// ========================================

const getToken = () => {
    return localStorage.getItem("cms_token");
};


// ========================================
// AUTH HEADERS
// ========================================

const getAuthHeaders = () => {

    const token = getToken();

    return token
        ? {
            Authorization: `Bearer ${token}`,
        }
        : {};
};


// ========================================
// ADMIN - GET ALL GALLERY
// ========================================

export const getAdminGallery = async () => {

    const response = await fetch(
        `${API_URL}/gallery`,
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
            "Failed to fetch gallery."
        );
    }


    return data.data || [];
};


// ========================================
// ADMIN - GET SINGLE IMAGE
// ========================================

export const getAdminGalleryImageById = async (
    id
) => {

    const response = await fetch(
        `${API_URL}/gallery/${id}`,
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
            "Failed to fetch gallery image."
        );
    }


    return data.data;
};


// ========================================
// ADMIN - UPLOAD IMAGES
// ========================================

export const uploadGalleryImages = async ({
    files,
    caption,
    category,
    status,
    sort_order,
}) => {

    const formData = new FormData();


    // -------------------------------
    // FILES
    // -------------------------------

    files.forEach((file) => {
        formData.append("images", file);
    });


    // -------------------------------
    // DATA
    // -------------------------------

    formData.append(
        "caption",
        caption || ""
    );

    formData.append(
        "category",
        category || ""
    );

    formData.append(
        "status",
        status || "active"
    );

    formData.append(
        "sort_order",
        String(sort_order ?? 0)
    );


    // -------------------------------
    // REQUEST
    // -------------------------------

    const response = await fetch(
        `${API_URL}/gallery/images`,
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
            "Failed to upload gallery images."
        );
    }


    return data;
};


// ========================================
// ADMIN - UPDATE IMAGE
// ========================================

export const updateGalleryImage = async (
    id,
    galleryData
) => {

    const response = await fetch(
        `${API_URL}/gallery/${id}`,
        {
            method: "PUT",

            headers: {
                "Content-Type":
                    "application/json",

                ...getAuthHeaders(),
            },

            body: JSON.stringify({
                caption:
                    galleryData.caption ??
                    null,

                category:
                    galleryData.category ??
                    null,

                status:
                    galleryData.status ||
                    "active",

                sort_order:
                    Number(
                        galleryData.sort_order
                    ) || 0,
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


// ========================================
// ADMIN - DELETE IMAGE
// ========================================

export const deleteGalleryImage = async (
    id
) => {

    const response = await fetch(
        `${API_URL}/gallery/${id}`,
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


// ========================================
// PUBLIC - GET GALLERY IMAGES
// ========================================
//
// Used by WhyUsSection
// ========================================

export const getPublicGalleryImages = async () => {
    const response = await fetch(
        `${API_URL}/public/gallery/images`
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to fetch public gallery images."
        );
    }

    return data.data || [];
};


// ========================================
// IMAGE URL
// ========================================

export const getGalleryImageUrl = (
    image
) => {

    if (!image) {
        return "";
    }


    // Already full URL
    if (
        image.startsWith("http://") ||
        image.startsWith("https://")
    ) {
        return image;
    }


    // React public assets
    if (
        image.startsWith("/assets/")
    ) {
        return image;
    }


    // Backend uploads
    if (
        image.startsWith("/uploads/")
    ) {
        return `${API_ORIGIN}${image}`;
    }


    // Backend relative path
    return `${API_ORIGIN}/${image}`;
};


// ========================================
// ADMIN IMAGE URL
// ========================================

export const getAdminGalleryImageUrl = (
    image
) => {
    return getGalleryImageUrl(image);
};
