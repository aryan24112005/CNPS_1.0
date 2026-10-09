# CNPS Public School — Modern Website Rebuild

A complete, production-ready full-stack website for CNPS Public School.

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, Vite 5, React Router v6   |
| Backend    | Node.js, Express 4                  |
| Database   | MongoDB + Mongoose                  |
| Images     | Cloudinary (persistent storage)     |
| Auth       | JWT (jsonwebtoken + bcryptjs)       |
| Hosting    | Render / any Node host              |

---

## Project Structure

```
New CNPS/
├── backend/
│   ├── src/
│   │   ├── config/         cloudinary.js, db.js
│   │   ├── controllers/    13 controllers
│   │   ├── middleware/     auth.js, upload.js, errorHandler.js
│   │   ├── models/         13 Mongoose models
│   │   ├── routes/         13 route files
│   │   ├── services/       cloudinaryService.js
│   │   └── server.js
│   ├── scripts/
│   │   └── createAdmin.js
│   ├── .env                (create from .env.example)
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/            axios.js (base client + interceptors)
│   │   ├── components/
│   │   │   ├── admin/      AdminSidebar.jsx
│   │   │   └── public/     Navbar.jsx, Footer.jsx, ScrollTop.jsx
│   │   ├── layouts/        PublicLayout.jsx, AdminLayout.jsx
│   │   ├── pages/
│   │   │   ├── public/     Home, About, Courses, CourseDetails,
│   │   │   │               Trainers, Events, EventDetails,
│   │   │   │               Notices, NoticeDetails, Gallery,
│   │   │   │               Contact, Admission, Login
│   │   │   └── admin/      AdminDashboard, AdminHomepage,
│   │   │                   AdminFaculty, AdminCourses,
│   │   │                   AdminEvents, AdminNotices,
│   │   │                   AdminGallery, AdminTestimonials,
│   │   │                   AdminAdmissions, AdminMessages,
│   │   │                   AdminMedia, AdminSettings
│   │   ├── services/       adminService.js, publicService.js
│   │   ├── styles/         global.css (complete design system)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env                (create from .env.example)
│   ├── .env.example
│   └── package.json
│
└── README.md
```

---

## Local Setup

### 1. Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account (free tier is fine)

---

### 2. Backend Setup

```bash
cd backend

# Copy and fill environment variables
copy .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/cnps_school
JWT_SECRET=your_long_random_secret_min_32_chars
JWT_EXPIRES_IN=1d
FRONTEND_URL=http://localhost:5173

# Cloudinary — get from https://console.cloudinary.com
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional — email notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM_NAME=CNPS Public School
EMAIL_FROM_ADDRESS=your@gmail.com
```

```bash
# Install dependencies
npm install

# Create first admin account
node scripts/createAdmin.js

# Start development server
npm run dev
```

Backend runs at: **http://localhost:5000**

---

### 3. Frontend Setup

```bash
cd frontend

# Copy environment file
copy .env.example .env
```

`frontend/.env` should contain:
```env
VITE_API_URL=http://localhost:5000/api
```

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

### 4. Create Admin Account

```bash
cd backend
node scripts/createAdmin.js
```

Follow the prompts to set email and password.
Then log in at: **http://localhost:5173/login**

---

## Public Website Routes

| Route                | Page             |
|----------------------|------------------|
| `/`                  | Home             |
| `/about`             | About Us         |
| `/courses`           | All Courses      |
| `/courses/:slug`     | Course Details   |
| `/trainers`          | Faculty          |
| `/events`            | Events           |
| `/events/:slug`      | Event Details    |
| `/notices`           | Notice Board     |
| `/notices/:slug`     | Notice Details   |
| `/gallery`           | Photo Gallery    |
| `/contact`           | Contact Us       |
| `/admission`         | Apply for Admission |
| `/login`             | Admin Login      |

---

## Admin Panel Routes

