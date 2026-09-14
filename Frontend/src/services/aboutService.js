const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";

export const getPublicAbout = async () => {
    const response = await fetch(`${API_URL}/public/about`);

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to fetch about page content."
        );
    }

    return data.data;
};