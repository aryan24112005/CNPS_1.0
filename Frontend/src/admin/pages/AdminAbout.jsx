import { useEffect, useMemo, useState } from "react";

import {
    getAdminAbout,
    updateAdminAbout,
} from "../services/adminAboutService";

import {
    getAdminAboutSections,
    createAdminAboutSection,
    updateAdminAboutSection,
} from "../services/adminAboutSectionsService";

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";

const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");


/* =========================================================
   TAB CONFIGURATION
========================================================= */

const TABS = [
    {
        key: "about",
        label: "About Us",
        icon: "bi-info-circle",
        type: "core",
    },
    {
        key: "vision",
        label: "Our Vision",
        icon: "bi-eye",
        type: "core",
    },
    {
        key: "mission",
        label: "Our Mission",
        icon: "bi-bullseye",
        type: "core",
    },
    {
        key: "values",
        label: "Our Values",
        icon: "bi-stars",
        type: "core",
    },
    {
        key: "academic_journey",
        label: "Academic Journey",
        icon: "bi-mortarboard",
        type: "additional",
    },
    {
        key: "senior_secondary",
        label: "Senior Secondary",
        icon: "bi-book",
        type: "additional",
    },
    {
        key: "learning_beyond",
        label: "Learning Beyond",
        icon: "bi-lightbulb",
        type: "additional",
    },
];


/* =========================================================
   FALLBACK IMAGES
========================================================= */

const FALLBACK_IMAGES = {
    about: "/assets/img/hero-bg.png",
    vision: "/assets/img/primary.png",
    mission: "/assets/img/middle.png",
    values: "/assets/img/secondary.png",
    academic_journey: "/assets/img/secondary.png",
    senior_secondary: "/assets/img/pcm1.png",
    learning_beyond: "/assets/img/lkg.png",
};


/* =========================================================
   IMAGE URL HELPER
========================================================= */

const getImageUrl = (image) => {
    if (!image) return "";

    if (
        image.startsWith("http://") ||
        image.startsWith("https://")
    ) {
        return image;
    }

    if (image.startsWith("/assets/")) {
        return image;
    }

    if (image.startsWith("/uploads/")) {
        return `${API_ORIGIN}${image}`;
    }

    return `${API_ORIGIN}/${image}`;
};


/* =========================================================
   BULLET NORMALIZER
========================================================= */

const normalizeBullets = (bullets) => {
    if (!bullets) return [];

    if (Array.isArray(bullets)) {
        return bullets;
    }

    if (typeof bullets === "string") {
        try {
            const parsed = JSON.parse(bullets);

            if (Array.isArray(parsed)) {
                return parsed;
            }
        } catch {
            // Continue below
        }

        return bullets
            .split("\n")
            .map((item) =>
                item
                    .replace(/^[-•]\s*/, "")
                    .trim()
            )
            .filter(Boolean);
    }

    return [];
};


/* =========================================================
   EMPTY ADDITIONAL SECTION
========================================================= */

const getEmptyAdditionalSection = (key) => ({
    section_key: key,
    title: "",
    description: "",
    image: "",
    bullets: [""],
    sort_order:
        TABS.findIndex((tab) => tab.key === key) + 1,
    status: "active",
});


/* =========================================================
   COMPONENT
========================================================= */

