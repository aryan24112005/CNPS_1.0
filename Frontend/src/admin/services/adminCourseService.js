const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";

export const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

const getToken = () => {
    return localStorage.getItem("cms_token");
};

const getAuthHeaders = () => {
    const token = getToken();

    return {
        Authorization: `Bearer ${token}`,
    };
};


// ===============================
// GET ALL COURSES
// ===============================

export const getAdminCourses = async () => {
    const response = await fetch(`${API_URL}/courses`, {
        headers: {
            ...getAuthHeaders(),
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to fetch courses."
        );
    }

    return data.data || [];
};


// ===============================
// GET SINGLE COURSE
// ===============================

export const getAdminCourseById = async (id) => {
    const response = await fetch(
        `${API_URL}/courses/${id}`,
        {
            headers: {
                ...getAuthHeaders(),
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to fetch course."
        );
    }

    return data.data;
};


// ===============================
// CREATE COURSE
// ===============================

export const createCourse = async (courseData) => {
    const response = await fetch(
        `${API_URL}/courses`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
            },
            body: JSON.stringify(courseData),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to create course."
        );
    }

    return data;
};


// ===============================
// UPDATE COURSE
// ===============================

export const updateCourse = async (
    id,
    courseData
) => {
    const response = await fetch(
        `${API_URL}/courses/${id}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
            },
            body: JSON.stringify(courseData),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to update course."
        );
    }

    return data;
};


// ===============================
// DELETE COURSE
// ===============================

export const deleteCourse = async (id) => {
    const response = await fetch(
        `${API_URL}/courses/${id}`,
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
            data.message || "Failed to delete course."
        );
    }

    return data;
};


// ===============================
// UPLOAD COURSE FILES
// ===============================

export const uploadCourseFiles = async (
    id,
    files
) => {
    const formData = new FormData();

    if (files.image) {
        formData.append("image", files.image);
    }

    if (files.fee_pdf) {
        formData.append("fee_pdf", files.fee_pdf);
    }

    if (files.timetable_pdf) {
        formData.append(
            "timetable_pdf",
            files.timetable_pdf
        );
    }

    const response = await fetch(
        `${API_URL}/courses/${id}/files`,
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
            "Failed to upload course files."
        );
    }

    return data;
};


// ===============================
// FILE URL
// ===============================

export const getCourseFileUrl = (file) => {
    if (!file) return null;

    if (
        file.startsWith("http://") ||
        file.startsWith("https://")
    ) {
        return file;
    }

    if (file.startsWith("/assets/")) {
        return file;
    }

    if (file.startsWith("/uploads/")) {
        return `${API_ORIGIN}${file}`;
    }

    return `${API_ORIGIN}/${file}`;
};

export const uploadCourseBookImage = async (courseId, bookId, file) => {
    const formData = new FormData();

    formData.append("image", file);

    const response = await fetch(
        `${API_URL}/courses/${courseId}/books/${bookId}/image`,
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
            data.message || "Failed to upload book image."
        );
    }

    return data;
};