import { Routes, Route } from "react-router-dom";
import useTemplateFeatures from "./hooks/useTemplateFeatures";
import MainLayout from "./layouts/MainLayout";

import Home from "./pages/Home";
import Notices from "./pages/Notices";
import NoticeDetails from "./pages/NoticeDetails";
import About from "./pages/About";
import Courses from "./pages/Courses";
// import CourseClasses from "./pages/CourseClasses"; // UNUSED — uses static data/courses.js, not CMS
import CourseDetails from "./pages/CourseDetails";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import Trainers from "./pages/Trainers";
// import Pricing from "./pages/Pricing";           // UNUSED — static hardcoded data, no CMS integration
import Login from "./pages/Login";
// import StudentRegister from "./pages/StudentRegister"; // UNUSED — no backend, static form only
// import TeacherRegister from "./pages/TeacherRegister"; // UNUSED — no backend, static form only
import ForgotPassword from "./pages/ForgotPassword";
import Contact from "./pages/Contact";
import Admission from "./pages/Admission";
import AdminLayout from "./admin/components/AdminLayout";
import AdminDashboard from "./admin/pages/AdminDashboard";
import AdminEvents from "./admin/pages/AdminEvents";
import AdminGallery from "./admin/pages/AdminGallery";
import AdminNotices from "./admin/pages/AdminNotices";
import AdminTestimonials from "./admin/pages/AdminTestimonials";
import AdminCourses from "./admin/pages/AdminCourses";
import AdminFaculty from "./admin/pages/AdminFaculty";
import AdminAdmissions from "./admin/pages/AdminAdmissions";
import AdminHomepage from "./admin/pages/AdminHomepage";
import AdminAbout from "./admin/pages/AdminAbout";
import AdminContactMessages from "./admin/pages/AdminContactMessages";
import AdminSettings from "./admin/pages/AdminSettings";





function App() {
  useTemplateFeatures();

  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/events" element={<AdminEvents />} />
        <Route
          path="/admin/gallery"
          element={<AdminGallery />}
        />
        <Route path="/admin/notices" element={<AdminNotices />} />
        <Route
          path="/admin/testimonials"
          element={<AdminTestimonials />}
        />
        <Route
          path="/admin/courses"
          element={<AdminCourses />}
        />
        <Route path="/admin/faculty" element={<AdminFaculty />} />
        <Route
          path="/admin/admissions"
          element={<AdminAdmissions />}
        />
        <Route
          path="/admin/homepage"
          element={<AdminHomepage />}
        />
        <Route path="/admin/about" element={<AdminAbout />} />
        <Route
          path="/admin/contact-messages"
          element={<AdminContactMessages />}
        />
        <Route path="/admin/settings" element={<AdminSettings />} />
      </Route>
      <Route element={<MainLayout />}>

        <Route path="/" element={<Home />} />

        <Route path="/notices" element={<Notices />} />

        <Route path="/notice/:slug" element={<NoticeDetails />} />

        <Route path="/about" element={<About />} />

        <Route path="/courses" element={<Courses />} />

        {/* UNUSED — CourseClasses uses static data/courses.js, not CMS */}
        {/* <Route path="/courses/:courseId" element={<CourseClasses />} /> */}

        {/* Single course details */}
        <Route path="/course-details/:courseId" element={<CourseDetails />} />

        {/* Group course class details */}
        <Route path="/course-details/:courseId/:classId" element={<CourseDetails />} />

        <Route path="/events" element={<Events />} />

        <Route path="/events/:eventSlug" element={<EventDetails />} />

        <Route path="/trainers" element={<Trainers />} />

        {/* UNUSED — Pricing uses static hardcoded data, not CMS */}
        {/* <Route path="/pricing" element={<Pricing />} /> */}

        <Route path="/login" element={<Login />} />

        {/* UNUSED — StudentRegister and TeacherRegister have no backend */}
        {/* <Route path="/student-register" element={<StudentRegister />} /> */}
        {/* <Route path="/teacher-register" element={<TeacherRegister />} /> */}

        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/contact" element={<Contact />} />

        <Route path="/admission" element={<Admission />} />

      </Route>
    </Routes>
  );
}

export default App;