function AdminAbout() {
    /* -------------------------------------------------------
       GENERAL STATE
    ------------------------------------------------------- */

    const [activeTab, setActiveTab] = useState("about");

    const [about, setAbout] = useState({
        title: "",
        subtitle: "",
        description: "",

        vision_title: "",
        vision_description: "",

        mission_title: "",
        mission_description: "",

        values_title: "",
        values_description: "",

        image: "",
        vision_image: "",
        mission_image: "",
        values_image: "",
    });

    const [sections, setSections] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");


    /* -------------------------------------------------------
       IMAGE STATE
    ------------------------------------------------------- */

    const [selectedImage, setSelectedImage] =
        useState(null);

    const [previewImage, setPreviewImage] =
        useState("");


    /* -------------------------------------------------------
       LOAD DATA
    ------------------------------------------------------- */

    useEffect(() => {
        loadData();
    }, []);


    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const [aboutData, sectionData] =
                await Promise.all([
                    getAdminAbout(),
                    getAdminAboutSections(),
                ]);

            setAbout({
                title: aboutData?.title || "",
                subtitle: aboutData?.subtitle || "",
                description:
                    aboutData?.description || "",

                vision_title:
                    aboutData?.vision_title || "",
                vision_description:
                    aboutData?.vision_description || "",

                mission_title:
                    aboutData?.mission_title || "",
                mission_description:
                    aboutData?.mission_description || "",

                values_title:
                    aboutData?.values_title || "",
                values_description:
                    aboutData?.values_description || "",

                image: aboutData?.image || "",
                vision_image:
                    aboutData?.vision_image || "",
                mission_image:
                    aboutData?.mission_image || "",
                values_image:
                    aboutData?.values_image || "",
            });

            setSections(sectionData || []);
        } catch (err) {
            console.error(
                "Load About Error:",
                err
            );

            setError(
                err.message ||
                "Failed to load About content."
            );
        } finally {
            setLoading(false);
        }
    };


    /* -------------------------------------------------------
       CURRENT TAB
    ------------------------------------------------------- */

    const currentTab = useMemo(() => {
        return (
            TABS.find(
                (tab) => tab.key === activeTab
            ) || TABS[0]
        );
    }, [activeTab]);


    /* -------------------------------------------------------
       CURRENT ADDITIONAL SECTION
    ------------------------------------------------------- */

    const currentAdditionalSection =
        useMemo(() => {
            if (currentTab.type !== "additional") {
                return null;
            }

            const existing = sections.find(
                (section) =>
                    section.section_key ===
                    currentTab.key
            );

            return (
                existing ||
                getEmptyAdditionalSection(
                    currentTab.key
                )
            );
        }, [
            sections,
            currentTab,
        ]);


    /* -------------------------------------------------------
       CORE FIELD CHANGE
    ------------------------------------------------------- */

    const handleCoreChange = (e) => {
        const { name, value } = e.target;

        setAbout((prev) => ({
            ...prev,
            [name]: value,
        }));
    };


    /* -------------------------------------------------------
       ADDITIONAL SECTION CHANGE
    ------------------------------------------------------- */

    const handleAdditionalChange = (
        e
    ) => {
        const { name, value } = e.target;

        setSections((prev) => {
            const exists = prev.some(
                (section) =>
                    section.section_key ===
                    activeTab
            );

            if (!exists) {
                return [
                    ...prev,
                    {
                        ...getEmptyAdditionalSection(
                            activeTab
                        ),
                        [name]: value,
                    },
                ];
            }

            return prev.map((section) =>
                section.section_key ===
                    activeTab
                    ? {
                        ...section,
                        [name]: value,
                    }
                    : section
            );
        });
    };


    /* -------------------------------------------------------
       BULLET CHANGE
    ------------------------------------------------------- */

    const handleBulletChange = (
        index,
        value
    ) => {
        setSections((prev) => {
            const existingIndex =
                prev.findIndex(
                    (section) =>
                        section.section_key ===
                        activeTab
                );

            if (existingIndex === -1) {
                const newSection =
                    getEmptyAdditionalSection(
                        activeTab
                    );

                newSection.bullets = [value];

                return [
                    ...prev,
                    newSection,
                ];
            }

            return prev.map(
                (section, sectionIndex) => {
                    if (
                        sectionIndex !==
                        existingIndex
                    ) {
                        return section;
                    }

                    const bullets =
                        normalizeBullets(
                            section.bullets
                        );

                    bullets[index] = value;

                    return {
                        ...section,
                        bullets,
                    };
                }
            );
        });
    };


    /* -------------------------------------------------------
       ADD BULLET
    ------------------------------------------------------- */

    const addBullet = () => {
        setSections((prev) => {
            const existingIndex =
                prev.findIndex(
                    (section) =>
                        section.section_key ===
                        activeTab
                );

            if (existingIndex === -1) {
                return [
                    ...prev,
                    {
                        ...getEmptyAdditionalSection(
                            activeTab
                        ),
                        bullets: ["", ""],
                    },
                ];
            }

            return prev.map(
                (section, index) => {
                    if (
                        index !==
                        existingIndex
                    ) {
                        return section;
                    }

                    return {
                        ...section,
                        bullets: [
                            ...normalizeBullets(
                                section.bullets
                            ),
                            "",
                        ],
                    };
                }
            );
        });
    };


    /* -------------------------------------------------------
       REMOVE BULLET
    ------------------------------------------------------- */

    const removeBullet = (index) => {
        setSections((prev) => {
            return prev.map((section) => {
                if (
                    section.section_key !==
                    activeTab
                ) {
                    return section;
                }

                const bullets =
                    normalizeBullets(
                        section.bullets
                    ).filter(
                        (_, i) => i !== index
                    );

                return {
                    ...section,
                    bullets:
                        bullets.length > 0
                            ? bullets
                            : [""],
                };
            });
        });
    };


    /* -------------------------------------------------------
       IMAGE SELECT
    ------------------------------------------------------- */

    const handleImageChange = (e) => {
        const file =
            e.target.files?.[0];

        if (!file) return;

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (
            !allowedTypes.includes(
                file.type
            )
        ) {
            setError(
                "Only JPG, PNG and WEBP images are allowed."
            );

            e.target.value = "";
            return;
        }

        if (
            file.size >
            20 * 1024 * 1024
        ) {
            setError(
                "Image size must be less than 20MB."
            );

            e.target.value = "";
            return;
        }

        setError("");

        setSelectedImage(file);

        const preview =
            URL.createObjectURL(file);

        setPreviewImage(preview);
    };


    /* -------------------------------------------------------
       SAVE CORE SECTION
    ------------------------------------------------------- */

    const saveCoreSection = async () => {
        await updateAdminAbout(
            about,
            activeTab === "about"
                ? selectedImage
                : null,
            activeTab === "vision"
                ? selectedImage
                : null,
            activeTab === "mission"
                ? selectedImage
                : null,
            activeTab === "values"
                ? selectedImage
                : null
        );
    };


    /* -------------------------------------------------------
       SAVE ADDITIONAL SECTION
    ------------------------------------------------------- */

    const saveAdditionalSection =
        async () => {
            const section =
                currentAdditionalSection ||
                getEmptyAdditionalSection(
                    activeTab
                );

            const cleanedBullets =
                normalizeBullets(
                    section.bullets
                )
                    .map((bullet) =>
                        String(bullet).trim()
                    )
                    .filter(Boolean);

            const payload = {
                ...section,
                section_key: activeTab,
                title:
                    section.title || "",
                description:
                    section.description || "",
                bullets:
                    cleanedBullets,
                sort_order:
                    Number(
                        section.sort_order ||
                        0
                    ),
                status:
                    section.status ||
                    "active",
            };

            if (section.id) {
                await updateAdminAboutSection(
                    section.id,
                    payload,
                    selectedImage
                );
            } else {
                await createAdminAboutSection(
                    payload,
                    selectedImage
                );
            }
        };


    /* -------------------------------------------------------
       MAIN SAVE
    ------------------------------------------------------- */

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setMessage("");
            setError("");

            if (
                currentTab.type ===
                "core"
            ) {
                await saveCoreSection();
            } else {
                await saveAdditionalSection();
            }

            setMessage(
                `${currentTab.label} updated successfully.`
            );

            setSelectedImage(null);
            setPreviewImage("");

            await loadData();
        } catch (err) {
            console.error(
                "Save About Error:",
                err
            );

            setError(
                err.message ||
                "Failed to save About section."
            );
        } finally {
            setSaving(false);
        }
    };


    /* -------------------------------------------------------
       TAB CHANGE
    ------------------------------------------------------- */

    const handleTabChange = (key) => {
        if (saving) return;

        setActiveTab(key);

        setSelectedImage(null);
        setPreviewImage("");

        setMessage("");
        setError("");
    };


    /* -------------------------------------------------------
       CURRENT IMAGE
    ------------------------------------------------------- */

    const getCurrentImage = () => {
        if (previewImage) {
            return previewImage;
        }

        if (currentTab.type === "core") {
            const imageMap = {
                about: about.image,
                vision: about.vision_image,
                mission:
                    about.mission_image,
                values:
                    about.values_image,
            };

            return (
                getImageUrl(
                    imageMap[activeTab]
                ) ||
                FALLBACK_IMAGES[activeTab]
            );
        }

        return (
            getImageUrl(
                currentAdditionalSection?.image
            ) ||
            FALLBACK_IMAGES[activeTab]
        );
    };


    /* -------------------------------------------------------
       LOADING
    ------------------------------------------------------- */

    if (loading) {
        return (
            <div className="admin-page">
                <div className="text-center py-5">
                    <div
                        className="spinner-border"
                        role="status"
                    >
                        <span className="visually-hidden">
                            Loading...
                        </span>
                    </div>

                    <p className="mt-3 mb-0">
                        Loading About content...
                    </p>
                </div>
            </div>
        );
    }


    /* -------------------------------------------------------
       ADDITIONAL DATA
    ------------------------------------------------------- */

    const additionalSection =
        currentAdditionalSection ||
        getEmptyAdditionalSection(
            activeTab
        );

    const bullets =
        normalizeBullets(
            additionalSection.bullets
        );

    /* -------------------------------------------------------
       RENDER
    ------------------------------------------------------- */

    return (
        <div className="admin-page">

            {/* =================================================
                PAGE HEADER
            ================================================== */}

            <div className="mb-4">
                <h3 className="mb-1">
                    About Page
                </h3>

                <p className="text-muted mb-0">
                    Manage all About page
                    sections from one place.
                </p>
            </div>


            {/* =================================================
                ALERTS
            ================================================== */}

            {message && (
                <div
                    className="alert alert-success alert-dismissible fade show"
                    role="alert"
                >
                    <i className="bi bi-check-circle me-2"></i>

                    {message}

                    <button
                        type="button"
                        className="btn-close"
                        onClick={() =>
                            setMessage("")
                        }
                    ></button>
                </div>
            )}

            {error && (
                <div
                    className="alert alert-danger alert-dismissible fade show"
                    role="alert"
                >
                    <i className="bi bi-exclamation-triangle me-2"></i>

                    {error}

                    <button
                        type="button"
                        className="btn-close"
                        onClick={() =>
                            setError("")
                        }
                    ></button>
                </div>
            )}


            {/* =================================================
                TABS
            ================================================== */}

            <div className="card shadow-sm border-0 mb-4">

                <div className="card-body p-2">

                    <div
                        className="nav nav-pills flex-wrap gap-2"
                        role="tablist"
                    >
                        {TABS.map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                className={`btn ${activeTab ===
                                        tab.key
                                        ? "btn-primary"
                                        : "btn-light"
                                    }`}
                                onClick={() =>
                                    handleTabChange(
                                        tab.key
                                    )
                                }
                            >
                                <i
                                    className={`bi ${tab.icon} me-2`}
                                ></i>

                                {tab.label}
                            </button>
                        ))}
                    </div>

                </div>

            </div>


            {/* =================================================
                SECTION INFORMATION
            ================================================== */}

            <form
                onSubmit={handleSubmit}
            >

                <div className="card shadow-sm border-0">

                    <div className="card-header bg-white py-3">

                        <div className="d-flex align-items-center justify-content-between">

                            <div>
                                <h5 className="mb-1">

                                    <i
                                        className={`bi ${currentTab.icon} me-2`}
                                    ></i>

                                    {currentTab.label}

                                </h5>

                                <small className="text-muted">
                                    Edit content for this
                                    section.
                                </small>
                            </div>

                            <span className="badge bg-light text-dark border">
                                Key: {currentTab.key}
                            </span>

                        </div>

                    </div>


                    <div className="card-body p-4">


                        {/* =================================================
                            CORE SECTIONS
                        ================================================== */}

                        {currentTab.type ===
                            "core" && (
                                <>
                                    {/* TITLE */}

                                    <div className="mb-4">

                                        <label className="form-label fw-semibold">
                                            Title
                                        </label>

                                        <input
                                            type="text"
                                            className="form-control"
                                            name={
                                                activeTab ===
                                                    "about"
                                                    ? "title"
                                                    : `${activeTab}_title`
                                            }
                                            value={
                                                activeTab ===
                                                    "about"
                                                    ? about.title
                                                    : about[
                                                    `${activeTab}_title`
                                                    ] ||
                                                    ""
                                            }
                                            onChange={
                                                handleCoreChange
                                            }
                                            placeholder={`Enter ${currentTab.label} title`}
                                            required
                                        />

                                    </div>


                                    {/* SUBTITLE - ABOUT ONLY */}

                                    {activeTab ===
                                        "about" && (
                                            <div className="mb-4">

                                                <label className="form-label fw-semibold">
                                                    Subtitle
                                                </label>

                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="subtitle"
                                                    value={
                                                        about.subtitle
                                                    }
                                                    onChange={
                                                        handleCoreChange
                                                    }
                                                    placeholder="Enter About subtitle"
                                                />

                                            </div>
                                        )}


                                    {/* DESCRIPTION */}

                                    <div className="mb-4">

                                        <label className="form-label fw-semibold">
                                            Description
                                        </label>

                                        <textarea
                                            className="form-control"
                                            name={
                                                activeTab ===
                                                    "about"
                                                    ? "description"
                                                    : `${activeTab}_description`
                                            }
                                            rows="7"
                                            value={
                                                activeTab ===
                                                    "about"
                                                    ? about.description
                                                    : about[
                                                    `${activeTab}_description`
                                                    ] ||
                                                    ""
                                            }
                                            onChange={
                                                handleCoreChange
                                            }
                                            placeholder={`Enter ${currentTab.label} description`}
                                        ></textarea>

                                        <div className="form-text">
                                            You can use
                                            separate lines
                                            for separate
                                            paragraphs.
                                        </div>

                                    </div>
                                </>
                            )}


                        {/* =================================================
                            ADDITIONAL SECTIONS
                        ================================================== */}

                        {currentTab.type ===
                            "additional" && (
                                <>
                                    {/* TITLE */}

                                    <div className="mb-4">

                                        <label className="form-label fw-semibold">
                                            Section Title
                                        </label>

                                        <input
                                            type="text"
                                            className="form-control"
                                            name="title"
                                            value={
                                                additionalSection.title ||
                                                ""
                                            }
                                            onChange={
                                                handleAdditionalChange
                                            }
                                            placeholder={`Enter ${currentTab.label} title`}
                                            required
                                        />

                                    </div>


                                    {/* DESCRIPTION */}

                                    <div className="mb-4">

                                        <label className="form-label fw-semibold">
                                            Description
                                        </label>

                                        <textarea
                                            className="form-control"
                                            name="description"
                                            rows="7"
                                            value={
                                                additionalSection.description ||
                                                ""
                                            }
                                            onChange={
                                                handleAdditionalChange
                                            }
                                            placeholder={`Enter ${currentTab.label} description`}
                                        ></textarea>

                                    </div>


                                    {/* BULLETS */}

                                    <div className="mb-4">

                                        <div className="d-flex justify-content-between align-items-center mb-2">

                                            <label className="form-label fw-semibold mb-0">
                                                Bullet Points
                                            </label>

                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={
                                                    addBullet
                                                }
                                            >
                                                <i className="bi bi-plus-lg me-1"></i>
                                                Add Bullet
                                            </button>

                                        </div>


                                        {bullets.map(
                                            (
                                                bullet,
                                                index
                                            ) => (
                                                <div
                                                    className="input-group mb-2"
                                                    key={
                                                        index
                                                    }
                                                >

                                                    <span className="input-group-text">
                                                        <i className="bi bi-check-circle"></i>
                                                    </span>

                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={
                                                            bullet
                                                        }
                                                        onChange={(
                                                            e
                                                        ) =>
                                                            handleBulletChange(
                                                                index,
                                                                e
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                        placeholder={`Bullet point ${index + 1}`}
                                                    />

                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-danger"
                                                        onClick={() =>
                                                            removeBullet(
                                                                index
                                                            )
                                                        }
                                                    >
                                                        <i className="bi bi-trash"></i>
                                                    </button>

                                                </div>
                                            )
                                        )}

                                    </div>
                                </>
                            )}


                        {/* =================================================
                            IMAGE SECTION
                        ================================================== */}

                        <div className="border rounded-3 p-3">

                            <div className="row g-4 align-items-start">

                                {/* PREVIEW */}

                                <div className="col-lg-6">

                                    <label className="form-label fw-semibold">
                                        Image Preview
                                    </label>

                                    <div
                                        className="border rounded overflow-hidden bg-light d-flex align-items-center justify-content-center"
                                        style={{
                                            minHeight:
                                                "280px",
                                        }}
                                    >

                                        {getCurrentImage() ? (
                                            <img
                                                src={getCurrentImage()}
                                                alt={
                                                    currentTab.label
                                                }
                                                style={{
                                                    width: "100%",
                                                    height: "280px",
                                                    objectFit:
                                                        "cover",
                                                }}
                                            />
                                        ) : (
                                            <div className="text-center text-muted">
                                                <i
                                                    className="bi bi-image"
                                                    style={{
                                                        fontSize:
                                                            "55px",
                                                    }}
                                                ></i>

                                                <p className="mb-0 mt-2">
                                                    No image
                                                    available
                                                </p>
                                            </div>
                                        )}

                                    </div>

                                    {previewImage && (
                                        <small className="text-success d-block mt-2">
                                            <i className="bi bi-check-circle me-1"></i>
                                            New image selected
                                        </small>
                                    )}

                                </div>


                                {/* UPLOAD */}

                                <div className="col-lg-6">

                                    <label className="form-label fw-semibold">
                                        Upload Image
                                    </label>

                                    <input
                                        type="file"
                                        className="form-control"
                                        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                                        onChange={
                                            handleImageChange
                                        }
                                        disabled={
                                            saving
                                        }
                                    />

                                    <div className="form-text">
                                        JPG, PNG or
                                        WEBP. Maximum
                                        size: 20MB.
                                    </div>


                                    {selectedImage && (
                                        <div className="border rounded p-3 mt-3">

                                            <div className="d-flex justify-content-between align-items-center">

                                                <div className="text-truncate">

                                                    <strong>
                                                        {
                                                            selectedImage.name
                                                        }
                                                    </strong>

                                                    <small className="text-muted d-block">
                                                        {(
                                                            selectedImage.size /
                                                            1024 /
                                                            1024
                                                        ).toFixed(
                                                            2
                                                        )}{" "}
                                                        MB
                                                    </small>

                                                </div>

                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => {
                                                        setSelectedImage(
                                                            null
                                                        );
                                                        setPreviewImage(
                                                            ""
                                                        );
                                                    }}
                                                    disabled={
                                                        saving
                                                    }
                                                >
                                                    <i className="bi bi-x-lg"></i>
                                                </button>

                                            </div>

                                        </div>
                                    )}

                                </div>

                            </div>

                        </div>


                        {/* =================================================
                            STATUS - ADDITIONAL ONLY
                        ================================================== */}

                        {currentTab.type ===
                            "additional" && (
                                <div className="row g-3 mt-1">

                                    <div className="col-md-6">

                                        <label className="form-label fw-semibold">
                                            Status
                                        </label>

                                        <select
                                            className="form-select"
                                            name="status"
                                            value={
                                                additionalSection.status ||
                                                "active"
                                            }
                                            onChange={
                                                handleAdditionalChange
                                            }
                                        >
                                            <option value="active">
                                                Active
                                            </option>

                                            <option value="inactive">
                                                Inactive
                                            </option>
                                        </select>

                                    </div>


                                    <div className="col-md-6">

                                        <label className="form-label fw-semibold">
                                            Sort Order
                                        </label>

                                        <input
                                            type="number"
                                            className="form-control"
                                            name="sort_order"
                                            value={
                                                additionalSection.sort_order ??
                                                0
                                            }
                                            onChange={
                                                handleAdditionalChange
                                            }
                                            min="0"
                                        />

                                    </div>

                                </div>
                            )}

                    </div>


                    {/* =================================================
                        FOOTER
                    ================================================== */}

                    <div className="card-footer bg-white d-flex justify-content-between align-items-center py-3">

                        <small className="text-muted">
                            Changes will be reflected on
                            the public About page.
                        </small>

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

                                    Save Changes
                                </>
                            )}

                        </button>

                    </div>

                </div>

            </form>

        </div>
    );
}

export default AdminAbout;