| Route                    | Module              |
|--------------------------|---------------------|
| `/admin`                 | Dashboard           |
| `/admin/homepage`        | Homepage Content    |
| `/admin/faculty`         | Faculty / Trainers  |
| `/admin/courses`         | Courses             |
| `/admin/events`          | Events              |
| `/admin/notices`         | Notices             |
| `/admin/gallery`         | Gallery Albums      |
| `/admin/testimonials`    | Testimonials        |
| `/admin/admissions`      | Admission Enquiries |
| `/admin/messages`        | Contact Messages    |
| `/admin/media`           | Media Library       |
| `/admin/settings`        | Website Settings    |

---

## API Endpoints

| Prefix              | Description           |
|---------------------|-----------------------|
| `/api/auth`         | Login, profile, password |
| `/api/hero`         | Hero slides           |
| `/api/homepage`     | Homepage content      |
| `/api/faculty`      | Faculty members       |
| `/api/courses`      | Courses               |
| `/api/events`       | Events + gallery      |
| `/api/notices`      | Notices               |
| `/api/gallery`      | Gallery albums        |
| `/api/testimonials` | Testimonials          |
| `/api/settings`     | Site settings         |
| `/api/admissions`   | Admission enquiries   |
| `/api/contact`      | Contact messages      |
| `/api/media`        | Media library         |

All admin routes require `Authorization: Bearer <token>` header.

---

## MongoDB Models

| Model            | Purpose                        |
|------------------|--------------------------------|
| Admin            | Admin users (hashed password)  |
| Faculty          | Teachers / staff               |
| Course           | Courses with books/PDFs        |
| Event            | Events with gallery images     |
| GalleryAlbum     | Gallery albums with images     |
| Notice           | School notices with files      |
| HeroSlide        | Homepage hero carousel         |
| Testimonial      | Parent/student testimonials    |
| HomepageContent  | Homepage section content       |
| SiteSettings     | School info, social, about     |
| AdmissionEnquiry | Admission form submissions     |
| ContactMessage   | Contact form submissions       |
| Media            | Media library files            |

---

## Image Storage — Cloudinary

All images are stored on **Cloudinary** (persistent, CDN-delivered).

Images survive:
- Server restarts
- Redeployments
- Environment changes

Folder structure in Cloudinary:
```
cnps/
├── hero/
├── about/
├── faculty/
├── courses/
├── events/
├── gallery/
├── notices/
├── testimonials/
├── settings/
└── media/
```

---

## Build for Production

```bash
# Frontend
cd frontend
npm run build
# Output: frontend/dist/

# Backend
cd backend
npm start
# Or with PM2: pm2 start src/server.js --name cnps-backend
```

---

## Design System

| Variable          | Value     | Usage            |
|-------------------|-----------|------------------|
| `--primary`       | `#16A8E0` | Main brand blue  |
| `--primary-dark`  | `#0D8FC5` | Hover states     |
| `--primary-light` | `#38BDF8` | Accents          |
| `--navy`          | `#102A43` | Headings, sidebar|
| `--gold`          | `#F4B942` | Highlights (5%)  |
| `--bg-soft-blue`  | `#EAF7FC` | Card backgrounds |
| `--bg-section`    | `#F5F7FA` | Section fills    |

---

## Security

- Passwords: bcrypt (12 rounds)
- Authentication: JWT (1 day expiry)
- Rate limiting: 500/15min API, 20/15min auth, 15/hr contact
- File validation: image MIME type + extension + 10MB limit
- Helmet headers
- CORS: restricted to FRONTEND_URL

---

## Deployment

This project is ready for deployment to **Render**, **Railway**, or any Node host.

1. Set all environment variables from `.env.example`
2. Set `NODE_ENV=production`
3. Set `FRONTEND_URL` to your production frontend URL
4. Point `MONGODB_URI` to your MongoDB Atlas cluster
5. Set real Cloudinary credentials

**Do NOT deploy until fully tested locally.**

---

## Known Limitations

- No email notifications on form submissions (SMTP is optional)
- No image compression before Cloudinary upload (Cloudinary handles this)
- Admin panel has no role-based access (all admins have full access)
- No data migration script from the old PHP/MySQL website

---

*Built for local development. Deploy only after complete testing and client approval.*
