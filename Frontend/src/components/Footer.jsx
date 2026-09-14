import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getPublicSettings } from "../services/settingsService";

function Footer() {
    const [settings, setSettings] = useState(null);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const data = await getPublicSettings();
                setSettings(data);
            } catch (error) {
                console.error(
                    "Footer Settings Error:",
                    error
                );
            }
        };

        loadSettings();
    }, []);

    /*
    |--------------------------------------------------------------------------
    | Fallback Values
    |--------------------------------------------------------------------------
    */

    const footerAddress =
        settings?.footer_address ||
        settings?.contact_address ||
        "Pragati Vihar Colony, Gole ka mandir, Gwalior (MP)";

    const footerPhone =
        settings?.footer_phone ||
        settings?.contact_phone ||
        "7974367854";

    const footerEmail =
        settings?.footer_email ||
        settings?.contact_email ||
        "info@example.com";

    const footerDescription =
        settings?.footer_description ||
        "Get the latest updates about school activities, admissions, events, announcements, and important information directly in your inbox.";

    const footerLinks = Array.isArray(
        settings?.footer_links
    )
        ? settings.footer_links
        : [];

    const copyright =
        settings?.footer_copyright ||
        "© 2026 DS Convent School. All Rights Reserved.";

    /*
    |--------------------------------------------------------------------------
    | Social Media Links
    |--------------------------------------------------------------------------
    */

    const socialLinks = [
        {
            key: "twitter_url",
            url: settings?.twitter_url,
            icon: "bi bi-twitter-x",
            label: "Twitter",
        },
        {
            key: "facebook_url",
            url: settings?.facebook_url,
            icon: "bi bi-facebook",
            label: "Facebook",
        },
        {
            key: "instagram_url",
            url: settings?.instagram_url,
            icon: "bi bi-instagram",
            label: "Instagram",
        },
        {
            key: "linkedin_url",
            url: settings?.linkedin_url,
            icon: "bi bi-linkedin",
            label: "LinkedIn",
        },
        {
            key: "youtube_url",
            url: settings?.youtube_url,
            icon: "bi bi-youtube",
            label: "YouTube",
        },
    ];

    return (
        <footer
            id="footer"
            className="footer position-relative light-background"
        >
            <div className="container footer-top">
                <div className="row gy-4">

                    {/* =========================
                        School Information
                    ========================== */}
                    <div className="col-lg-4 col-md-6 footer-about">

                        <Link
                            to="/"
                            className="logo d-flex align-items-center"
                        >
                            <span className="sitename">
                                DSCS
                            </span>
                        </Link>

                        <div className="footer-contact pt-3">

                            {footerAddress
                                .split("\n")
                                .map((line, index) => (
                                    <p key={index}>
                                        {line}
                                    </p>
                                ))}

                            <p className="mt-3">
                                <strong>Phone:</strong>{" "}
                                <span>
                                    {footerPhone}
                                </span>
                            </p>

                            <p>
                                <strong>Email:</strong>{" "}
                                <span>
                                    {footerEmail}
                                </span>
                            </p>

                        </div>

                        {/* Social Media */}
                        <div className="social-links d-flex mt-4">

                            {socialLinks
                                .filter(
                                    (social) =>
                                        social.url &&
                                        social.url.trim() !== ""
                                )
                                .map((social) => (
                                    <a
                                        key={social.key}
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={
                                            social.label
                                        }
                                    >
                                        <i
                                            className={
                                                social.icon
                                            }
                                        ></i>
                                    </a>
                                ))}

                        </div>
                    </div>


                    {/* =========================
                        Useful Links
                    ========================== */}
                    <div className="col-lg-2 col-md-3 footer-links">

                        <h4>
                            Useful Links
                        </h4>

                        <ul>

                            {footerLinks.length > 0 ? (
                                footerLinks
                                    .filter(
                                        (link) =>
                                            link?.label &&
                                            link?.url
                                    )
                                    .map(
                                        (link, index) => {
                                            const isExternal =
                                                /^https?:\/\//i.test(
                                                    link.url
                                                );

                                            return (
                                                <li
                                                    key={`${link.label}-${index}`}
                                                >
                                                    {isExternal ? (
                                                        <a
                                                            href={
                                                                link.url
                                                            }
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            {
                                                                link.label
                                                            }
                                                        </a>
                                                    ) : (
                                                        <Link
                                                            to={
                                                                link.url
                                                            }
                                                        >
                                                            {
                                                                link.label
                                                            }
                                                        </Link>
                                                    )}
                                                </li>
                                            );
                                        }
                                    )
                            ) : (
                                <>
                                    <li>
                                        <Link to="/">
                                            Home
                                        </Link>
                                    </li>

                                    <li>
                                        <Link to="/about">
                                            About Us
                                        </Link>
                                    </li>

                                    <li>
                                        <Link to="/courses">
                                            Courses
                                        </Link>
                                    </li>

                                    <li>
                                        <Link to="/contact">
                                            Contact
                                        </Link>
                                    </li>
                                </>
                            )}

                        </ul>
                    </div>


                    {/* =========================
                        Newsletter
                    ========================== */}
                    <div className="col-lg-4 col-md-12 footer-newsletter">

                        <h4>
                            Stay Connected With Us
                        </h4>

                        <p>
                            {footerDescription}
                        </p>

                        <form
                            action="mailto:jai202408@gmail.com"
                            method="post"
                            encType="text/plain"
                        >
                            <div className="newsletter-form">

                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email address"
                                    required
                                />

                                <input
                                    type="submit"
                                    value="Subscribe"
                                />

                            </div>
                        </form>

                    </div>

                </div>
            </div>


            {/* =========================
                Copyright
            ========================== */}
            <div className="container copyright text-center mt-4">

                <p>
                    {copyright}
                </p>

            </div>

        </footer>
    );
}

export default Footer;