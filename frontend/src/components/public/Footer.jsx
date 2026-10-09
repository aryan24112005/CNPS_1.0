import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getSiteSettings } from "../../services/publicService";

export default function Footer() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    getSiteSettings().then(setSettings).catch(() => {});
  }, []);

  const s = settings || {};
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Col 1 — About school */}
          <div>
            <div className="footer-brand">
              <div className="footer-brand-icon">
                <i className="bi bi-mortarboard-fill" />
              </div>
              <span className="footer-brand-name">{s.schoolName || "CNPS Public School"}</span>
            </div>
            <p>{s.footerAbout || "Providing quality education and holistic development to students. Building tomorrow's leaders today."}</p>
            <div className="footer-social">
              {s.socialLinks?.facebook  && <a href={s.socialLinks.facebook}  target="_blank" rel="noreferrer" aria-label="Facebook"><i className="bi bi-facebook" /></a>}
              {s.socialLinks?.instagram && <a href={s.socialLinks.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"><i className="bi bi-instagram" /></a>}
              {s.socialLinks?.youtube   && <a href={s.socialLinks.youtube}   target="_blank" rel="noreferrer" aria-label="YouTube"><i className="bi bi-youtube" /></a>}
              {s.socialLinks?.twitter   && <a href={s.socialLinks.twitter}   target="_blank" rel="noreferrer" aria-label="Twitter"><i className="bi bi-twitter-x" /></a>}
              {s.socialLinks?.linkedin  && <a href={s.socialLinks.linkedin}  target="_blank" rel="noreferrer" aria-label="LinkedIn"><i className="bi bi-linkedin" /></a>}
            </div>
          </div>

          {/* Col 2 — Quick links */}
          <div>
            <h4>Quick Links</h4>
            <ul>
              {[
                ["/", "Home"],
                ["/about", "About Us"],
                ["/courses", "Courses"],
                ["/trainers", "Faculty"],
                ["/events", "Events"],
                ["/admission", "Admission"],
              ].map(([to, label]) => (
                <li key={to}><Link to={to}><i className="bi bi-chevron-right" />{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Col 3 — More links */}
          <div>
            <h4>Information</h4>
            <ul>
              {[
                ["/notices", "Notices"],
                ["/gallery", "Gallery"],
                ["/contact", "Contact Us"],
                ["/login", "Admin Login"],
              ].map(([to, label]) => (
                <li key={to}><Link to={to}><i className="bi bi-chevron-right" />{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Contact */}
          <div>
            <h4>Contact Us</h4>
            <ul className="footer-contact">
              {s.address && (
                <li>
                  <i className="bi bi-geo-alt-fill" />
                  <span>{s.address}</span>
                </li>
              )}
              {s.phone && (
                <li>
                  <i className="bi bi-telephone-fill" />
                  <a href={`tel:${s.phone}`} style={{ color: "rgba(255,255,255,0.65)" }}>{s.phone}</a>
                </li>
              )}
              {s.email && (
                <li>
                  <i className="bi bi-envelope-fill" />
                  <a href={`mailto:${s.email}`} style={{ color: "rgba(255,255,255,0.65)" }}>{s.email}</a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <span>
            {s.footerCopyright || `© ${year} ${s.schoolName || "CNPS Public School"}. All rights reserved.`}
          </span>
          <span>
            Designed with <i className="bi bi-heart-fill" style={{ color: "var(--gold)", fontSize: "0.75rem" }} /> for education
          </span>
        </div>
      </div>
    </footer>
  );
}
