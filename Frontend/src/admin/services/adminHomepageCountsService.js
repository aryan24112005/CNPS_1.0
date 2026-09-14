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


/* ========================================
   GET ALL COUNTS
======================================== */

export const getAdminHomepageCounts = async () => {
    const response = await fetch(
        `${API_URL}/homepage/counts`,
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
            "Failed to fetch homepage counts."
        );
    }

    return data.data || [];
};


/* ========================================
   GET SINGLE COUNT
======================================== */

export const getAdminHomepageCountById = async (id) => {
    const response = await fetch(
        `${API_URL}/homepage/counts/${id}`,
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
            "Failed to fetch homepage count."
        );
    }

    return data.data;
};


/* ========================================
   CREATE COUNT
======================================== */

export const createHomepageCount = async (
    countData
) => {
    const response = await fetch(
        `${API_URL}/homepage/counts`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
            },

            body: JSON.stringify(countData),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to create homepage count."
        );
    }

    return data.data;
};


/* ========================================
   UPDATE COUNT
======================================== */

export const updateHomepageCount = async (
    id,
    countData
) => {
    const response = await fetch(
        `${API_URL}/homepage/counts/${id}`,
        {
            method: "PUT",

            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
            },

            body: JSON.stringify(countData),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to update homepage count."
        );
    }

    return data.data;
};


/* ========================================
   DELETE COUNT
======================================== */

export const deleteHomepageCount = async (id) => {
    const response = await fetch(
        `${API_URL}/homepage/counts/${id}`,
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
            "Failed to delete homepage count."
        );
    }

    return data;
};