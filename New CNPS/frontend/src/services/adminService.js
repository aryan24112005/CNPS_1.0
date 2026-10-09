import api from "../api/axios";

// ── Auth ──────────────────────────────────────────────────────
export const loginAdmin      = (d) => api.post("/auth/login", d).then(r => r.data);
export const getMe           = ()  => api.get("/auth/me").then(r => r.data.data);
export const changePassword  = (d) => api.put("/auth/change-password", d).then(r => r.data);
export const forgotPassword  = (d) => api.post("/auth/forgot-password", d).then(r => r.data);
export const resetPassword   = (d) => api.post("/auth/reset-password", d).then(r => r.data);

// ── Hero Slides ───────────────────────────────────────────────
export const getHeroSlides   = ()       => api.get("/hero").then(r => r.data.data);
export const createHeroSlide = (d)      => api.post("/hero", d).then(r => r.data);
export const updateHeroSlide = (id, d)  => api.put(`/hero/${id}`, d).then(r => r.data);
export const deleteHeroSlide = (id)     => api.delete(`/hero/${id}`).then(r => r.data);
export const uploadHeroImage = (id, fd) => api.post(`/hero/${id}/image`, fd).then(r => r.data);

// ── Homepage Content ──────────────────────────────────────────
export const getHomepageContent    = ()      => api.get("/homepage").then(r => r.data.data);
export const updateHomepageContent = (d)     => api.put("/homepage", d).then(r => r.data);
export const uploadHomepageAboutImg= (fd)    => api.post("/homepage/about-image", fd).then(r => r.data);

// ── Faculty ───────────────────────────────────────────────────
export const getFaculty       = ()       => api.get("/faculty").then(r => r.data.data);
export const getFacultyById   = (id)     => api.get(`/faculty/${id}`).then(r => r.data.data);
export const createFaculty    = (d)      => api.post("/faculty", d).then(r => r.data);
export const updateFaculty    = (id, d)  => api.put(`/faculty/${id}`, d).then(r => r.data);
export const deleteFaculty    = (id)     => api.delete(`/faculty/${id}`).then(r => r.data);
export const uploadFacultyPhoto = (id, fd) => api.post(`/faculty/${id}/photo`, fd).then(r => r.data);

// ── Courses ───────────────────────────────────────────────────
export const getCourses       = ()       => api.get("/courses").then(r => r.data.data);
export const getCourseById    = (id)     => api.get(`/courses/${id}`).then(r => r.data.data);
export const createCourse     = (d)      => api.post("/courses", d).then(r => r.data);
export const updateCourse     = (id, d)  => api.put(`/courses/${id}`, d).then(r => r.data);
export const deleteCourse     = (id)     => api.delete(`/courses/${id}`).then(r => r.data);
export const uploadCourseImage     = (id, fd) => api.post(`/courses/${id}/image`, fd).then(r => r.data);
export const uploadCourseFeePdf    = (id, fd) => api.post(`/courses/${id}/fee-pdf`, fd).then(r => r.data);
export const uploadCourseTimetable = (id, fd) => api.post(`/courses/${id}/timetable-pdf`, fd).then(r => r.data);

// ── Events ────────────────────────────────────────────────────
export const getEvents        = ()       => api.get("/events").then(r => r.data.data);
export const getEventById     = (id)     => api.get(`/events/${id}`).then(r => r.data.data);
export const createEvent      = (d)      => api.post("/events", d).then(r => r.data);
export const updateEvent      = (id, d)  => api.put(`/events/${id}`, d).then(r => r.data);
export const deleteEvent      = (id)     => api.delete(`/events/${id}`).then(r => r.data);
export const uploadEventCover  = (id, fd) => api.post(`/events/${id}/cover`, fd).then(r => r.data);
export const addEventGallery   = (id, fd) => api.post(`/events/${id}/gallery`, fd).then(r => r.data);
export const deleteEventImage  = (eventId, imgId) => api.delete(`/events/${eventId}/gallery/${imgId}`).then(r => r.data);

