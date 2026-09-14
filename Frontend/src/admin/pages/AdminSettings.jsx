import { useEffect, useState } from "react";

import {
    getAdminSettings,
    updateAdminSettings,
} from "../services/adminSettingsService";


const defaultSettings = {
    website_title: "",
    website_tagline: "",

    contact_address: "",
    contact_phone: "",
    contact_email: "",
    office_hours: "",
    map_url: "",

    facebook_url: "",
    instagram_url: "",
    youtube_url: "",
    linkedin_url: "",
    twitter_url: "",

    footer_description: "",
    footer_tagline: "",
    footer_address: "",
    footer_phone: "",
    footer_email: "",
    footer_copyright: "",

    footer_links: [],
};


const tabs = [
    {
        key: "general",
        label: "General",
        icon: "bi bi-globe2",
    },
    {
        key: "contact",
        label: "Contact",
        icon: "bi bi-telephone",
    },
    {
        key: "social",
        label: "Social Media",
        icon: "bi bi-share",
    },
    {
        key: "footer",
        label: "Footer",
        icon: "bi bi-layout-text-window-reverse",
    },
];


const AdminSettings = () => {

    const [settings, setSettings] = useState(
        defaultSettings
    );

    const [activeTab, setActiveTab] =
        useState("general");

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");


    /*
    |--------------------------------------------------------------------------
    | Load Settings
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        loadSettings();
    }, []);


    const loadSettings = async () => {

        try {
            setLoading(true);
            setError("");

            const data =
                await getAdminSettings();

            setSettings({
                ...defaultSettings,
                ...data,

                footer_links:
                    Array.isArray(data?.footer_links)
                        ? data.footer_links
                        : [],
            });

        } catch (err) {

            console.error(
                "Settings Load Error:",
                err
            );

            setError(
                err.message ||
                "Failed to load settings."
            );

        } finally {

            setLoading(false);
        }
    };


    /*
    |--------------------------------------------------------------------------
    | Handle Input Change
    |--------------------------------------------------------------------------
    */

    const handleChange = (event) => {

        const {
            name,
            value,
        } = event.target;

        setSettings((prev) => ({
            ...prev,
            [name]: value,
        }));

        setSuccess("");
        setError("");
    };


    /*
    |--------------------------------------------------------------------------
    | Footer Link Change
    |--------------------------------------------------------------------------
    */

    const handleFooterLinkChange = (
        index,
        field,
        value
    ) => {

        setSettings((prev) => {

            const links = [
                ...prev.footer_links,
            ];

            links[index] = {
                ...links[index],
                [field]: value,
            };

            return {
                ...prev,
                footer_links: links,
            };
        });

        setSuccess("");
        setError("");
    };


    /*
    |--------------------------------------------------------------------------
    | Add Footer Link
    |--------------------------------------------------------------------------
    */

    const addFooterLink = () => {

        setSettings((prev) => ({
            ...prev,

            footer_links: [
                ...prev.footer_links,
                {
                    label: "",
                    url: "",
                },
            ],
        }));
    };


    /*
    |--------------------------------------------------------------------------
    | Remove Footer Link
    |--------------------------------------------------------------------------
    */

    const removeFooterLink = (index) => {

        setSettings((prev) => ({
            ...prev,

            footer_links:
                prev.footer_links.filter(
                    (_, linkIndex) =>
                        linkIndex !== index
                ),
        }));
    };


    /*
    |--------------------------------------------------------------------------
    | Save Settings
    |--------------------------------------------------------------------------
    */

    const handleSubmit = async (event) => {

        event.preventDefault();

        try {

            setSaving(true);
            setError("");
            setSuccess("");

            const response =
                await updateAdminSettings(
                    settings
                );

            if (response?.data) {

                setSettings({
                    ...defaultSettings,
                    ...response.data,

                    footer_links:
                        Array.isArray(
                            response.data.footer_links
                        )
                            ? response.data.footer_links
                            : [],
                });
            }

            setSuccess(
                "Settings updated successfully."
            );

        } catch (err) {

            console.error(
                "Settings Save Error:",
                err
            );

            setError(
                err.message ||
                "Failed to update settings."
            );

        } finally {

            setSaving(false);
        }
    };


    /*
    |--------------------------------------------------------------------------
    | Reusable Input
    |--------------------------------------------------------------------------
    */

    const renderInput = (
        label,
        name,
        type = "text",
        placeholder = "",
        rows = null
    ) => {

        if (rows) {

            return (
                <div className="mb-4">

                    <label className="form-label fw-semibold">
                        {label}
                    </label>

                    <textarea
                        name={name}
                        value={
                            settings[name] || ""
                        }
                        onChange={handleChange}
                        placeholder={placeholder}
                        rows={rows}
                        className="form-control"
                    ></textarea>

                </div>
            );
        }

        return (
            <div className="mb-4">

                <label className="form-label fw-semibold">
                    {label}
                </label>

                <input
                    type={type}
                    name={name}
                    value={
                        settings[name] || ""
                    }
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="form-control"
                />

            </div>
        );
    };


    /*
    |--------------------------------------------------------------------------
    | General Tab
    |--------------------------------------------------------------------------
    */

    const renderGeneralTab = () => (
        <div>

            <div className="mb-4">

                <h5 className="fw-bold mb-1">
                    General Website Settings
                </h5>

                <p className="text-muted mb-0">
                    Manage basic information used throughout the website.
                </p>

            </div>


            {renderInput(
                "Website Title",
                "website_title",
                "text",
                "DS Convent School"
            )}


            {renderInput(
                "Website Tagline",
                "website_tagline",
                "text",
                "Enter website tagline"
            )}

        </div>
    );


    /*
    |--------------------------------------------------------------------------
    | Contact Tab
    |--------------------------------------------------------------------------
    */

    const renderContactTab = () => (
        <div>

            <div className="mb-4">

                <h5 className="fw-bold mb-1">
                    Contact Information
                </h5>

                <p className="text-muted mb-0">
                    This information will be displayed on the Contact page and footer.
                </p>

            </div>


            {renderInput(
                "Address",
                "contact_address",
                "text",
                "Complete school address",
                3
            )}


            {renderInput(
                "Phone",
                "contact_phone",
                "tel",
                "+91 XXXXX XXXXX"
            )}


            {renderInput(
                "Email",
                "contact_email",
                "email",
                "school@example.com"
            )}


            {renderInput(
                "Office Hours",
                "office_hours",
                "text",
                "Monday - Saturday, 8:00 AM - 4:00 PM"
            )}


            {/* Google Maps Embed */}

            <div className="mb-4">

                <label className="form-label fw-semibold">
                    Google Maps Embed URL
                </label>

                <input
                    type="text"
                    name="map_url"
                    value={
                        settings.map_url || ""
                    }
                    onChange={handleChange}
                    placeholder="https://www.google.com/maps/embed?pb=..."
                    className="form-control"
                />

                <div className="form-text mt-2">

                    <i className="bi bi-info-circle me-1"></i>

                    Open Google Maps → select the exact school location
                    → Share → Embed a map → Copy the embed URL
                    and paste it here.

                </div>

                <div className="alert alert-info mt-3 mb-0">

                    <div className="d-flex">

                        <i className="bi bi-map me-2 mt-1"></i>

                        <div>

                            <strong>
                                Exact Location Map
                            </strong>

                            <div className="small mt-1">
                                Use the Google Maps Embed URL instead
                                of a normal Google Maps place URL.
                                This ensures the exact selected location
                                is displayed on the Contact page.
                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );


    /*
    |--------------------------------------------------------------------------
    | Social Media Tab
    |--------------------------------------------------------------------------
    */

    const renderSocialTab = () => (
        <div>

            <div className="mb-4">

                <h5 className="fw-bold mb-1">
                    Social Media
                </h5>

                <p className="text-muted mb-0">
                    Add your official social media profile URLs.
                </p>

            </div>


            {renderInput(
                "Facebook URL",
                "facebook_url",
                "url",
                "https://facebook.com/..."
            )}


            {renderInput(
                "Instagram URL",
                "instagram_url",
                "url",
                "https://instagram.com/..."
            )}


            {renderInput(
                "YouTube URL",
                "youtube_url",
                "url",
                "https://youtube.com/..."
            )}


            {renderInput(
                "LinkedIn URL",
                "linkedin_url",
                "url",
                "https://linkedin.com/..."
            )}


            {renderInput(
                "Twitter / X URL",
                "twitter_url",
                "url",
                "https://x.com/..."
            )}

        </div>
    );


    /*
    |--------------------------------------------------------------------------
    | Footer Tab
    |--------------------------------------------------------------------------
    */

    const renderFooterTab = () => (
        <div>

            <div className="mb-4">

                <h5 className="fw-bold mb-1">
                    Footer Content
                </h5>

                <p className="text-muted mb-0">
                    Manage all editable footer information from here.
                </p>

            </div>


            {renderInput(
                "Footer Description",
                "footer_description",
                "text",
                "Short description about the school",
                4
            )}


            {renderInput(
                "Footer Tagline",
                "footer_tagline",
                "text",
                "Enter footer tagline"
            )}


            {renderInput(
                "Footer Address",
                "footer_address",
                "text",
                "School address",
                3
            )}


            {renderInput(
                "Footer Phone",
                "footer_phone",
                "tel",
                "+91 XXXXX XXXXX"
            )}


            {renderInput(
                "Footer Email",
                "footer_email",
                "email",
                "school@example.com"
            )}


            {renderInput(
                "Copyright Text",
                "footer_copyright",
                "text",
                "© 2026 DS Convent School. All Rights Reserved."
            )}


            {/* Footer Links */}

            <div className="mt-5">

                <div className="d-flex justify-content-between align-items-center mb-3">

                    <div>

                        <h6 className="fw-bold mb-1">
                            Footer Links
                        </h6>

                        <p className="text-muted small mb-0">
                            Add or remove navigation links shown in the footer.
                        </p>

                    </div>


                    <button
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        onClick={addFooterLink}
                    >
                        <i className="bi bi-plus-lg me-1"></i>
                        Add Link
                    </button>

                </div>


                {settings.footer_links.length === 0 ? (

                    <div className="border rounded p-4 text-center text-muted">

                        No footer links added yet.

                    </div>

                ) : (

                    <div className="d-flex flex-column gap-3">

                        {settings.footer_links.map(
                            (link, index) => (

                                <div
                                    key={index}
                                    className="border rounded p-3"
                                >

                                    <div className="row g-3 align-items-end">

                                        <div className="col-md-5">

                                            <label className="form-label fw-semibold">
                                                Link Label
                                            </label>

                                            <input
                                                type="text"
                                                value={
                                                    link.label || ""
                                                }
                                                onChange={(event) =>
                                                    handleFooterLinkChange(
                                                        index,
                                                        "label",
                                                        event.target.value
                                                    )
                                                }
                                                placeholder="About Us"
                                                className="form-control"
                                            />

                                        </div>


                                        <div className="col-md-5">

                                            <label className="form-label fw-semibold">
                                                Link URL
                                            </label>

                                            <input
                                                type="text"
                                                value={
                                                    link.url || ""
                                                }
                                                onChange={(event) =>
                                                    handleFooterLinkChange(
                                                        index,
                                                        "url",
                                                        event.target.value
                                                    )
                                                }
                                                placeholder="/about"
                                                className="form-control"
                                            />

                                        </div>


                                        <div className="col-md-2">

                                            <button
                                                type="button"
                                                className="btn btn-outline-danger w-100"
                                                onClick={() =>
                                                    removeFooterLink(
                                                        index
                                                    )
                                                }
                                            >
                                                <i className="bi bi-trash me-1"></i>
                                                Remove
                                            </button>

                                        </div>

                                    </div>

                                </div>
                            )
                        )}

                    </div>
                )}

            </div>

        </div>
    );


    /*
    |--------------------------------------------------------------------------
    | Loading State
    |--------------------------------------------------------------------------
    */

    if (loading) {

        return (
            <div className="container-fluid py-4">

                <div className="d-flex justify-content-center align-items-center py-5">

                    <div
                        className="spinner-border text-primary"
                        role="status"
                    >
                        <span className="visually-hidden">
                            Loading...
                        </span>
                    </div>

                </div>

            </div>
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Main UI
    |--------------------------------------------------------------------------
    */

    return (
        <div className="container-fluid py-4">

            {/* Header */}

            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">

                <div>

                    <h3 className="fw-bold mb-1">
                        Settings
                    </h3>

                    <p className="text-muted mb-0">
                        Manage website, contact, social media and footer content.
                    </p>

                </div>

            </div>


            {/* Error */}

            {error && (

                <div
                    className="alert alert-danger d-flex align-items-center"
                    role="alert"
                >
                    <i className="bi bi-exclamation-triangle me-2"></i>

                    {error}
                </div>

            )}


            {/* Success */}

            {success && (

                <div
                    className="alert alert-success d-flex align-items-center"
                    role="alert"
                >
                    <i className="bi bi-check-circle me-2"></i>

                    {success}
                </div>

            )}


            {/* Settings Card */}

            <div className="card border-0 shadow-sm">

                <div className="card-body p-0">

                    {/* Tabs */}

                    <div className="border-bottom px-3 px-md-4 pt-3">

                        <ul className="nav nav-tabs border-0">

                            {tabs.map((tab) => (

                                <li
                                    className="nav-item"
                                    key={tab.key}
                                >

                                    <button
                                        type="button"
                                        className={`nav-link ${activeTab === tab.key
                                                ? "active"
                                                : ""
                                            }`}
                                        onClick={() =>
                                            setActiveTab(
                                                tab.key
                                            )
                                        }
                                    >

                                        <i
                                            className={`${tab.icon} me-2`}
                                        ></i>

                                        {tab.label}

                                    </button>

                                </li>

                            ))}

                        </ul>

                    </div>


                    {/* Form */}

                    <form onSubmit={handleSubmit}>

                        <div className="p-3 p-md-4">

                            {activeTab === "general" &&
                                renderGeneralTab()}

                            {activeTab === "contact" &&
                                renderContactTab()}

                            {activeTab === "social" &&
                                renderSocialTab()}

                            {activeTab === "footer" &&
                                renderFooterTab()}

                        </div>


                        {/* Save Bar */}

                        <div className="border-top px-3 px-md-4 py-3 d-flex justify-content-end">

                            <button
                                type="submit"
                                className="btn btn-primary px-4"
                                disabled={saving}
                            >

                                {saving ? (
                                    <>
                                        <span
                                            className="spinner-border spinner-border-sm me-2"
                                            role="status"
                                        ></span>

                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-save me-2"></i>

                                        Save Settings
                                    </>
                                )}

                            </button>

                        </div>

                    </form>

                </div>

            </div>

        </div>
    );
};


export default AdminSettings;