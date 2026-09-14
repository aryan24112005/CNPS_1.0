const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";

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


// ========================================
// GET ALL ADMISSION APPLICATIONS
// ========================================

export const getAdminAdmissions = async () => {
    const response = await fetch(
        `${API_URL}/admission/admin`,
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
            "Failed to fetch admission applications."
        );
    }

    return data.data || [];
};


// ========================================
// GET SINGLE APPLICATION
// ========================================

export const getAdminAdmissionById = async (id) => {
    const response = await fetch(
        `${API_URL}/admission/admin/${id}`,
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
            "Failed to fetch admission application."
        );
    }

    return data.data;
};


// ========================================
// UPDATE STATUS
// ========================================

export const updateAdmissionStatus = async (
    id,
    status
) => {
    const response = await fetch(
        `${API_URL}/admission/admin/${id}/status`,
        {
            method: "PATCH",

            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
            },

            body: JSON.stringify({
                status,
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to update admission status."
        );
    }

    return data;
};


// ========================================
// UPDATE ADMIN NOTES
// ========================================

export const updateAdmissionNotes = async (
    id,
    admin_notes
) => {
    const response = await fetch(
        `${API_URL}/admission/admin/${id}/notes`,
        {
            method: "PATCH",

            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
            },

            body: JSON.stringify({
                admin_notes,
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to update admin notes."
        );
    }

    return data;
};


// ========================================
// DELETE APPLICATION
// ========================================

export const deleteAdmission = async (id) => {
    const response = await fetch(
        `${API_URL}/admission/admin/${id}`,
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
            "Failed to delete admission application."
        );
    }

    return data;
};