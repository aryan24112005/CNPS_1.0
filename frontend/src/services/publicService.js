import api from "../api/axios";

// ── Hero ──────────────────────────────────────────────────────
export const getHeroSlides    = () => api.get("/hero/public").then(r => r.data.data);

// ── Homepage content ──────────────────────────────────────────
export const getHomepageContent = () => api.get("/homepage/public").then(r => r.data.data);

// ── Faculty ───────────────────────────────────────────────────
export const getPublicFaculty = () => api.get("/faculty/public").then(r => r.data.data);

// ── Courses ───────────────────────────────────────────────────
export const getPublicCourses    = () => api.get("/courses/public").then(r => r.data.data);
export const getPublicCourseBySlug = (slug) => api.get(`/courses/public/${slug}`).then(r => r.data.data);

// ── Events ────────────────────────────────────────────────────
export const getPublicEvents    = () => api.get("/events/public").then(r => r.data.data);
export const getPublicEventBySlug = (slug) => api.get(`/events/public/${slug}`).then(r => r.data.data);

// ── Notices ───────────────────────────────────────────────────
export const getPublicNotices   = () => api.get("/notices/public").then(r => r.data.data);
export const getPublicNoticeBySlug = (slug) => api.get(`/notices/public/${slug}`).then(r => r.data.data);

// ── Gallery ───────────────────────────────────────────────────
export const getPublicGallery   = () => api.get("/gallery/public").then(r => r.data.data);
export const getPublicAlbumBySlug = (slug) => api.get(`/gallery/public/${slug}`).then(r => r.data.data);

// ── Testimonials ──────────────────────────────────────────────
export const getPublicTestimonials = () => api.get("/testimonials/public").then(r => r.data.data);

// ── Settings ──────────────────────────────────────────────────
export const getSiteSettings    = () => api.get("/settings/public").then(r => r.data.data);

// ── Contact & Admission (form submissions) ────────────────────
export const submitContact   = (data) => api.post("/contact", data).then(r => r.data);
export const submitAdmission = (data) => api.post("/admissions", data).then(r => r.data);
