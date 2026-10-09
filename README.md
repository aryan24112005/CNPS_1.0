# CNPS Public School Website & Admin CMS

A full-stack school website and content management system for CNPS Public School. The public website serves students, parents, and visitors with dynamic content. The Admin CMS allows school staff to manage all website content from a browser without technical knowledge.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Folder Structure](#3-project-folder-structure)
4. [How the System Works](#4-how-the-system-works)
5. [Database Architecture](#5-database-architecture)
6. [Automatic Database Initialization](#6-automatic-database-initialization)
7. [Environment Variables](#7-environment-variables)
8. [Local Development Setup](#8-local-development-setup)
9. [Production Deployment](#9-production-deployment)
10. [API Documentation](#10-api-documentation)
11. [Admin Panel Documentation](#11-admin-panel-documentation)
12. [Authentication & Security](#12-authentication--security)
13. [File & Image Upload System](#13-file--image-upload-system)
14. [Common Problems & Solutions](#14-common-problems--solutions)
15. [How to Debug](#15-how-to-debug)
16. [Database Backup & Recovery](#16-database-backup--recovery)
17. [Development Rules](#17-development-rules)
18. [Adding a New Feature](#18-adding-a-new-feature)
19. [Adding or Changing Database Tables](#19-adding-or-changing-database-tables)
20. [Deployment Checklist](#20-deployment-checklist)
21. [Project URLs](#21-project-urls)
22. [Important File Reference Map](#22-important-file-reference-map)
23. [Maintenance Notes](#23-maintenance-notes)

---

## 1. Project Overview

**CNPS Public School Website** is a two-part web application:

**Public Website**
A React-based school website presenting dynamic content to students, parents, and visitors. It includes hero slideshow, course listings, faculty profiles, school events, photo gallery, notices, testimonials, admission enquiry form, and contact form. All content is fetched live from the backend API.

**Admin CMS**
A password-protected admin panel embedded in the same React app at `/admin`. Administrators log in with JWT authentication and can manage all content displayed on the public website through a browser interface.

**Architecture summary:**
- Frontend deployed on **Netlify** communicates with the backend over HTTPS
- Backend deployed on **Render** handles API requests and file uploads
- Database hosted on **Railway MySQL** stores all content

---

## 2. Technology Stack

### Frontend
| Package | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| Vite | 8 | Build tool and dev server |
| React Router DOM | 7 | Client-side routing (public + admin) |
| Swiper | 14 | Hero image/video carousel |
| GLightbox | 3 | Gallery image lightbox |
| @srexi/purecounterjs | 1.5 | Animated number counters |
| AOS | 2.3 | Scroll-triggered animations |
| Bootstrap | via vendor | CSS grid, utilities |
| Bootstrap Icons | via vendor | Icon set used throughout admin and public |

### Backend
| Package | Version | Purpose |
|---|---|---|
| Node.js | 18+ | Runtime |
| Express | 5 | Web framework |
| mysql2 | 3 | MySQL database driver (promise API) |
| bcryptjs | 3 | Password hashing (cost 12) |
| jsonwebtoken | 9 | JWT creation and verification |
| multer | 2 | Multipart file/image upload handling |
| nodemailer | 10 | OTP email delivery via SMTP |
| dotenv | 17 | Environment variable loading |
| helmet | 8 | HTTP security headers |
| morgan | 1 | HTTP request logging |
| cors | 2 | Cross-origin resource sharing |

### Database
MySQL 8 (MariaDB-compatible). Hosted on Railway in production, local MySQL in development.

### Deployment
| Service | Role |
|---|---|
| Netlify | Frontend static hosting |
| Render | Backend Node.js hosting |
| Railway | MySQL database hosting |

---

## 3. Project Folder Structure

```
CNPS/
├── README.md                          ← This file
├── Backend/
│   ├── server.js                      ← Entry point — enforces startup order
│   ├── createAdmin.js                 ← One-time admin account creation utility
│   ├── .env                           ← Local secrets (never commit)
│   ├── .env.example                   ← Safe template for .env
│   ├── package.json
│   ├── uploads/                       ← Uploaded files (served as /uploads/*)
│   │   ├── about/                     ← About page and section images
│   │   ├── courses/                   ← Course images + fee/timetable PDFs
│   │   ├── events/                    ← Event cover images
│   │   │   └── gallery/               ← Event gallery images
│   │   ├── faculty/                   ← Faculty profile photos
│   │   ├── gallery/                   ← "Why Us" section images
│   │   ├── hero/                      ← Hero carousel images/videos
│   │   ├── notices/                   ← Notice PDFs and images
│   │   └── testimonials/              ← Testimonial avatar photos
│   └── src/
│       ├── app.js                     ← Express app: routes, middleware, error handler
│       ├── config/
│       │   ├── db.js                  ← mysql2 connection pool
│       │   └── initDb.js              ← Auto DB init: creates all 22 tables
│       ├── controllers/               ← One file per resource (request handlers)
│       ├── middleware/
│       │   ├── authMiddleware.js      ← JWT protect() middleware
│       │   └── *UploadMiddleware.js   ← Multer configs (one per resource)
│       ├── routes/                    ← Express routers (one per resource)
│       ├── utils/
│       │   └── emailService.js        ← Nodemailer: OTP email sender
│       └── models/                    ← Reserved (currently empty)
│
└── Frontend/
    ├── index.html
    ├── vite.config.js
    ├── .env                           ← VITE_API_URL (never commit)
    ├── package.json
    ├── public/
    │   ├── icons.svg
    │   └── assets/
    │       ├── img/                   ← Static images (logo, fallback images)
    │       ├── pdfs/                  ← Static PDFs
    │       └── vendor/                ← Bootstrap, Bootstrap Icons, Swiper, AOS, GLightbox
    └── src/
        ├── main.jsx                   ← React root render
        ├── App.jsx                    ← All routes (public + admin)
        ├── index.css                  ← Global overrides
        ├── assets/
        │   └── css/main.css           ← Main public website CSS (~48 KB)
        ├── hooks/
        │   └── useTemplateFeatures.js ← Initialises Swiper, AOS, GLightbox, PureCounter
        ├── layouts/
        │   └── MainLayout.jsx         ← Public website shell (Navbar + Footer)
        ├── data/                      ← Static fallback data files
        ├── pages/                     ← Public website pages
        │   ├── Home.jsx
        │   ├── About.jsx
        │   ├── Courses.jsx
        │   ├── CourseDetails.jsx
        │   ├── Events.jsx / EventDetails.jsx
        │   ├── Trainers.jsx
        │   ├── Notices.jsx / NoticeDetails.jsx
        │   ├── Contact.jsx
        │   ├── Admission.jsx
        │   ├── Login.jsx
        │   └── ForgotPassword.jsx
        ├── components/                ← Shared public UI components
        │   ├── Navbar.jsx / Footer.jsx
        │   ├── AboutSection.jsx
        │   ├── CountsSection.jsx
        │   ├── CoursesSection.jsx
        │   ├── TrainersSection.jsx
        │   ├── TestimonialsSection.jsx
        │   ├── WhyUsSection.jsx
        │   └── NoticeTicker.jsx
        ├── services/                  ← Public API calls (no auth)
        └── admin/
            ├── components/
            │   ├── AdminLayout.jsx    ← Auth guard + admin shell
            │   └── AdminSidebar.jsx   ← Admin navigation sidebar
            ├── pages/                 ← One page per CMS module
            │   ├── AdminDashboard.jsx
            │   ├── AdminHomepage.jsx
            │   ├── AdminAbout.jsx
            │   ├── AdminCourses.jsx
            │   ├── AdminFaculty.jsx
            │   ├── AdminEvents.jsx
            │   ├── AdminGallery.jsx
            │   ├── AdminNotices.jsx
            │   ├── AdminTestimonials.jsx
            │   ├── AdminAdmissions.jsx
            │   ├── AdminContactMessages.jsx
            │   └── AdminSettings.jsx
            └── services/              ← Admin API calls (include JWT)
```

---

## 4. How the System Works

### Public website request flow

```
Visitor's browser
  → React app served by Netlify
  → fetch() to https://cnps-backend.onrender.com/api/public/...
  → Express backend on Render
  → mysql2 pool.query() to Railway MySQL
  → JSON response
  → React renders the content
```

Public endpoints (`/api/public/...`) require no authentication and return only active/approved content.

### Admin CMS flow

```
Admin browser navigates to /admin
  → AdminLayout.jsx checks localStorage for cms_token
  → If no token → redirect to /login
  → Admin submits credentials → POST /api/auth/login
  → Backend verifies password (bcrypt), returns JWT
  → Token stored: localStorage.setItem("cms_token", token)
  → All subsequent admin API calls include:
      Authorization: Bearer <token>
  → Backend authMiddleware.js verifies JWT on every protected route
  → Controller runs database query
  → Response returned to admin UI
```

### Image upload flow

```
Admin selects file in browser
  → FormData POST to /api/<resource>/:id/<upload-endpoint>
  → multer middleware: validates type + size → saves to uploads/<resource>/
  → Controller saves path to database
  → Frontend builds display URL: BACKEND_ORIGIN + stored_path
  → Browser loads image from: https://cnps-backend.onrender.com/uploads/...
```

---

## 5. Database Architecture

Database name is set via `DB_NAME` in `.env` (default: `cnps_cms`).

### All tables

| Table | Purpose |
|---|---|
| `cms_admins` | Admin user accounts |
| `password_reset_otps` | Hashed OTPs for password reset |
| `about_page` | About page content — **singleton, always id=1** |
| `about_sections` | Individual sections on the About page |
| `courses` | Course listings |
| `course_subjects` | Subjects belonging to a course |
| `course_books` | Recommended books for a course |
| `events` | School events |
| `event_images` | Gallery images for an event |
| `faculty` | Teaching staff profiles |
| `gallery` | "Why Us" section images (academic/development/campus) |
| `gallery_albums` | Photo gallery albums |
| `gallery_images` | Images inside gallery albums |
| `home_hero_slides` | Homepage hero carousel (images + videos) |
| `homepage_content` | Homepage text content — **singleton, always id=1** |
| `homepage_counts` | Animated counter statistics |
| `notices` | School notices (text/PDF/image/video) |
| `testimonials` | Student/parent testimonials |
| `admission_enquiries` | Admission applications from public |
| `contact_messages` | Contact form submissions from public |
| `site_settings` | Full site settings (footer, social, contact info) |
| `website_settings` | Basic contact settings — **singleton, always id=1** |

### Relationships (with CASCADE DELETE)

```
cms_admins ──────────────── password_reset_otps
  (admin_id FK → cms_admins.id — CASCADE DELETE)

courses ─────────────────── course_subjects
  (course_id FK → courses.id — CASCADE DELETE)

courses ─────────────────── course_books
  (course_id FK → courses.id — CASCADE DELETE)

events ──────────────────── event_images
  (event_id FK → events.id — CASCADE DELETE)

gallery_albums ──────────── gallery_images
  (album_id FK → gallery_albums.id — CASCADE DELETE)
```

Deleting a parent automatically deletes all its children.

### Important columns

| Table.Column | Type | Notes |
|---|---|---|
| `gallery.category` | ENUM | `academic`, `development`, `campus` — determines which Why Us tab shows the image |
| `notices.type` | ENUM | `text`, `image`, `pdf`, `video` |
| `home_hero_slides.media_type` | ENUM | `image`, `video` — auto-detected from file MIME type |
| `testimonials.status` | ENUM | `pending`, `approved`, `rejected` — only `approved` shown publicly |
| `about_sections.bullets` | JSON | Array of bullet point strings |
| `site_settings.footer_links` | JSON | Array of footer navigation link objects |
| `admission_enquiries.message` | TEXT | Stores the address field from the admission form |

### Singleton rows

`about_page` (id=1), `homepage_content` (id=1), and `website_settings` (id=1) always have exactly one row that gets updated in place. The auto-init system creates these rows when the tables are empty.

---

## 6. Automatic Database Initialization

**File:** `Backend/src/config/initDb.js`
**Triggered by:** `Backend/server.js` on every startup, before `app.listen()`

### What happens on startup

1. Opens a raw MySQL connection **without selecting a database**
2. Runs `CREATE DATABASE IF NOT EXISTS <DB_NAME> CHARACTER SET utf8mb4`
3. Runs `USE <DB_NAME>`
4. Runs `CREATE TABLE IF NOT EXISTS` for all 22 tables
5. Runs `ALTER TABLE ADD COLUMN` for any columns added after initial schema (catches `ER_DUP_FIELDNAME` — safe to re-run)
6. Inserts singleton seed rows (`about_page`, `homepage_content`, `website_settings`) **only if those tables are completely empty**
7. Closes the raw connection — Express `app.listen()` then runs

### Safety guarantees

| Scenario | Result |
|---|---|
| Table already exists | `CREATE TABLE IF NOT EXISTS` → silently skipped |
| Column already exists | `ALTER TABLE ADD COLUMN` → `ER_DUP_FIELDNAME` caught → skipped |
| Singleton row already exists | `COUNT(*) > 0` check → INSERT skipped |
| Existing records | Never touched — no DROP, TRUNCATE, or DELETE |
| Running 10 times in a row | Identical result — fully idempotent |

### On a completely fresh database

All 22 tables are created, singleton rows inserted. The admin account must be created once with `node createAdmin.js`.

### On an existing database with data

Only missing tables or columns are added. All existing data is preserved exactly.

### On Railway (managed MySQL)

Railway may deny `CREATE DATABASE` permission. The system detects `ER_DBACCESS_DENIED_ERROR` and continues, assuming the database is pre-created by Railway. `USE <DB_NAME>` then selects it normally.

### Adding a new column migration

Add one line to `initDb.js`:

```js
await addColIfMissing(
    conn,
    "table_name",
    "new_column",
    "VARCHAR(255) NULL DEFAULT NULL AFTER `existing_column`"
);
```

This runs automatically on the next server startup.

---

## 7. Environment Variables

### Backend — `Backend/.env`

| Variable | Required | Purpose |
|---|---|---|
| `PORT` | No | Server port (Render sets this automatically) |
| `FRONTEND_URL` | Yes | Allowed CORS origin — your Netlify URL in production |
| `DB_HOST` | Yes | MySQL host (localhost or Railway host) |
| `DB_PORT` | Yes | MySQL port (usually 3306) |
| `DB_NAME` | Yes | Database name (e.g. `cnps_cms`) |
| `DB_USER` | Yes | MySQL username |
| `DB_PASSWORD` | Yes | MySQL password |
| `JWT_SECRET` | Yes | Long random string for signing JWTs — never share |
| `JWT_EXPIRES_IN` | No | Token expiry (default: `1d`) |
| `SMTP_HOST` | Yes* | SMTP hostname (`smtp.gmail.com`) |
| `SMTP_PORT` | Yes* | SMTP port (`465`) |
| `SMTP_SECURE` | Yes* | Use TLS (`true` for port 465) |
| `SMTP_USER` | Yes* | Sending email address |
| `SMTP_PASS` | Yes* | Gmail App Password (not account password) |
| `SMTP_FROM` | No | Display name in OTP emails |

*Required only if password reset / OTP email is needed.

### Frontend — `Frontend/.env`

| Variable | Required | Purpose |
|---|---|---|
| `VITE_API_URL` | Yes | Full URL to the backend API including `/api` |

**Examples:**
- Local: `VITE_API_URL=http://localhost:5000/api`
- Production: `VITE_API_URL=https://cnps-backend.onrender.com/api`

**Never put real credentials in `.env.example`, the README, or source code.**

---

## 8. Local Development Setup

### Prerequisites

- Node.js 18 or later
- MySQL 8.0 or MariaDB 10.6+ running locally
- Git

### Backend

```bash
cd Backend
npm install
cp .env.example .env
```

Edit `Backend/.env`:

```env
PORT=5000
FRONTEND_URL=http://localhost:5173
DB_HOST=localhost
DB_PORT=3306
DB_NAME=cnps_cms
DB_USER=root
DB_PASSWORD=your_local_mysql_password
JWT_SECRET=any_long_random_string_for_local_dev
JWT_EXPIRES_IN=1d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your@gmail.com
SMTP_PASS=your_gmail_app_password
SMTP_FROM=CNPS PUBLIC SCHOOL
```

Start the backend (auto-creates database + tables on first run):

```bash
npm run dev
```

**Create the first admin account** (run once after first startup):

```bash
node createAdmin.js
```

Default credentials: `admin@cnps.com` / `Admin@12345` — change after first login.

- Backend: `http://localhost:5000`
- Health check: `http://localhost:5000/api/health`

### Frontend

```bash
cd Frontend
npm install
```

Create `Frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Admin panel: `http://localhost:5173/admin`

### Build verification

```bash
cd Frontend
npm run build
# Should complete with 0 errors
```

---

## 9. Production Deployment

### Architecture

```
Netlify (React app)
    │ HTTPS
    ▼
Render (Express backend)
    │ mysql2
    ▼
Railway (MySQL)
```

### Step 1 — Railway MySQL

1. Go to [railway.app](https://railway.app) → New Project → Add MySQL
2. After creation, click the MySQL service → **Variables** tab
3. Copy these values — you will need them on Render:
   - `MYSQL_HOST` → `DB_HOST`
   - `MYSQL_PORT` → `DB_PORT`
   - `MYSQLUSER` → `DB_USER`
   - `MYSQLPASSWORD` → `DB_PASSWORD`
   - `MYSQL_DATABASE` → `DB_NAME`

Railway creates the database automatically. All tables are created by the backend on first startup.

### Step 2 — Render Backend

1. Connect your GitHub repository → New Web Service
2. Configuration:
   - **Root Directory:** `Backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Node version:** 18+
3. Add environment variables in the Render dashboard:

```
FRONTEND_URL=https://cnpspublicschool.netlify.app
DB_HOST=<Railway public host>
DB_PORT=3306
DB_NAME=<Railway DB name>
DB_USER=<Railway DB user>
DB_PASSWORD=<Railway DB password>
JWT_SECRET=<long random string — generate with: openssl rand -hex 64>
JWT_EXPIRES_IN=1d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=<your gmail address>
SMTP_PASS=<your gmail app password>
SMTP_FROM=CNPS PUBLIC SCHOOL
```

After first deploy, create the admin account via Render Shell:

```bash
node createAdmin.js
```

### Step 3 — Netlify Frontend

1. Connect your GitHub repository → New Site
2. Configuration:
   - **Base directory:** `Frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `Frontend/dist`
3. Add environment variable:
   - `VITE_API_URL` = `https://cnps-backend.onrender.com/api`
4. Add `Frontend/public/_redirects` file for React Router SPA support:

```
/*    /index.html    200
```

---

## 10. API Documentation

All admin endpoints require header: `Authorization: Bearer <token>`

### Authentication — `/api/auth`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/login` | No | Login — returns JWT token |
| GET | `/api/auth/me` | Yes | Get current admin details |
| POST | `/api/auth/forgot-password` | No | Send OTP to admin email |
| POST | `/api/auth/verify-reset-otp` | No | Verify OTP — returns reset token |
| POST | `/api/auth/reset-password` | No | Set new password using reset token |

### Homepage — `/api/homepage`, `/api/home/hero`, `/api/homepage/counts`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/homepage` | Yes | Get homepage text content |
| PUT | `/api/homepage` | Yes | Update homepage text/stats |
| GET | `/api/home/hero` | Yes | List all hero slides |
| POST | `/api/home/hero` | Yes | Create hero slide (multipart — image/video) |
| POST | `/api/home/hero/bulk` | Yes | Upload multiple slides |
| PUT | `/api/home/hero/:id` | Yes | Update hero slide |
| DELETE | `/api/home/hero/:id` | Yes | Delete hero slide |
| GET | `/api/homepage/counts` | Yes | List all counter stats |
| POST | `/api/homepage/counts` | Yes | Create counter stat |
| PUT | `/api/homepage/counts/:id` | Yes | Update counter stat |
| DELETE | `/api/homepage/counts/:id` | Yes | Delete counter stat |
| GET | `/api/public/home/hero` | No | Public: active hero slides |
| GET | `/api/public/homepage/counts` | No | Public: active counter stats |

### About — `/api/about`, `/api/about/sections`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/about` | Yes | Get about page content |
| PUT | `/api/about` | Yes | Update about page (multipart — up to 4 images) |
| GET | `/api/about/sections` | Yes | List all about sections |
| GET | `/api/about/sections/:id` | Yes | Get single about section |
| POST | `/api/about/sections` | Yes | Create about section (with image) |
| PUT | `/api/about/sections/:id` | Yes | Update about section |
| DELETE | `/api/about/sections/:id` | Yes | Delete about section |
| GET | `/api/public/about` | No | Public: about page content |
| GET | `/api/public/about/sections` | No | Public: active about sections |

### Courses — `/api/courses`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/courses` | Yes | List all courses |
| GET | `/api/courses/:id` | Yes | Get course with subjects + books |
| POST | `/api/courses` | Yes | Create course (JSON) |
| PUT | `/api/courses/:id` | Yes | Update course + replace subjects/books |
| DELETE | `/api/courses/:id` | Yes | Delete course |
| POST | `/api/courses/:id/files` | Yes | Upload image, fee PDF, timetable PDF |
| POST | `/api/courses/:courseId/books/:bookId/image` | Yes | Upload book cover image |
| GET | `/api/public/courses` | No | Public: active courses |
| GET | `/api/public/courses/:slug` | No | Public: single course by slug |

### Faculty — `/api/faculty`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/faculty` | Yes | List all faculty |
| GET | `/api/faculty/:id` | Yes | Get single faculty member |
| POST | `/api/faculty` | Yes | Create faculty member |
| PUT | `/api/faculty/:id` | Yes | Update faculty member |
| DELETE | `/api/faculty/:id` | Yes | Delete faculty member |
| POST | `/api/faculty/:id/photo` | Yes | Upload faculty photo |
| GET | `/api/public/faculty` | No | Public: active faculty |

### Events — `/api/events`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/events` | Yes | List all events |
| GET | `/api/events/:id` | Yes | Get single event |
| POST | `/api/events` | Yes | Create event |
| PUT | `/api/events/:id` | Yes | Update event |
| DELETE | `/api/events/:id` | Yes | Delete event |
| POST | `/api/events/:id/image` | Yes | Upload event cover image |
| POST | `/api/events/:id/images` | Yes | Upload event gallery images (bulk) |
| PUT | `/api/events/images/:imageId` | Yes | Update gallery image caption/order |
| DELETE | `/api/events/images/:imageId` | Yes | Delete gallery image |
| GET | `/api/public/events` | No | Public: active events |
| GET | `/api/public/events/:slug` | No | Public: single event with gallery |

### Gallery — `/api/gallery`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/gallery` | Yes | List Why Us gallery images |
| GET | `/api/gallery/:id` | Yes | Get single gallery image |
| POST | `/api/gallery/images` | Yes | Upload Why Us images (bulk) |
| PUT | `/api/gallery/:id` | Yes | Update image metadata |
| DELETE | `/api/gallery/:id` | Yes | Delete gallery image |
| GET | `/api/public/gallery` | No | Public: active gallery albums |
| GET | `/api/public/gallery/images` | No | Public: Why Us category images |
| GET | `/api/public/gallery/:slug` | No | Public: single album by slug |

### Notices — `/api/notices`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/notices` | Yes | List all notices |
| GET | `/api/notices/:id` | Yes | Get single notice |
| POST | `/api/notices` | Yes | Create notice |
| PUT | `/api/notices/:id` | Yes | Update notice |
| DELETE | `/api/notices/:id` | Yes | Delete notice |
| POST | `/api/notices/:id/file` | Yes | Upload notice PDF or image |
| GET | `/api/public/notices` | No | Public: active notices |
| GET | `/api/public/notices/:slug` | No | Public: single notice by slug |

### Testimonials — `/api/testimonials`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/testimonials` | Yes | List all testimonials |
| GET | `/api/testimonials/:id` | Yes | Get single testimonial |
| POST | `/api/testimonials` | Yes | Create testimonial |
| PUT | `/api/testimonials/:id` | Yes | Update testimonial |
| DELETE | `/api/testimonials/:id` | Yes | Delete testimonial |
| POST | `/api/testimonials/:id/avatar` | Yes | Upload avatar photo |
| GET | `/api/public/testimonials` | No | Public: approved testimonials only |

### Settings — `/api/settings`, `/api/website-settings`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/settings` | Yes | Get full site settings |
| PUT | `/api/settings` | Yes | Update site settings |
| GET | `/api/website-settings` | Yes | Get basic website settings |
| PUT | `/api/website-settings` | Yes | Update basic website settings |
| GET | `/api/public/settings` | No | Public: site settings (for footer etc.) |

### Admissions — `/api/admission`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/admission` | No | Submit application (public form) |
| GET | `/api/admission/admin` | Yes | List all applications |
| GET | `/api/admission/admin/:id` | Yes | Get single application |
| PATCH | `/api/admission/admin/:id/status` | Yes | Update application status |
| PATCH | `/api/admission/admin/:id/notes` | Yes | Update admin notes |
| DELETE | `/api/admission/admin/:id` | Yes | Delete application |

### Contact — `/api/contact`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/contact` | No | Submit contact message (public form) |
| GET | `/api/contact/admin` | Yes | List all messages |
| GET | `/api/contact/admin/:id` | Yes | Get message (auto-marks as read) |
| PATCH | `/api/contact/admin/:id/status` | Yes | Update message status |
| PATCH | `/api/contact/admin/:id/read` | Yes | Mark as read |
| DELETE | `/api/contact/admin/:id` | Yes | Delete message |

### Health Check

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/health` | No | Verify server and database are running |

---

## 11. Admin Panel Documentation

Access: `https://cnpspublicschool.netlify.app/admin`

| Module | Path | Frontend File | Backend Routes | Database Tables |
|---|---|---|---|---|
| Dashboard | `/admin` | `AdminDashboard.jsx` | — | — |
| Homepage | `/admin/homepage` | `AdminHomepage.jsx` | `/api/homepage`, `/api/home/hero`, `/api/homepage/counts` | `homepage_content`, `home_hero_slides`, `homepage_counts` |
| About | `/admin/about` | `AdminAbout.jsx` | `/api/about`, `/api/about/sections` | `about_page`, `about_sections` |
| Courses | `/admin/courses` | `AdminCourses.jsx` | `/api/courses` | `courses`, `course_subjects`, `course_books` |
| Faculty | `/admin/faculty` | `AdminFaculty.jsx` | `/api/faculty` | `faculty` |
| Events | `/admin/events` | `AdminEvents.jsx` | `/api/events` | `events`, `event_images` |
| Gallery | `/admin/gallery` | `AdminGallery.jsx` | `/api/gallery` | `gallery`, `gallery_albums`, `gallery_images` |
| Notices | `/admin/notices` | `AdminNotices.jsx` | `/api/notices` | `notices` |
| Testimonials | `/admin/testimonials` | `AdminTestimonials.jsx` | `/api/testimonials` | `testimonials` |
| Admissions | `/admin/admissions` | `AdminAdmissions.jsx` | `/api/admission/admin` | `admission_enquiries` |
| Contact Messages | `/admin/contact-messages` | `AdminContactMessages.jsx` | `/api/contact/admin` | `contact_messages` |
| Settings | `/admin/settings` | `AdminSettings.jsx` | `/api/settings`, `/api/website-settings` | `site_settings`, `website_settings` |

**Notes:**
- Homepage module manages three separate data sources: general text, hero slides, and counter stats
- Gallery module manages two systems: the "Why Us" section images (main `gallery` table, categorised by academic/development/campus) and the photo album gallery (`gallery_albums` + `gallery_images`)
- Testimonials: only records with status `approved` are shown on the public website
- Admission applications cannot be created from the admin panel — they come from the public form only

---

## 12. Authentication & Security

### JWT authentication

1. Admin submits email + password to `POST /api/auth/login`
2. Backend queries `cms_admins`, verifies password with `bcrypt.compare()`
3. On success, signs a JWT: `{ id, email, role }` with `JWT_SECRET`, expiry `JWT_EXPIRES_IN`
4. Frontend stores token: `localStorage.setItem("cms_token", token)`
5. Every admin API call includes: `Authorization: Bearer <token>`
6. `authMiddleware.js` calls `jwt.verify(token, JWT_SECRET)` on every protected route

### Password reset (OTP flow)

1. `POST /api/auth/forgot-password` → generates 6-digit OTP, bcrypt-hashes it, stores in `password_reset_otps` with 10-minute expiry, sends plain OTP by email
2. `POST /api/auth/verify-reset-otp` → verifies OTP hash, returns a 10-minute `resetToken` JWT (purpose: `password-reset`)
3. `POST /api/auth/reset-password` → verifies `resetToken`, hashes new password (bcrypt cost 12), updates `cms_admins`, marks OTP as used

**OTP security:** max 5 failed attempts, 10-minute expiry, previous unused OTPs deleted on new request.

### Password storage

All passwords hashed with bcryptjs at cost factor 12. Plain-text passwords never stored or logged.

### Protected routes

Every admin route uses `protect` from `authMiddleware.js`. Missing or invalid tokens return `401 Unauthorized`.

### File upload security

Each upload middleware (one per resource) validates:
- Allowed MIME types (e.g. `image/jpeg`, `image/png`, `image/webp`)
- Maximum file size per file type
- Files are renamed to `timestamp-random.ext` preventing path traversal

### CORS

Only the origin in `FRONTEND_URL` is allowed. Other origins receive a CORS error.

### HTTP headers

Helmet.js applies security headers. `crossOriginResourcePolicy: cross-origin` allows the Netlify frontend to load images served by the Render backend.

### What is never exposed to clients

- Passwords or bcrypt hashes
- JWT_SECRET value
- SMTP credentials
- OTP values (only the hash is stored)
- Internal database error details (logged server-side only)

---

## 13. File & Image Upload System

### Storage

All uploads stored on the Render server at `Backend/uploads/` and served as static files at `/uploads/*`.

### Path storage

Paths stored in the database as strings like `/uploads/faculty/1789150462137-267789781.jpeg`.

The frontend builds full URLs:
```js
const API_ORIGIN = "https://cnps-backend.onrender.com";
const imageUrl   = API_ORIGIN + row.photo; // → https://cnps-backend.onrender.com/uploads/faculty/...
```

### File type and size limits

| Resource | Allowed types | Max size |
|---|---|---|
| Course image | JPG, PNG, WEBP | 20 MB |
| Course PDF (fee/timetable) | PDF | 20 MB |
| Faculty photo | JPG, PNG, WEBP | 20 MB |
| Hero slide | JPG, PNG, WEBP, MP4, WEBM | 100 MB |
| About images | JPG, PNG, WEBP | 20 MB |
| Gallery images | JPG, PNG, WEBP | 20 MB |
| Notice file | JPG, PNG, WEBP, PDF | 20 MB |
| Testimonial avatar | JPG, PNG, WEBP | 20 MB |

### File deletion

When a database record is deleted, the physical file is deleted too. When a file is replaced, the old file is deleted before the new one is saved.

### ⚠️ Production limitation: Render ephemeral filesystem

Render's free tier does not persist the filesystem across deploys or restarts. **Uploaded images will be lost when Render redeploys the service.**

To solve this in production, migrate file storage to:
- **Cloudinary** (recommended, free tier available)
- **AWS S3**
- **Render Persistent Disk** (paid Render add-on)

This requires updating the upload middleware to push files to the chosen service. The database column stores the cloud URL instead of a local path.

---

## 14. Common Problems & Solutions

### Database connection failed on startup

**Symptom:** Backend exits immediately with `SERVER STARTUP FAILED`

1. Verify `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` in `.env`
2. Confirm MySQL / Railway is running and reachable
3. On Railway: use the **public** hostname (not `mysql.railway.internal` unless Render is in the same Railway project)
4. Test connection: `mysql -h <DB_HOST> -P <DB_PORT> -u <DB_USER> -p`
5. Check Render logs for the full error message

**Code location:** `Backend/src/config/initDb.js` — connection error thrown with full checklist.

---

### Table does not exist error

**Symptom:** API returns 500 with MySQL error about unknown table

The auto-init system creates all tables on startup. **Restart the Render service** — this triggers `initDb.js` and creates any missing tables.

If it persists: verify `DB_NAME` is correct and the DB user has `CREATE TABLE` permission.

---

### Column does not exist error

**Symptom:** API returns 500 with `Unknown column 'xxx'`

1. Add `addColIfMissing()` call to `Backend/src/config/initDb.js` for the missing column
2. Redeploy — column is added on startup

---

### CORS error in browser

**Symptom:** `Access-Control-Allow-Origin` error in browser console

1. Check `FRONTEND_URL` on Render — must be the exact Netlify URL with no trailing slash
   Example: `FRONTEND_URL=https://cnpspublicschool.netlify.app`
2. After changing env vars on Render, trigger a manual redeploy

**Code location:** `Backend/src/app.js` — CORS config

---

### Admin login not working

1. Was the admin account created? Run `node createAdmin.js` on the server
2. Is `JWT_SECRET` set on Render?
3. Does the `cms_admins` table exist in Railway?
4. Open browser → DevTools → Network → check the login request response body
5. Is `VITE_API_URL` on Netlify pointing to the correct Render URL?

---

### OTP email not arriving

1. Set `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=465`, `SMTP_SECURE=true`
2. `SMTP_PASS` must be a **Gmail App Password** — not your Google account password
   - Enable 2-Step Verification on Google account
   - Generate App Password at: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Check spam/junk folder
4. Check Render logs for the Nodemailer error

**Code location:** `Backend/src/utils/emailService.js`

---

### Images not showing on frontend

1. Is `VITE_API_URL` correct? The frontend prepends backend origin to image paths
2. On Render free tier: images uploaded before the last redeploy are lost (ephemeral filesystem)
3. Check browser Network tab — is the image request returning 404?

---

### Frontend 404 on direct URL navigation

Add `Frontend/public/_redirects`:
```
/*    /index.html    200
```
This tells Netlify to always serve `index.html`, letting React Router handle the path.

---

### Backend 500 errors on production

1. Open Render → your service → **Logs** tab
2. Look for error and stack trace
3. Common causes: missing env variable, DB connection issue, missing column, code bug

---

### Railway connection/authentication error

1. Copy credentials fresh from Railway dashboard → MySQL service → Variables tab
2. Use Railway's **public** hostname in `DB_HOST`, not internal hostname

---

### Works locally but fails on Render

1. Are all env variables set on Render? (DB_*, JWT_SECRET, SMTP_*, FRONTEND_URL)
2. Root directory must be `Backend`, start command `npm start`
3. Check Render logs for startup errors — look for `SERVER STARTUP FAILED`

---

### Works on Render but frontend cannot connect

1. Is `VITE_API_URL` on Netlify set to Render URL + `/api`?
2. Trigger a Netlify redeploy after adding the variable
3. Is the Render service sleeping? Free tier sleeps after 15 min of inactivity

---

### Troubleshooting decision tree

```
Website not opening
  → Check Netlify deploy status and build logs

Frontend opens, API calls fail
  → Check Render service status
  → Verify VITE_API_URL in Netlify environment variables

API returns 500 (database errors)
  → Check Railway status
  → Verify DB_* env vars on Render
  → Restart Render (triggers auto-init for missing tables)

Admin login fails
  → Run: node createAdmin.js
  → Verify JWT_SECRET is set on Render
  → Check cms_admins table exists in Railway

Images broken / not loading
  → Verify VITE_API_URL (frontend needs correct backend origin)
  → Render ephemeral filesystem — images lost after redeploy

OTP email not arriving
  → Verify SMTP_* env vars (Gmail App Password required)
  → Check spam folder

Table/column missing error
  → Restart Render — auto-init runs on every startup

CORS error
  → Set FRONTEND_URL on Render to exact Netlify URL (no trailing slash)
```

---

## 15. How to Debug

### Browser DevTools

- **Console:** JavaScript errors, React warnings, failed network requests
- **Network → XHR/Fetch:** Every API call — check URL, method, status, request body, response body
- **Application → Local Storage:** Check `cms_token` (JWT) and `cms_admin` (admin info)

### Backend logs

Morgan logs every HTTP request. All errors are logged with `console.error`.

On Render: Dashboard → your service → **Logs** tab.
Look for lines starting with `Backend Error:` or `❌`.

### Useful diagnostic commands (safe — read only)

```bash
# Is the backend responding?
curl https://cnps-backend.onrender.com/api/health

# Test a public endpoint
curl https://cnps-backend.onrender.com/api/public/home/hero

# Verify backend imports locally
node --input-type=module --eval "import './src/app.js'"

# Verify initDb imports locally
node --input-type=module --eval "import './src/config/initDb.js'; console.log('OK')"

# Frontend build test
cd Frontend && npm run build
```

---

## 16. Database Backup & Recovery

### Export (backup)

```bash
mysqldump -h <DB_HOST> -P <DB_PORT> -u <DB_USER> -p <DB_NAME> \
  > cnps_backup_$(date +%Y%m%d_%H%M).sql
```

### Import (restore)

```bash
mysql -h <DB_HOST> -P <DB_PORT> -u <DB_USER> -p <DB_NAME> \
  < cnps_backup_20250914_1200.sql
```

### What to back up

- Full database export (all 22 tables + all data)
- `Backend/uploads/` directory (if using Render local filesystem)

### Railway backups

Railway MySQL includes automated daily backups on paid plans. Verify your Railway plan.

### NEVER run without a verified backup

```sql
DROP DATABASE cnps_cms;    -- destroys everything
DROP TABLE courses;        -- destroys all course data
TRUNCATE TABLE faculty;    -- empties faculty table
```

---

## 17. Development Rules

1. Never hardcode secrets in source code — always use environment variables
2. Never commit `.env` to git — it contains real credentials
3. Always use `addColIfMissing()` for new schema columns — never manually ALTER production
4. Always test backend startup locally before deploying
5. Always run `npm run build` and fix all errors before deploying frontend
6. Use a different `JWT_SECRET` in production than in development
7. The `createAdmin.js` default password (`Admin@12345`) must be changed immediately in production
8. When adding a feature, update the README (sections 5, 10, 11)
9. Never run destructive SQL (DROP, TRUNCATE) on the production database without a backup

---

## 18. Adding a New Feature

### Recommended workflow

**1. Database**
Define columns. Add `CREATE TABLE IF NOT EXISTS` to `initDb.js`.

**2. Controller**
Create `Backend/src/controllers/<resource>Controller.js` with handler functions.

**3. Upload middleware** (if needed)
Create `Backend/src/middleware/<resource>UploadMiddleware.js` with multer + type/size validation.

**4. Routes**
Create `Backend/src/routes/<resource>Routes.js`. Apply `protect` to all admin routes.

**5. Register routes**
Add `app.use("/api/<resource>", <resource>Routes)` in `Backend/src/app.js`.

**6. Frontend admin service**
Create `Frontend/src/admin/services/admin<Resource>Service.js` — all fetch functions include `Authorization: Bearer <token>`.

**7. Admin page**
Create `Frontend/src/admin/pages/Admin<Resource>.jsx`.

**8. Register admin route**
Add inside the `<Route element={<AdminLayout />}>` group in `Frontend/src/App.jsx`.

**9. Add to sidebar**
Add link to `Frontend/src/admin/components/AdminSidebar.jsx`.

**10. Public page** (if publicly visible)
Create service + page, add to `MainLayout` routes in `App.jsx`.

**11. Update README**
Add table to Section 5, endpoints to Section 10, module to Section 11.

---

## 19. Adding or Changing Database Tables

### Adding a new column

```js
// In Backend/src/config/initDb.js
await addColIfMissing(
    conn,
    "table_name",
    "new_column_name",
    "VARCHAR(255) NULL DEFAULT NULL AFTER `existing_column`"
);
```

Deploy → column added automatically on next startup.

### Adding a new table

Add a full `CREATE TABLE IF NOT EXISTS` block in `initDb.js` following the existing pattern. Place it in logical order (parent tables before child tables).

### Renaming a column (safe approach)

1. Take a database backup
2. Add new column with `addColIfMissing()`
3. In a one-time migration, copy data: `UPDATE table SET new_col = old_col WHERE new_col IS NULL`
4. Update all controllers to use the new column name
5. After confirming production is working, manually drop the old column

### Never do on production without a backup

```sql
ALTER TABLE xxx DROP COLUMN yyy;  -- permanent data loss
DROP TABLE xxx;                   -- permanent data loss
TRUNCATE TABLE xxx;               -- permanent data loss
```

---

## 20. Deployment Checklist

### Before every deployment

- [ ] `node --input-type=module --eval "import './src/app.js'"` passes (Backend/)
- [ ] `npm run build` completes with 0 errors (Frontend/)
- [ ] No `.env` or secrets committed to git
- [ ] New env variables added to `.env.example`

### Render (Backend)

- [ ] All env variables set: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `SMTP_*`, `FRONTEND_URL`
- [ ] Root directory: `Backend` | Start command: `npm start`
- [ ] Logs show `🎉 Database initialization complete` on startup
- [ ] `GET /api/health` returns `{ "success": true, "database": "Connected ✅" }`

### Netlify (Frontend)

- [ ] `VITE_API_URL` = full Render URL + `/api`
- [ ] Build command: `npm run build` | Publish directory: `Frontend/dist`
- [ ] `Frontend/public/_redirects` file present with `/* /index.html 200`
- [ ] Admin login tested after deploy

### Railway (Database)

- [ ] MySQL service running
- [ ] Credentials match what is set on Render
- [ ] After first deploy: all 22 tables present in Railway console

---

## 21. Project URLs

| Resource | URL |
|---|---|
| Public Website | https://cnpspublicschool.netlify.app |
| Admin Panel | https://cnpspublicschool.netlify.app/admin |
| Backend API base | https://cnps-backend.onrender.com/api |
| Backend health check | https://cnps-backend.onrender.com/api/health |
| Database | Railway MySQL — credentials in Render environment variables |

---

## 22. Important File Reference Map

| Function | File |
|---|---|
| Backend entry point | `Backend/server.js` |
| Express app (routes + middleware) | `Backend/src/app.js` |
| MySQL connection pool | `Backend/src/config/db.js` |
| **Auto DB initialization** | **`Backend/src/config/initDb.js`** |
| JWT protect middleware | `Backend/src/middleware/authMiddleware.js` |
| Login + OTP + password reset | `Backend/src/controllers/authController.js` |
| OTP email sending | `Backend/src/utils/emailService.js` |
| Create first admin account | `Backend/createAdmin.js` |
| Auth routes | `Backend/src/routes/authRoutes.js` |
| Homepage text | `Backend/src/controllers/homepageController.js` |
| Hero slides | `Backend/src/controllers/heroController.js` |
| Homepage counts | `Backend/src/controllers/homepageCountsController.js` |
| About page | `Backend/src/controllers/aboutController.js` |
| About sections | `Backend/src/controllers/aboutSectionsController.js` |
| Courses | `Backend/src/controllers/courseController.js` |
| Course file upload | `Backend/src/controllers/courseFileController.js` |
| Course book image | `Backend/src/controllers/courseBookImageController.js` |
| Faculty | `Backend/src/controllers/facultyController.js` |
| Faculty photo upload | `Backend/src/controllers/facultyFileController.js` |
| Events | `Backend/src/controllers/eventController.js` |
| Event gallery | `Backend/src/controllers/eventGalleryController.js` |
| Why Us gallery | `Backend/src/controllers/galleryController.js` |
| Gallery albums/images | `Backend/src/controllers/galleryImageController.js` |
| Gallery album cover | `Backend/src/controllers/galleryCoverController.js` |
| Notices | `Backend/src/controllers/noticeController.js` |
| Notice file upload | `Backend/src/controllers/noticeFileController.js` |
| Testimonials | `Backend/src/controllers/testimonialController.js` |
| Testimonial avatar upload | `Backend/src/controllers/testimonialAvatarController.js` |
| Admissions | `Backend/src/controllers/admissionController.js` |
| Contact messages | `Backend/src/controllers/contactMessagesController.js` |
| Site settings | `Backend/src/controllers/settingsController.js` |
| Website settings | `Backend/src/controllers/websiteSettingsController.js` |
| All React routes | `Frontend/src/App.jsx` |
| Admin auth guard + layout | `Frontend/src/admin/components/AdminLayout.jsx` |
| Admin sidebar navigation | `Frontend/src/admin/components/AdminSidebar.jsx` |
| Admin login service | `Frontend/src/admin/services/authService.js` |
| Public website CSS | `Frontend/src/assets/css/main.css` |
| Swiper/AOS/GLightbox init | `Frontend/src/hooks/useTemplateFeatures.js` |

---

## 23. Maintenance Notes

Use this section to record significant changes so future developers have context.

| Date | Change | Schema changes | Files modified | Deployment notes |
|---|---|---|---|---|
| 2025-09-14 | Added automatic database initialization system — all 22 tables defined in code, server now creates DB/tables on startup | All 22 tables | `Backend/src/config/initDb.js` (new), `Backend/server.js` (startup order), `Backend/.env.example` (updated) | Restart Render after deploy — tables created automatically on startup |

---

*This README is based on direct inspection of the actual project source code. All API endpoints, table structures, file locations, and configuration values reflect the real implementation as of the date above.*
