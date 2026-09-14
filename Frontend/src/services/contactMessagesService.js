const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";

const getToken = () => localStorage.getItem("cms_token");


/*
|--------------------------------------------------------------------------
| PUBLIC - Send Contact Message
|--------------------------------------------------------------------------
*/
export const sendContactMessage = async (messageData) => {
    const response = await fetch(
        `${API_URL}/contact-messages`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: messageData.name?.trim() || "",
                email: messageData.email?.trim() || "",
                subject: messageData.subject?.trim() || "",
                message: messageData.message?.trim() || "",
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to send your message."
        );
    }

    return data;
};


/*
|--------------------------------------------------------------------------
| ADMIN - Get All Messages
|--------------------------------------------------------------------------
*/
export const getAdminContactMessages = async () => {
    const response = await fetch(
        `${API_URL}/contact-messages/admin`,
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
            data.message || "Failed to fetch contact messages."
        );
    }

    return data.data || [];
};


/*
|--------------------------------------------------------------------------
| ADMIN - Get Single Message
|--------------------------------------------------------------------------
*/
export const getAdminContactMessage = async (id) => {
    const response = await fetch(
        `${API_URL}/contact-messages/admin/${id}`,
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
            data.message || "Failed to fetch contact message."
        );
    }

    return data.data;
};


/*
|--------------------------------------------------------------------------
| ADMIN - Update Message Status
|--------------------------------------------------------------------------
*/
export const updateContactMessageStatus = async (
    id,
    status
) => {
    const response = await fetch(
        `${API_URL}/contact-messages/admin/${id}/status`,
        {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${getToken()}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                status,
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to update message status."
        );
    }

    return data;
};


/*
|--------------------------------------------------------------------------
| ADMIN - Mark Message As Read
|--------------------------------------------------------------------------
*/
export const markContactMessageAsRead = async (id) => {
    const response = await fetch(
        `${API_URL}/contact-messages/admin/${id}/read`,
        {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to mark message as read."
        );
    }

    return data;
};


/*
|--------------------------------------------------------------------------
| ADMIN - Delete Message
|--------------------------------------------------------------------------
*/
export const deleteContactMessage = async (id) => {
    const response = await fetch(
        `${API_URL}/contact-messages/admin/${id}`,
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
            data.message || "Failed to delete contact message."
        );
    }

    return data;
};