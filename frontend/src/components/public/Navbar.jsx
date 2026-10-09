import { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import cnpsLogo from "../../assets/cnps-logo.png";



const NAV_LINKS = [
  { to: "/", label: "Home", exact: true },
  { to: "/about", label: "About" },
  { to: "/courses", label: "Courses" },
  { to: "/trainers", label: "Trainers" },
  { to: "/events", label: "Events" },
  { to: "/notices", label: "Notices" },
  { to: "/gallery", label: "Gallery" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 860) setMobileOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const close = () => setMobileOpen(false);

  return (
    <>
      <header className="navbar" style={{ boxShadow: scrolled ? "var(--shadow-md)" : "var(--shadow-sm)" }}>
        <div className="container navbar-inner">
          {/* Brand */}
          <Link to="/" className="navbar-brand" onClick={close}>
            <div className="navbar-brand-icon">
              <img src={cnpsLogo} alt="CNPS Logo" />
            </div>
            <div>
              <div className="navbar-brand-name">
                <span>CNPS</span> Public School
              </div>
              <div className="navbar-brand-sub">Quality Education Since Years</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <ul className="navbar-nav">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.exact}
                  className={({ isActive }) => isActive ? "active" : ""}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <div className="navbar-cta" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link
              to="/login"
              className="btn btn-outline btn-sm"
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              <i className="bi bi-person-circle" />
              Login
            </Link>
            <Link to="/admission" className="btn btn-primary btn-sm">
              Apply Now
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="navbar-toggle"
            onClick={() => setMobileOpen((p) => !p)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            <i className={mobileOpen ? "bi bi-x-lg" : "bi bi-list"} />
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      <nav className={`mobile-nav ${mobileOpen ? "open" : ""}`}>
        {NAV_LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.exact}
            className={({ isActive }) => isActive ? "active" : ""}
            onClick={close}
          >
            {link.label}
          </NavLink>
        ))}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
          <Link to="/admission" className="btn btn-primary" onClick={close}>
            Apply for Admission
          </Link>
          <Link
            to="/login"
            className="btn btn-outline"
            onClick={close}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            <i className="bi bi-person-circle" />
            Admin Login
          </Link>
        </div>
      </nav>
    </>
  );
}
