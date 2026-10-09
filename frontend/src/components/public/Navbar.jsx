import { useState, useEffect, useCallback } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import cnpsLogo from "../../assets/cnps-logo.png";

const NAV_LINKS = [
  { to: "/",         label: "Home",     exact: true },
  { to: "/about",    label: "About"    },
  { to: "/courses",  label: "Courses"  },
  { to: "/trainers", label: "Trainers" },
  { to: "/events",   label: "Events"   },
  { to: "/notices",  label: "Notices"  },
  { to: "/gallery",  label: "Gallery"  },
  { to: "/contact",  label: "Contact"  },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled,   setScrolled]   = useState(false);
  const location = useLocation();

  /* ── Scrolled shadow ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Auto-close on resize to desktop ── */
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 1100) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* ── Auto-close on route change ── */
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  /* ── Escape key closes menu ── */
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e) => { if (e.key === "Escape") setMobileOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  /* ── Lock body scroll when menu open ── */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const close = useCallback(() => setMobileOpen(false), []);
  const toggle = useCallback(() => setMobileOpen((p) => !p), []);

  return (
    <>
      {/* ── Navbar bar ── */}
      <header
        className="navbar"
        style={{ boxShadow: scrolled ? "var(--shadow-md)" : "var(--shadow-sm)" }}
      >
        <div className="navbar-inner">

          {/* Brand — logo + school name */}
          <Link to="/" className="navbar-brand" onClick={close}>
            <div className="navbar-brand-icon">
              <img src={cnpsLogo} alt="CNPS Logo" />
            </div>
            <div className="navbar-brand-text">
              <div className="navbar-brand-name">
                <span>CNPS</span> Public School
              </div>
              <div className="navbar-brand-sub">Quality Education Since Years</div>
            </div>
          </Link>

          {/* Desktop nav links — hidden below 1100px */}
          <ul className="navbar-nav" role="menubar" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <li key={link.to} role="none">
                <NavLink
                  to={link.to}
                  end={link.exact}
                  role="menuitem"
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Desktop CTA — hidden below 1100px */}
          <div className="navbar-cta">
            <Link
              to="/login"
              className="btn btn-outline btn-sm"
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <i className="bi bi-person-circle" aria-hidden="true" />
              Login
            </Link>
            <Link to="/admission" className="btn btn-primary btn-sm">
              Apply Now
            </Link>
          </div>

          {/* Hamburger — visible below 1100px */}
          <button
            className="navbar-toggle"
            onClick={toggle}
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-haspopup="true"
          >
            <i className={mobileOpen ? "bi bi-x-lg" : "bi bi-list"} aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* ── Backdrop overlay ── */}
      {mobileOpen && (
        <div
          onClick={close}
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 489,
            background: "rgba(16,42,67,0.45)",
            backdropFilter: "blur(2px)",
            WebkitBackdropFilter: "blur(2px)",
          }}
        />
      )}

      {/* ── Mobile navigation panel ── */}
      <nav
        id="mobile-nav"
        className={`mobile-nav${mobileOpen ? " open" : ""}`}
        aria-label="Mobile navigation"
        aria-hidden={!mobileOpen}
      >
        {NAV_LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.exact}
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={close}
          >
            {link.label}
          </NavLink>
        ))}

        {/* CTA buttons at the bottom of the mobile menu */}
        <div className="mobile-nav-cta">
          <Link
            to="/admission"
            className="btn btn-primary"
            onClick={close}
          >
            <i className="bi bi-pencil-square" aria-hidden="true" />
            Apply for Admission
          </Link>
          <Link
            to="/login"
            className="btn btn-outline"
            onClick={close}
          >
            <i className="bi bi-person-circle" aria-hidden="true" />
            Admin Login
          </Link>
        </div>
      </nav>
    </>
  );
}
