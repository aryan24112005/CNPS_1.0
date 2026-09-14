const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";

// =========================
// AUTH
// =========================

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
// IMAGE URL
// =========================

export const getAdminFacultyImageUrl = (path) => {
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


// =========================
// GET ALL FACULTY
// =========================

export const getAdminFaculty = async () => {
    const response = await fetch(`${API_URL}/faculty`, {
        headers: {
            ...getAuthHeaders(),
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to fetch faculty."
        );
    }

    return data.data || [];
};


// =========================
// GET SINGLE FACULTY
// =========================

export const getAdminFacultyById = async (id) => {
    const response = await fetch(
        `${API_URL}/faculty/${id}`,
        {
            headers: {
                ...getAuthHeaders(),
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to fetch faculty member."
        );
    }

    return data.data;
};


// =========================
// CREATE FACULTY
// =========================

export const createFaculty = async (facultyData) => {
    const response = await fetch(
        `${API_URL}/faculty`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
            },
            body: JSON.stringify(facultyData),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to create faculty member."
        );
    }

    return data;
};


// =========================
// UPDATE FACULTY
// =========================

export const updateFaculty = async (
    id,
    facultyData
) => {
    const response = await fetch(
        `${API_URL}/faculty/${id}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
            },
            body: JSON.stringify(facultyData),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to update faculty member."
        );
    }

    return data;
};


// =========================
// DELETE FACULTY
// =========================

export const deleteFaculty = async (id) => {
    const response = await fetch(
        `${API_URL}/faculty/${id}`,
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
            data.message || "Failed to delete faculty member."
        );
    }

    return data;
};


// =========================
// UPLOAD FACULTY PHOTO
// =========================

export const uploadFacultyPhoto = async (
    id,
    photoFile
) => {
    const formData = new FormData();

    // IMPORTANT:
    // Backend multer expects "photo"
    formData.append("photo", photoFile);

    const response = await fetch(
        `${API_URL}/faculty/${id}/photo`,
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
            "Failed to upload faculty photo."
        );
    }

    return data;
};