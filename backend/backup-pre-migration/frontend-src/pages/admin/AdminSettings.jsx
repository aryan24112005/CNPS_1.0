import { useEffect, useState, useCallback, useRef } from "react";
import {
  getSettings,
  updateSettings,
  uploadLogo,
  uploadFavicon,
  uploadAboutImage,
  deleteAboutImage,
} from "../../services/adminService";

/* ─────────────────────────────────────────────────────────────
   Shared small components
───────────────────────────────────────────────────────────── */
const Toast = ({ toasts }) => (
  <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 10, pointerEvents: "none" }}>
    {toasts.map((t) => (
      <div key={t.id} style={{
        padding: "12px 20px", borderRadius: 10, pointerEvents: "auto",
        background: t.type === "error" ? "#FEE2E2" : "#DCFCE7",
        color: t.type === "error" ? "#991B1B" : "#166534",
        border: `1px solid ${t.type === "error" ? "#FCA5A5" : "#86EFAC"}`,
        boxShadow: "0 4px 16px rgba(0,0,0,0.12)", fontSize: "0.9rem", fontWeight: 500,
        display: "flex", alignItems: "center", gap: 8, minWidth: 280,
      }}>
        <i className={`bi ${t.type === "error" ? "bi-x-circle-fill" : "bi-check-circle-fill"}`} />
        {t.message}
      </div>
    ))}
  </div>
);

const Field = ({ label, children }) => (
  <div style={{ marginBottom: 20 }}>
    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 7 }}>
      {label}
    </label>
    {children}
  </div>
);

const iStyle = {
  width: "100%", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 8,
  fontSize: "0.92rem", color: "var(--navy)", background: "#fff", outline: "none",
  fontFamily: "inherit", transition: "border-color 0.2s", boxSizing: "border-box",
};

const TextInput = ({ value, onChange, placeholder, type = "text" }) => (
  <input type={type} value={value ?? ""} onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder ?? ""} style={iStyle}
    onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
    onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
);

const TextAreaInput = ({ value, onChange, placeholder, rows = 4 }) => (
  <textarea value={value ?? ""} onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder ?? ""} rows={rows} style={{ ...iStyle, resize: "vertical" }}
    onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
    onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
);

