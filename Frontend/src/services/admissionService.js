const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";

/*
|--------------------------------------------------------------------------
| Submit Admission Application
|--------------------------------------------------------------------------
*/

export const submitAdmissionApplication = async (
    formData
) => {
    const response = await fetch(
        `${API_URL}/admission`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to submit admission application."
        );
    }

    return data;
};
