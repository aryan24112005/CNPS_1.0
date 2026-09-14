const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";

const getToken = () => {
    return localStorage.getItem("cms_token");
};

const getHeaders = () => {
    const token = getToken();

    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

/*
|--------------------------------------------------------------------------
| Get All Contact Messages
|--------------------------------------------------------------------------
*/

export const getAdminContactMessages = async () => {
    const response = await fetch(
        `${API_URL}/contact/admin`,
        {
            method: "GET",
            headers: getHeaders(),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to fetch contact messages."
        );
    }

    return data.data;
};


/*
|--------------------------------------------------------------------------
| Get Single Contact Message
|--------------------------------------------------------------------------
*/

export const getAdminContactMessage = async (id) => {
    const response = await fetch(
        `${API_URL}/contact/admin/${id}`,
        {
            method: "GET",
            headers: getHeaders(),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to fetch contact message."
        );
    }

    return data.data;
};


/*
|--------------------------------------------------------------------------
| Update Contact Message Status
|--------------------------------------------------------------------------
*/

export const updateAdminContactMessageStatus = async (
    id,
    status
) => {
    const response = await fetch(
        `${API_URL}/contact/admin/${id}/status`,
        {
            method: "PATCH",
            headers: getHeaders(),
            body: JSON.stringify({
                status,
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to update message status."
        );
    }

    return data;
};


/*
|--------------------------------------------------------------------------
| Mark Contact Message As Read
|--------------------------------------------------------------------------
*/

export const markAdminContactMessageAsRead = async (id) => {
    const response = await fetch(
        `${API_URL}/contact/admin/${id}/read`,
        {
            method: "PATCH",
            headers: getHeaders(),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to mark message as read."
        );
    }

    return data;
};


/*
|--------------------------------------------------------------------------
| Delete Contact Message
|--------------------------------------------------------------------------
*/

export const deleteAdminContactMessage = async (id) => {
    const response = await fetch(
        `${API_URL}/contact/admin/${id}`,
        {
            method: "DELETE",
            headers: getHeaders(),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to delete contact message."
        );
    }

    return data;
};