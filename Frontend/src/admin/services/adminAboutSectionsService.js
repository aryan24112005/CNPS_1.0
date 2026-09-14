const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";

const getToken = () => {
    return localStorage.getItem("cms_token");
};

// Convert uploaded/public image path into a browser URL
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
        const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");
        return `${API_ORIGIN}${image}`;
    }

    const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");
    return `${API_ORIGIN}/${image}`;
};


// ======================================================
// GET ALL ABOUT SECTIONS
// ======================================================

export const getAdminAboutSections = async () => {
    const response = await fetch(
        `${API_URL}/about/sections`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
        }
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


// ======================================================
// GET SINGLE ABOUT SECTION
// ======================================================

export const getAdminAboutSection = async (id) => {
    const response = await fetch(
        `${API_URL}/about/sections/${id}`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to fetch About section."
        );
    }

    return data.data;
};


// ======================================================
// CREATE ABOUT SECTION
// ======================================================

export const createAdminAboutSection = async (
    sectionData,
    imageFile = null
) => {
    const formData = new FormData();

    formData.append(
        "section_key",
        sectionData.section_key || ""
    );

    formData.append(
        "title",
        sectionData.title || ""
    );

    formData.append(
        "description",
        sectionData.description || ""
    );

    formData.append(
        "sort_order",
        sectionData.sort_order ?? 0
    );

    formData.append(
        "status",
        sectionData.status || "active"
    );

    const bullets = Array.isArray(sectionData.bullets)
        ? sectionData.bullets
        : [];

    formData.append(
        "bullets",
        JSON.stringify(bullets)
    );

    if (imageFile) {
        formData.append("image", imageFile);
    }

    const response = await fetch(
        `${API_URL}/about/sections`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
            body: formData,
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to create About section."
        );
    }

    return data;
};


// ======================================================
// UPDATE ABOUT SECTION
// ======================================================

export const updateAdminAboutSection = async (
    id,
    sectionData,
    imageFile = null
) => {
    const formData = new FormData();

    formData.append(
        "section_key",
        sectionData.section_key || ""
    );

    formData.append(
        "title",
        sectionData.title || ""
    );

    formData.append(
        "description",
        sectionData.description || ""
    );

    formData.append(
        "sort_order",
        sectionData.sort_order ?? 0
    );

    formData.append(
        "status",
        sectionData.status || "active"
    );

    const bullets = Array.isArray(sectionData.bullets)
        ? sectionData.bullets
        : [];

    formData.append(
        "bullets",
        JSON.stringify(bullets)
    );

    if (imageFile) {
        formData.append("image", imageFile);
    }

    const response = await fetch(
        `${API_URL}/about/sections/${id}`,
        {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
            body: formData,
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to update About section."
        );
    }

    return data;
};


// ======================================================
// DELETE ABOUT SECTION
// ======================================================

export const deleteAdminAboutSection = async (id) => {
    const response = await fetch(
        `${API_URL}/about/sections/${id}`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to delete About section."
        );
    }

    return data;
};