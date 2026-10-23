import { Routes, Route, Navigate } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import AdminLayout  from "./layouts/AdminLayout";

// Public pages
import Home          from "./pages/public/Home";
import About         from "./pages/public/About";
import Courses       from "./pages/public/Courses";
import CourseDetails from "./pages/public/CourseDetails";
import Trainers      from "./pages/public/Trainers";
import Events        from "./pages/public/Events";
import EventDetails  from "./pages/public/EventDetails";
import Notices       from "./pages/public/Notices";
import NoticeDetails from "./pages/public/NoticeDetails";
import Gallery       from "./pages/public/Gallery";
import Contact       from "./pages/public/Contact";
import Admission     from "./pages/public/Admission";
import Login         from "./pages/public/Login";

// Legal pages
import TermsAndConditions from "./pages/public/TermsAndConditions";
import PrivacyPolicy      from "./pages/public/PrivacyPolicy";

// Admin pages
import AdminDashboard      from "./pages/admin/AdminDashboard";
import AdminHomepage       from "./pages/admin/AdminHomepage";
import AdminFaculty        from "./pages/admin/AdminFaculty";
import AdminCourses        from "./pages/admin/AdminCourses";
import AdminEvents         from "./pages/admin/AdminEvents";
import AdminNotices        from "./pages/admin/AdminNotices";
import AdminGallery        from "./pages/admin/AdminGallery";
import AdminTestimonials   from "./pages/admin/AdminTestimonials";
import AdminAdmissions     from "./pages/admin/AdminAdmissions";
import AdminMessages       from "./pages/admin/AdminMessages";
import AdminMedia          from "./pages/admin/AdminMedia";
import AdminSettings       from "./pages/admin/AdminSettings";

export default function App() {
  return (
    <Routes>
      {/* ── Public Routes ─────────────────────────────────── */}
      <Route element={<PublicLayout />}>
        <Route path="/"                        element={<Home />} />
        <Route path="/about"                   element={<About />} />
        <Route path="/courses"                 element={<Courses />} />
        <Route path="/courses/:slug"           element={<CourseDetails />} />
        <Route path="/trainers"                element={<Trainers />} />
        <Route path="/events"                  element={<Events />} />
        <Route path="/events/:slug"            element={<EventDetails />} />
        <Route path="/notices"                 element={<Notices />} />
        <Route path="/notices/:slug"           element={<NoticeDetails />} />
        <Route path="/gallery"                 element={<Gallery />} />
        <Route path="/contact"                 element={<Contact />} />
        <Route path="/admission"               element={<Admission />} />
        <Route path="/login"                   element={<Login />} />
        <Route path="/terms-and-conditions"    element={<TermsAndConditions />} />
        <Route path="/privacy-policy"          element={<PrivacyPolicy />} />
      </Route>

      {/* ── Admin Routes ──────────────────────────────────── */}
      <Route element={<AdminLayout />}>
        <Route path="/admin"                   element={<AdminDashboard />} />
        <Route path="/admin/homepage"          element={<AdminHomepage />} />
        <Route path="/admin/faculty"           element={<AdminFaculty />} />
        <Route path="/admin/courses"           element={<AdminCourses />} />
        <Route path="/admin/events"            element={<AdminEvents />} />
        <Route path="/admin/notices"           element={<AdminNotices />} />
        <Route path="/admin/gallery"           element={<AdminGallery />} />
        <Route path="/admin/testimonials"      element={<AdminTestimonials />} />
        <Route path="/admin/admissions"        element={<AdminAdmissions />} />
        <Route path="/admin/messages"          element={<AdminMessages />} />
        <Route path="/admin/media"             element={<AdminMedia />} />
        <Route path="/admin/settings"          element={<AdminSettings />} />
      </Route>

      {/* ── Fallback ──────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
