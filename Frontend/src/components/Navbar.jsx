import { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";



function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };



    useEffect(() => {
        document.body.classList.toggle(
            "mobile-nav-active",
            mobileMenuOpen
        );

        return () => {
            document.body.classList.remove("mobile-nav-active");
        };
    }, [mobileMenuOpen]);



    return (
        <header
            id="header"
            className={`header d-flex align-items-center sticky-top ${mobileMenuOpen ? "mobile-nav-active" : ""
                }`}
        >
            <div className="container-fluid container-xl position-relative d-flex align-items-center">

                {/* Logo / Website Name */}
                <Link
                    to="/"
                    className="logo d-flex align-items-center me-auto"
                    onClick={closeMobileMenu}
                >
                    <h1 className="sitename">DS CONVENT SCHOOL</h1>
                </Link>

                {/* Navigation */}
                <nav
                    id="navmenu"
                    className={`navmenu ${mobileMenuOpen ? "mobile-nav-active" : ""}`}
                >
                    <ul>

                        <li>
                            <NavLink
                                to="/"
                                className={({ isActive }) => (isActive ? "active" : "")}
                                onClick={closeMobileMenu}
                            >
                                Home
                            </NavLink>
                        </li>

                        <li>
                            <NavLink
                                to="/about"
                                className={({ isActive }) => (isActive ? "active" : "")}
                                onClick={closeMobileMenu}
                            >
                                About
                            </NavLink>
                        </li>

                        <li>
                            <NavLink
                                to="/courses"
                                className={({ isActive }) => (isActive ? "active" : "")}
                                onClick={closeMobileMenu}
                            >
                                Courses
                            </NavLink>
                        </li>

                        <li>
                            <NavLink
                                to="/trainers"
                                className={({ isActive }) => (isActive ? "active" : "")}
                                onClick={closeMobileMenu}
                            >
                                Trainers
                            </NavLink>
                        </li>

                        <li>
                            <NavLink
                                to="/events"
                                className={({ isActive }) => (isActive ? "active" : "")}
                                onClick={closeMobileMenu}
                            >
                                Events
                            </NavLink>
                        </li>

                        {/* <li>
                            <NavLink
                                to="/pricing"
                                className={({ isActive }) => (isActive ? "active" : "")}
                                onClick={closeMobileMenu}
                            >
                                Pricing
                            </NavLink>
                        </li> */}

                        <li>
                            <NavLink
                                to="/contact"
                                className={({ isActive }) => (isActive ? "active" : "")}
                                onClick={closeMobileMenu}
                            >
                                Contact
                            </NavLink>
                        </li>

                        <li>
                            <NavLink
                                to="/login"
                                className={({ isActive }) => (isActive ? "active" : "")}
                                onClick={closeMobileMenu}
                            >
                                Login
                            </NavLink>
                        </li>

                    </ul>

                    {/* Mobile Menu Button */}
                    <button
                        type="button"
                        className={`mobile-menu-toggle ${mobileMenuOpen ? "active" : ""
                            }`}
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                        aria-expanded={mobileMenuOpen}
                    >
                        {mobileMenuOpen ? (
                            <span className="menu-close-icon">×</span>
                        ) : (
                            <>
                                <span></span>
                                <span></span>
                                <span></span>
                            </>
                        )}
                    </button>
                </nav>

                {/* Get Started */}
                <Link
                    className="btn-getstarted"
                    to="/admission"
                    onClick={closeMobileMenu}
                >
                    Get Started
                </Link>

            </div>
        </header>
    );
}

export default Navbar;