const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const adminLogin = async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email,
            password,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Invalid email or password."
        );
    }

    if (!data.token) {
        throw new Error("Login successful but token was not received.");
    }

    localStorage.setItem("cms_token", data.token);

    if (data.admin) {
        localStorage.setItem(
            "cms_admin",
            JSON.stringify(data.admin)
        );
    }

    return data;
};

export const adminLogout = () => {
    localStorage.removeItem("cms_token");
    localStorage.removeItem("cms_admin");
    localStorage.removeItem("cms_demo_logged_in");
};

export const getAdminToken = () => {
    return localStorage.getItem("cms_token");
};

export const isAdminLoggedIn = () => {
    return Boolean(localStorage.getItem("cms_token"));
};