function SectionTitle({ icon, title, subtitle }) {
  return (
    <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid var(--border)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 38, height: 38, borderRadius: 9, background: "var(--bg-soft-blue)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <i className={`bi ${icon}`} style={{ color: "var(--primary)", fontSize: "1rem" }} />
        </div>
        <div>
          <h4 style={{ margin: 0, fontSize: "1.05rem", color: "var(--navy)" }}>{title}</h4>
          {subtitle && <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)" }}>{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

function SaveButton({ onClick, saving }) {
  return (
    <div style={{ borderTop: "1px solid var(--border)", paddingTop: 20, marginTop: 8, display: "flex", justifyContent: "flex-end" }}>
      <button onClick={onClick} disabled={saving} style={{
        padding: "11px 28px", background: saving ? "var(--bg-section)" : "var(--primary)",
        color: saving ? "var(--text-muted)" : "#fff", border: "none", borderRadius: 8,
        cursor: saving ? "default" : "pointer", fontWeight: 700, fontSize: "0.95rem",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        {saving ? <><i className="bi bi-arrow-repeat" />Saving…</> : <><i className="bi bi-check-circle-fill" />Save Changes</>}
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Image Upload + Preview + Remove field
   Used for: Logo, Favicon, About images
───────────────────────────────────────────────────────────── */
function ImageField({ label, currentUrl, onUpload, onRemove, uploading, hint }) {
  const fileRef = useRef(null);
  const [confirmRemove, setConfirmRemove] = useState(false);

  return (
    <Field label={label}>
      {currentUrl ? (
        /* Image exists — show preview + Replace + Remove */
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
          <div style={{
            width: 110, height: 88, borderRadius: 10, border: "1px solid var(--border)",
            overflow: "hidden", background: "var(--bg-section)", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <img src={currentUrl} alt={label}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
              onError={(e) => { e.target.style.display = "none"; }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); e.target.value = ""; }} />
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
              style={{ padding: "7px 14px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: 7, cursor: uploading ? "default" : "pointer", fontSize: "0.83rem", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
              {uploading ? <><i className="bi bi-arrow-repeat" />Uploading…</> : <><i className="bi bi-arrow-repeat" />Replace</>}
            </button>
            {onRemove && !confirmRemove && (
              <button type="button" onClick={() => setConfirmRemove(true)}
                style={{ padding: "7px 14px", background: "#FEE2E2", color: "#DC2626", border: "none", borderRadius: 7, cursor: "pointer", fontSize: "0.83rem", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                <i className="bi bi-trash" />Remove
              </button>
            )}
            {confirmRemove && (
              <div style={{ display: "flex", gap: 6 }}>
                <button type="button" onClick={() => { onRemove(); setConfirmRemove(false); }}
                  style={{ padding: "6px 12px", background: "#DC2626", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontSize: "0.8rem", fontWeight: 700 }}>
                  Yes, Remove
                </button>
                <button type="button" onClick={() => setConfirmRemove(false)}
                  style={{ padding: "6px 12px", background: "var(--bg-section)", color: "var(--navy)", border: "1px solid var(--border)", borderRadius: 7, cursor: "pointer", fontSize: "0.8rem" }}>
                  Cancel
                </button>
              </div>
            )}
            {hint && <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0 }}>{hint}</p>}
          </div>
        </div>
      ) : (
        /* No image — show upload dropzone */
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 110, height: 88, borderRadius: 10, border: "2px dashed var(--border)",
            background: "var(--bg-section)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <i className="bi bi-image" style={{ fontSize: "2rem", color: "var(--border)" }} />
          </div>
          <div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); e.target.value = ""; }} />
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
              style={{ padding: "8px 16px", background: uploading ? "var(--bg-section)" : "var(--primary)", color: uploading ? "var(--text-muted)" : "#fff", border: "none", borderRadius: 8, cursor: uploading ? "default" : "pointer", fontSize: "0.85rem", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
              {uploading ? <><i className="bi bi-arrow-repeat" />Uploading…</> : <><i className="bi bi-upload" />Upload Image</>}
            </button>
            {hint && <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 6, marginBottom: 0 }}>{hint}</p>}
          </div>
        </div>
      )}
    </Field>
  );
}

/* ─────────────────────────────────────────────────────────────
   Add button for About gallery (uploads to /api/settings/about-image/new)
───────────────────────────────────────────────────────────── */
function AboutGalleryAddButton({ onAdded, addToast }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handle = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append("image", file);
        const res = await uploadAboutImage("new", fd);
        const url = res?.data?.url || res?.url || "";
        const index = res?.data?.index ?? -1;
        if (url) onAdded(url, index);
      }
      addToast(`${files.length} image(s) added`);
    } catch (err) {
      addToast(err?.response?.data?.message || "Upload failed", "error");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div>
      <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handle} />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        style={{
          padding: "7px 14px", background: "var(--primary)", color: "#fff", border: "none",
          borderRadius: 7, cursor: uploading ? "default" : "pointer",
          fontSize: "0.83rem", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6,
        }}
      >
        {uploading
          ? <><i className="bi bi-arrow-repeat" />Uploading…</>
          : <><i className="bi bi-plus-lg" />Add Image(s)</>
        }
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Tabs config
───────────────────────────────────────────────────────────── */
const TABS = [
  { id: "school",  label: "School Info",    icon: "bi-building" },
  { id: "contact", label: "Contact",        icon: "bi-telephone" },
  { id: "social",  label: "Social Links",   icon: "bi-share" },
  { id: "about",   label: "About Page",     icon: "bi-file-text" },
];

/* ─────────────────────────────────────────────────────────────
   Map API fields → UI state and back.
   Backend model fields:  phone, phone2, mapEmbedUrl, socialLinks.{facebook|instagram|...}
   UI state fields:        phone, phone2, mapEmbedUrl, facebook, instagram, youtube, twitter, linkedin
───────────────────────────────────────────────────────────── */
function apiToUi(data) {
  if (!data) return {};
  return {
    schoolName:       data.schoolName       || "",
    tagline:          data.tagline          || "",
    // logo/favicon are objects {url, publicId} — extract url for display
    logoUrl:          data.logo?.url        || data.logoUrl    || "",
    faviconUrl:       data.favicon?.url     || data.faviconUrl || "",
    principalName:    data.principalName    || "",
    principalMessage: data.principalMessage || "",
    footerAbout:      data.footerAbout      || "",
    footerCopyright:  data.footerCopyright  || "",
    address:          data.address          || "",
    phone:            data.phone            || "",
    phone2:           data.phone2           || "",
    email:            data.email            || "",
    mapEmbedUrl:      data.mapEmbedUrl      || "",
    facebook:         data.socialLinks?.facebook  || "",
    instagram:        data.socialLinks?.instagram || "",
    youtube:          data.socialLinks?.youtube   || "",
    twitter:          data.socialLinks?.twitter   || "",
    linkedin:         data.socialLinks?.linkedin  || "",
    aboutHeading:     data.aboutHeading     || "",
    aboutDescription: data.aboutDescription || "",
    aboutMission:     data.aboutMission     || "",
    aboutVision:      data.aboutVision      || "",
    aboutValues:      data.aboutValues      || "",
    aboutImage1:      data.aboutImage1?.url || data.aboutImage1 || "",
    aboutImage2:      data.aboutImage2?.url || data.aboutImage2 || "",
    aboutImage3:      data.aboutImage3?.url || data.aboutImage3 || "",
    // Extended gallery array (supersedes aboutImage1/2/3 when present)
    aboutImages:      Array.isArray(data.aboutImages) ? data.aboutImages : [],
  };
}

function uiToApi(ui) {
  return {
    schoolName:       ui.schoolName,
    tagline:          ui.tagline,
    address:          ui.address,
    phone:            ui.phone,
    phone2:           ui.phone2,
    email:            ui.email,
    mapEmbedUrl:      ui.mapEmbedUrl,
    principalName:    ui.principalName,
    principalMessage: ui.principalMessage,
    footerAbout:      ui.footerAbout,
    footerCopyright:  ui.footerCopyright,
    aboutHeading:     ui.aboutHeading,
    aboutDescription: ui.aboutDescription,
    aboutMission:     ui.aboutMission,
    aboutVision:      ui.aboutVision,
    aboutValues:      ui.aboutValues,
    socialLinks: {
      facebook:  ui.facebook,
      instagram: ui.instagram,
      youtube:   ui.youtube,
      twitter:   ui.twitter,
      linkedin:  ui.linkedin,
    },
  };
}

/* ─────────────────────────────────────────────────────────────
   Main Component
───────────────────────────────────────────────────────────── */
export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("school");
  const [settings,  setSettings]  = useState({});
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [saving,    setSaving]    = useState(false);
  const [uploading, setUploading] = useState({});
  const [toasts,    setToasts]    = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  }, []);

  /* Load */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getSettings();
        if (!cancelled) setSettings(apiToUi(data));
      } catch {
        if (!cancelled) setError("Failed to load settings. Please refresh the page.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const set = (key) => (value) => setSettings((p) => ({ ...p, [key]: value }));

  /* Save */
  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(uiToApi(settings));
      addToast("Settings saved successfully!");
    } catch {
      addToast("Failed to save settings. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  /* Logo upload — backend multer expects field "image" */
  const handleLogoUpload = async (file) => {
    setUploading((p) => ({ ...p, logo: true }));
    try {
      const fd = new FormData();
      fd.append("image", file);          // ← correct field name for backend
      const res = await uploadLogo(fd);
      const url = res?.data?.url || res?.url || "";
      if (url) setSettings((p) => ({ ...p, logoUrl: url }));
      addToast("Logo uploaded!");
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to upload logo.", "error");
    } finally {
      setUploading((p) => ({ ...p, logo: false }));
    }
  };

  /* Favicon upload — dedicated endpoint, field "image" */
  const handleFaviconUpload = async (file) => {
    setUploading((p) => ({ ...p, favicon: true }));
    try {
      const fd = new FormData();
      fd.append("image", file);          // ← correct field name for backend
      const res = await uploadFavicon(fd);
      const url = res?.data?.url || res?.url || "";
      if (url) setSettings((p) => ({ ...p, faviconUrl: url }));
      addToast("Favicon uploaded!");
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to upload favicon.", "error");
    } finally {
      setUploading((p) => ({ ...p, favicon: false }));
    }
  };

  /* About image upload — field "image" */
  const handleAboutImageUpload = async (field, file) => {
    setUploading((p) => ({ ...p, [field]: true }));
    try {
      const fd = new FormData();
      fd.append("image", file);          // ← correct field name
      const res = await uploadAboutImage(field, fd);
      const url = res?.data?.url || res?.url || "";
      if (url) setSettings((p) => ({ ...p, [field]: url }));
      addToast("Image uploaded!");
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to upload image.", "error");
    } finally {
      setUploading((p) => ({ ...p, [field]: false }));
    }
  };

  /* About image remove */
  const handleAboutImageRemove = async (field) => {
    try {
      await deleteAboutImage(field);
      setSettings((p) => ({ ...p, [field]: "" }));
      addToast("Image removed.");
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to remove image.", "error");
    }
  };

  /* States */
  if (loading) return <div className="loading-state" style={{ padding: "80px 20px" }}><div className="spinner" /><span>Loading settings…</span></div>;
  if (error)   return <div className="alert alert-error" style={{ maxWidth: 560, margin: "40px auto" }}><i className="bi bi-exclamation-circle-fill" />{error}</div>;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--navy)", margin: 0 }}>Website Settings</h2>
        <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", marginTop: 4, marginBottom: 0 }}>
          Manage your school's branding, contact details, and page content
        </p>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 4, borderBottom: "2px solid var(--border)", marginBottom: 28, overflowX: "auto" }}>
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding: "10px 18px", border: "none", background: "none", cursor: "pointer",
            borderBottom: `3px solid ${activeTab === tab.id ? "var(--primary)" : "transparent"}`,
            fontWeight: activeTab === tab.id ? 700 : 500, fontSize: "0.9rem",
            color: activeTab === tab.id ? "var(--primary)" : "var(--text-secondary)",
            display: "flex", alignItems: "center", gap: 7, whiteSpace: "nowrap",
            marginBottom: -2, outline: "none",
          }}>
            <i className={`bi ${tab.icon}`} />{tab.label}
          </button>
        ))}
      </div>

      {/* Card */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--border)", padding: "28px 32px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", maxWidth: 800 }}>

        {/* ── Tab 1: School Info ─────────────────────────── */}
        {activeTab === "school" && (
          <div>
            <SectionTitle icon="bi-building" title="School Information" subtitle="Identity, logo, and branding" />
            <Field label="School Name"><TextInput value={settings.schoolName} onChange={set("schoolName")} placeholder="CNPS Public School" /></Field>
            <Field label="Tagline / Motto"><TextInput value={settings.tagline} onChange={set("tagline")} placeholder="e.g. Educating Hearts and Minds" /></Field>

            {/* <ImageField
              label="School Logo"
              currentUrl={settings.logoUrl}
              onUpload={handleLogoUpload}
              uploading={uploading.logo}
              hint="PNG, JPG, WebP accepted. Transparent PNG recommended."
            />
            <ImageField
              label="Favicon (browser tab icon)"
              currentUrl={settings.faviconUrl}
              onUpload={handleFaviconUpload}
              uploading={uploading.favicon}
              hint="PNG (32×32 or 64×64 px) recommended."
            /> */}

            <Field label="Principal's Name"><TextInput value={settings.principalName} onChange={set("principalName")} placeholder="e.g. Mr. Rajesh Kumar" /></Field>
            <Field label="Principal's Message">
              <TextAreaInput value={settings.principalMessage} onChange={set("principalMessage")} placeholder="A brief message from the principal…" rows={5} />
            </Field>
            <Field label="Footer — About Text">
              <TextAreaInput value={settings.footerAbout} onChange={set("footerAbout")} placeholder="Short description in the website footer…" rows={3} />
            </Field>
            <Field label="Footer — Copyright Text">
              <TextInput value={settings.footerCopyright} onChange={set("footerCopyright")} placeholder={`© ${new Date().getFullYear()} CNPS Public School. All rights reserved.`} />
            </Field>
            <SaveButton onClick={handleSave} saving={saving} />
          </div>
        )}

        {/* ── Tab 2: Contact ─────────────────────────────── */}
        {activeTab === "contact" && (
          <div>
            <SectionTitle icon="bi-telephone" title="Contact Information" subtitle="Details shown to visitors on the Contact page" />
            <Field label="School Address">
              <TextAreaInput value={settings.address} onChange={set("address")} placeholder="e.g. 123 School Road, City, State - 400001" rows={3} />
            </Field>
            <div className="modal-form-grid" style={{ gap: "0 24px" }}>
              <Field label="Primary Phone Number"><TextInput value={settings.phone} onChange={set("phone")} placeholder="+91 98765 43210" type="tel" /></Field>
              <Field label="Secondary Phone Number"><TextInput value={settings.phone2} onChange={set("phone2")} placeholder="+91 98765 43211" type="tel" /></Field>
            </div>
            <Field label="Email Address"><TextInput value={settings.email} onChange={set("email")} placeholder="school@example.com" type="email" /></Field>
            <Field label="Google Maps Embed">
              <TextAreaInput
                value={settings.mapEmbedUrl}
                onChange={(val) => {
                  // Accept either a full <iframe> paste or just the src URL
                  // Extract src if a full iframe tag is pasted
                  const srcMatch = val.match(/src=["']([^"']+)["']/i);
                  set("mapEmbedUrl")(srcMatch ? srcMatch[1] : val);
                }}
                placeholder='Paste the full Google Maps <iframe> embed code OR just the src="…" URL'
                rows={3}
              />
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 5, marginBottom: 0 }}>
                In Google Maps: <strong>Share → Embed a map → Copy HTML</strong> — then paste the entire{" "}
                <code>&lt;iframe&gt;</code> code here. The src URL will be extracted automatically.
                Do <strong>not</strong> paste a short link (maps.app.goo.gl) — those cannot be embedded.
              </p>
            </Field>
            {settings.mapEmbedUrl && (() => {
              // Resolve to embed src for preview (same logic as Contact page)
              const FALLBACK = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4212.697217159162!2d79.48014427609375!3d27.233761176457268!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39747beda2b542b3%3A0x3b884b32c2beea73!2sCnps%20Public%20School!5e1!3m2!1sen!2sin!4v1791519023414!5m2!1sen!2sin";
              const raw = settings.mapEmbedUrl || "";
              const srcMatch = raw.match(/src=["']([^"']+)["']/i);
              const isValidEmbed = raw.startsWith("https://www.google.com/maps/embed");
              const previewSrc = srcMatch ? srcMatch[1] : isValidEmbed ? raw : null;
              const isShortLink = !isValidEmbed && !srcMatch && raw.trim().length > 0;

              return (
                <div style={{ marginBottom: 20 }}>
                  {isShortLink && (
                    <div style={{ padding: "8px 14px", background: "#FEF3C7", border: "1px solid #FDE68A", borderRadius: 8, fontSize: "0.8rem", color: "#92400E", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                      <i className="bi bi-exclamation-triangle-fill" />
                      This looks like a short share link, not an embed URL. Please paste the full{" "}
                      <code>&lt;iframe&gt;</code> embed code from Google Maps.
                    </div>
                  )}
                  {previewSrc && (
                    <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid var(--border)" }}>
                      <iframe src={previewSrc} width="100%" height="200" style={{ border: 0, display: "block" }}
                        allowFullScreen loading="lazy" referrerPolicy="strict-origin-when-cross-origin" title="Map Preview" />
                    </div>
                  )}
                </div>
              );
            })()}
            <SaveButton onClick={handleSave} saving={saving} />
          </div>
        )}

        {/* ── Tab 3: Social Links ─────────────────────────── */}
        {activeTab === "social" && (
          <div>
            <SectionTitle icon="bi-share" title="Social Media Links" subtitle="Shown in footer and Contact page" />
            {[
              { key: "facebook",  label: "Facebook Page URL",      icon: "bi-facebook",   color: "#1877F2", ph: "https://facebook.com/yourcnps" },
              { key: "instagram", label: "Instagram Profile URL",   icon: "bi-instagram",  color: "#E1306C", ph: "https://instagram.com/yourcnps" },
              { key: "youtube",   label: "YouTube Channel URL",     icon: "bi-youtube",    color: "#FF0000", ph: "https://youtube.com/@yourcnps" },
              { key: "twitter",   label: "Twitter / X Profile URL", icon: "bi-twitter-x",  color: "#000000", ph: "https://x.com/yourcnps" },
              { key: "linkedin",  label: "LinkedIn Page URL",       icon: "bi-linkedin",   color: "#0A66C2", ph: "https://linkedin.com/school/yourcnps" },
            ].map(({ key, label, icon, color, ph }) => (
              <Field key={key} label={label}>
                <div style={{ position: "relative" }}>
                  <i className={`bi ${icon}`} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color, fontSize: "1rem" }} />
                  <input type="url" value={settings[key] ?? ""} onChange={(e) => set(key)(e.target.value)}
                    placeholder={ph} style={{ ...iStyle, paddingLeft: 36 }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
                </div>
              </Field>
            ))}
            <SaveButton onClick={handleSave} saving={saving} />
          </div>
        )}

        {/* ── Tab 4: About Page ──────────────────────────── */}
        {activeTab === "about" && (
          <div>
            <SectionTitle icon="bi-file-text" title="About Page Content" subtitle="Text and images shown on the About Us page" />
            <Field label="About Page Heading">
              <TextInput value={settings.aboutHeading} onChange={set("aboutHeading")} placeholder="About CNPS Public School" />
            </Field>
            <Field label="About Us Description">
              <TextAreaInput value={settings.aboutDescription} onChange={set("aboutDescription")} placeholder="School history, philosophy, achievements…" rows={6} />
            </Field>
            <div className="settings-3col-grid">
              <Field label="Our Mission">
                <TextAreaInput value={settings.aboutMission} onChange={set("aboutMission")} placeholder="Mission statement…" rows={4} />
              </Field>
              <Field label="Our Vision">
                <TextAreaInput value={settings.aboutVision} onChange={set("aboutVision")} placeholder="Vision statement…" rows={4} />
              </Field>
              <Field label="Our Values">
                <TextAreaInput value={settings.aboutValues} onChange={set("aboutValues")} placeholder="Core values…" rows={4} />
              </Field>
            </div>

            <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "12px 0 20px" }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <p style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text-secondary)", margin: 0 }}>
                About Page Gallery Images
                <span style={{ fontWeight: 400, color: "var(--text-muted)", marginLeft: 8, fontSize: "0.82rem" }}>
                  ({settings.aboutImages ? settings.aboutImages.length : 0}/20)
                </span>
              </p>
              <AboutGalleryAddButton
                onAdded={(url, index) => setSettings(p => ({
                  ...p,
                  aboutImages: [...(p.aboutImages || []), { url, index }]
                }))}
                addToast={addToast}
              />
            </div>

            {/* Render all gallery images from aboutImages array */}
            {settings.aboutImages && settings.aboutImages.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14, marginBottom: 20 }}>
                {settings.aboutImages.map((img, idx) => {
                  const url = img.url || img;
                  return (
                    <div key={idx} style={{ position: "relative", borderRadius: 10, overflow: "hidden", border: "1px solid var(--border)", background: "var(--bg-section)" }}>
                      <img src={url} alt={`About ${idx + 1}`} style={{ width: "100%", height: 130, objectFit: "cover", display: "block" }} onError={e => { e.target.style.display = "none"; }} />
                      <div style={{ padding: "6px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Image {idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleAboutImageRemove(`idx_${idx}`)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)", fontSize: "0.85rem", padding: "2px 4px" }}
                          title="Remove image"
                        >
                          <i className="bi bi-trash3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Fallback: show legacy aboutImage1/2/3 fields if no aboutImages array yet
              [
                { field: "aboutImage1", label: "About Gallery Image 1" },
                { field: "aboutImage2", label: "About Gallery Image 2" },
                { field: "aboutImage3", label: "About Gallery Image 3" },
              ].map(({ field, label }) => (
                <ImageField
                  key={field}
                  label={label}
                  currentUrl={settings[field]}
                  onUpload={(file) => handleAboutImageUpload(field, file)}
                  onRemove={() => handleAboutImageRemove(field)}
                  uploading={uploading[field]}
                  hint="JPG, PNG, WebP. Will be shown in the About page image gallery."
                />
              ))
            )}
            <SaveButton onClick={handleSave} saving={saving} />
          </div>
        )}
      </div>

      <Toast toasts={toasts} />
    </div>
  );
}