// ── Notices ───────────────────────────────────────────────────
export const getNotices       = ()       => api.get("/notices").then(r => r.data.data);
export const getNoticeById    = (id)     => api.get(`/notices/${id}`).then(r => r.data.data);
export const createNotice     = (d)      => api.post("/notices", d).then(r => r.data);
export const updateNotice     = (id, d)  => api.put(`/notices/${id}`, d).then(r => r.data);
export const deleteNotice     = (id)     => api.delete(`/notices/${id}`).then(r => r.data);
export const uploadNoticeFile = (id, fd) => api.post(`/notices/${id}/file`, fd).then(r => r.data);

// ── Gallery Albums ────────────────────────────────────────────
export const getAlbums        = ()       => api.get("/gallery").then(r => r.data.data);
export const getAlbumById     = (id)     => api.get(`/gallery/${id}`).then(r => r.data.data);
export const createAlbum      = (d)      => api.post("/gallery", d).then(r => r.data);
export const updateAlbum      = (id, d)  => api.put(`/gallery/${id}`, d).then(r => r.data);
export const deleteAlbum      = (id)     => api.delete(`/gallery/${id}`).then(r => r.data);
export const uploadAlbumCover = (id, fd) => api.post(`/gallery/${id}/cover`, fd).then(r => r.data);
export const addAlbumImages   = (id, fd) => api.post(`/gallery/${id}/images`, fd).then(r => r.data);
export const deleteAlbumImage = (albumId, imgId) => api.delete(`/gallery/${albumId}/images/${imgId}`).then(r => r.data);

// ── Testimonials ──────────────────────────────────────────────
export const getTestimonials      = ()       => api.get("/testimonials").then(r => r.data.data);
export const getTestimonialById   = (id)     => api.get(`/testimonials/${id}`).then(r => r.data.data);
export const createTestimonial    = (d)      => api.post("/testimonials", d).then(r => r.data);
export const updateTestimonial    = (id, d)  => api.put(`/testimonials/${id}`, d).then(r => r.data);
export const deleteTestimonial    = (id)     => api.delete(`/testimonials/${id}`).then(r => r.data);
export const uploadTestimonialAvatar = (id, fd) => api.post(`/testimonials/${id}/avatar`, fd).then(r => r.data);

// ── Settings ──────────────────────────────────────────────────
export const getSettings      = ()      => api.get("/settings").then(r => r.data.data);
export const updateSettings   = (d)     => api.put("/settings", d).then(r => r.data);
export const uploadLogo       = (fd)    => api.post("/settings/logo",    fd).then(r => r.data);
export const uploadFavicon    = (fd)    => api.post("/settings/favicon", fd).then(r => r.data);
export const uploadAboutImage = (field, fd) => api.post(`/settings/about-image/${field}`, fd).then(r => r.data);
export const deleteAboutImage = (field)     => api.delete(`/settings/about-image/${field}`).then(r => r.data);

// ── Admissions ────────────────────────────────────────────────
export const getAdmissions    = (params) => api.get("/admissions/admin", { params }).then(r => r.data);
export const getAdmissionById = (id)     => api.get(`/admissions/admin/${id}`).then(r => r.data.data);
export const updateAdmission  = (id, d)  => api.patch(`/admissions/admin/${id}`, d).then(r => r.data);
export const deleteAdmission  = (id)     => api.delete(`/admissions/admin/${id}`).then(r => r.data);

// ── Contact Messages ──────────────────────────────────────────
export const getMessages      = (params) => api.get("/contact/admin", { params }).then(r => r.data);
export const getMessageById   = (id)     => api.get(`/contact/admin/${id}`).then(r => r.data.data);
export const updateMessage    = (id, d)  => api.patch(`/contact/admin/${id}`, d).then(r => r.data);
export const deleteMessage    = (id)     => api.delete(`/contact/admin/${id}`).then(r => r.data);

// ── Media Library ─────────────────────────────────────────────
export const getMedia         = (params) => api.get("/media", { params }).then(r => r.data);
export const uploadMedia      = (fd)     => api.post("/media", fd).then(r => r.data);
export const deleteMedia      = (id)     => api.delete(`/media/${id}`).then(r => r.data);
