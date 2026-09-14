const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";

/*
|--------------------------------------------------------------------------
| Get Public Site Settings
|--------------------------------------------------------------------------
*/
export const getPublicSettings = async () => {
    const response = await fetch(`${API_URL}/public/settings`);

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to fetch site settings."
        );
    }

    return data.data;
};