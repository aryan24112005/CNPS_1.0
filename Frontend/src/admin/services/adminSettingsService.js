const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";

const getToken = () => localStorage.getItem("cms_token");

/*
|--------------------------------------------------------------------------
| Get Admin Settings
|--------------------------------------------------------------------------
*/
export const getAdminSettings = async () => {
    const response = await fetch(`${API_URL}/settings`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to fetch site settings."
        );
    }

    return data.data;
};


/*
|--------------------------------------------------------------------------
| Update Admin Settings
|--------------------------------------------------------------------------
*/
export const updateAdminSettings = async (settingsData) => {
    const response = await fetch(`${API_URL}/settings`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(settingsData),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to update site settings."
        );
    }

    return data;
};