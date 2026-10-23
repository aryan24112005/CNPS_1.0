# CNPS Public School — Media Library Guide

## 1. Where Media is Stored

All uploaded files are stored in **Cloudinary** under the folder `cnps/media/`.  
Metadata (filename, URL, MIME type, file size, upload date) is saved in the MongoDB collection **`media`** via the `Media` model.

The Media Library is a **standalone asset pool** — uploading a file here does **not** automatically publish it anywhere on the website. Files must be explicitly assigned to a content record (course, event, faculty profile, etc.) to appear publicly.

---

## 2. How Media URLs Are Generated

1. A file is uploaded via the admin panel (`POST /api/media`).
2. The file buffer is streamed to Cloudinary using the `uploadMediaLibraryFile` helper.
3. Cloudinary returns a permanent `secure_url` (HTTPS) and `public_id`.
4. Both are stored in the `Media` MongoDB document.
5. The URL is always an absolute Cloudinary HTTPS URL — no local paths are stored.

---

## 3. How to Upload Files

**Via the Admin Panel:**
1. Go to **Admin → Media Library**.
2. Click **Upload** (top right).
3. Select one or more files (JPEG, PNG, WebP images or PDFs; max 20 MB each).
4. The files upload immediately and appear in the grid.

**Via API (for programmatic uploads):**
```
POST /api/media
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
Body: file=<file>
```

---

## 4. How to Select Media for Supported Content

The Media Library is currently a **view-only asset store** — you can see all uploaded files and their URLs. To use a media file with content:

1. Find the file in the Media Library grid.
2. **Copy its URL** by right-clicking the image or hovering to see the full URL in the browser.
3. When editing a course, event, faculty member, or other content, use the dedicated upload button in that section's form to upload (or re-upload) the image.

> **Future enhancement:** A "Select from Media Library" picker can be added to content forms to allow directly selecting an already-uploaded file without re-uploading.

---

## 5. Where Each Content Type Appears on the Public Website

| Content Type       | Admin Section           | Public URL / Page                    |
|--------------------|-------------------------|--------------------------------------|
| Hero Slides        | Homepage → Hero Slides  | Homepage (auto-rotating banner)      |
| About Image        | Homepage → Content      | Homepage About section               |
| Statistics         | Homepage → Content      | Homepage stats strip (dark navy)     |
| Course Images      | Courses                 | `/courses` card grid, `/courses/:slug` |
| Faculty Photos     | Faculty                 | `/trainers` page, Homepage Faculty section |
| Event Cover Images | Events                  | `/events` listing, `/events/:slug`   |
| Event Gallery      | Events (per event)      | `/events/:slug` gallery section      |
| Gallery Albums     | Gallery                 | `/gallery` albums, individual album pages |
| Notice Files       | Notices                 | `/notices` listing, `/notices/:slug` |
| Testimonial Avatars| Testimonials            | Homepage Testimonials section        |
| Site Logo/Favicon  | Settings                | Navigation header, browser tab       |
| Media Library      | Media (standalone)      | Not displayed automatically — must be assigned |

---

## 6. How to Troubleshoot Missing Images

### Image not showing in the admin panel table:
- **Root cause:** The backend stores images as `{ url, publicId }` objects. The frontend must read `item.image?.url`, `item.photo?.url`, or `item.coverImage?.url` — not `item.image` directly.
- **Fixed in:** `AdminCourses.jsx`, `AdminFaculty.jsx`, `AdminEvents.jsx`.

### Image shows in admin but not on the public site:
- Check that the record's `status` is `"active"` (not `"inactive"`).
- The public API endpoints filter by `{ status: "active" }`.

### Image URL is broken (404 or missing):
- The file may have been deleted from Cloudinary but the DB record still exists.
- Verify by opening the URL directly in a browser.
- Re-upload the image via the content's edit form.

### New upload not appearing immediately after save:
- The upload happens in a separate step after the record is created.
- After uploading, the admin list refreshes automatically via `onSaved()` / `loadCourses()`.
- If the image still doesn't appear, reload the page — the data is in the DB.

### Media Library shows only 30 files:
- **Fixed:** The media library now supports pagination (30 files per page) with Previous/Next buttons.

### Cloudinary not configured:
- Ensure `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` are set in the backend `.env` (or Render environment variables).
- The server logs a warning at startup if Cloudinary is not configured.
