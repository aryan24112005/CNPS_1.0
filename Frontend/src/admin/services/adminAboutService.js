const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";

const getToken = () => {
    return localStorage.getItem("cms_token");
};

export const getAdminAbout = async () => {
    const response = await fetch(`${API_URL}/about`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to fetch About content."
        );
    }

    return data.data;
};

export const updateAdminAbout = async (
    aboutData,
    mainImageFile = null,
    visionImageFile = null,
    missionImageFile = null,
    valuesImageFile = null
) => {
    const formData = new FormData();

    formData.append("title", aboutData.title || "");
    formData.append("subtitle", aboutData.subtitle || "");
    formData.append("description", aboutData.description || "");

    formData.append(
        "mission_title",
        aboutData.mission_title || ""
    );

    formData.append(
        "mission_description",
        aboutData.mission_description || ""
    );

    formData.append(
        "vision_title",
        aboutData.vision_title || ""
    );

    formData.append(
        "vision_description",
        aboutData.vision_description || ""
    );

    formData.append(
        "values_title",
        aboutData.values_title || ""
    );

    formData.append(
        "values_description",
        aboutData.values_description || ""
    );

    if (mainImageFile) {
        formData.append("image", mainImageFile);
    }

    if (visionImageFile) {
        formData.append("vision_image", visionImageFile);
    }

    if (missionImageFile) {
        formData.append("mission_image", missionImageFile);
    }

    if (valuesImageFile) {
        formData.append("values_image", valuesImageFile);
    }

    const response = await fetch(`${API_URL}/about`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
        body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to update About content."
        );
    }

    return data;
};