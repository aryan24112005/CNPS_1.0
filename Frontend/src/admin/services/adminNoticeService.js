const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

const getToken = () => {
    return localStorage.getItem("cms_token");
};

const getAuthHeaders = () => {
    const token = getToken();

    return {
        Authorization: `Bearer ${token}`,
    };
};

// ---------------------------------------
// File URL
// ---------------------------------------
export const getAdminNoticeFileUrl = (filePath) => {
    if (!filePath) return "";

    if (
        filePath.startsWith("http://") ||
        filePath.startsWith("https://")
    ) {
        return filePath;
    }

    if (filePath.startsWith("/assets/")) {
        return filePath;
    }

    if (filePath.startsWith("/uploads/")) {
        return `${API_ORIGIN}${filePath}`;
    }

    return `${API_ORIGIN}/${filePath}`;
};

// ---------------------------------------
// Get all notices
// ---------------------------------------
export const getAdminNotices = async () => {
    const response = await fetch(`${API_URL}/notices`, {
        headers: {
            ...getAuthHeaders(),
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to fetch notices."
        );
    }

    return data.notices || [];
};

// ---------------------------------------
// Get single notice
// ---------------------------------------
export const getAdminNoticeById = async (id) => {
    const response = await fetch(`${API_URL}/notices/${id}`, {
        headers: {
            ...getAuthHeaders(),
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to fetch notice."
        );
    }

    return data.notice;
};

// ---------------------------------------
// Create notice
// ---------------------------------------
export const createNotice = async (noticeData) => {
    const response = await fetch(`${API_URL}/notices`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
        body: JSON.stringify(noticeData),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to create notice."
        );
    }

    return data.notice || data.data || data;
};

// ---------------------------------------
// Update notice
// ---------------------------------------
export const updateNotice = async (id, noticeData) => {
    const response = await fetch(`${API_URL}/notices/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
        body: JSON.stringify(noticeData),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to update notice."
        );
    }

    return data.notice || data.data || data;
};

// ---------------------------------------
// Delete notice
// ---------------------------------------
export const deleteNotice = async (id) => {
    const response = await fetch(`${API_URL}/notices/${id}`, {
        method: "DELETE",
        headers: {
            ...getAuthHeaders(),
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to delete notice."
        );
    }

    return data;
};

// ---------------------------------------
// Upload Notice Image / PDF
// ---------------------------------------
export const uploadNoticeFile = async (id, file) => {
    const formData = new FormData();

    formData.append("file", file);

    const response = await fetch(
        `${API_URL}/notices/${id}/file`,
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
            data.message || "Failed to upload notice file."
        );
    }

    return data.notice || data.data || data;
};