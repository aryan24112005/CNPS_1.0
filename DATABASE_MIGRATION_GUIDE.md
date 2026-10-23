# CNPS Public School — Database Migration Guide
## MongoDB → MySQL (Hostinger)

---

## 1. Old and New Database Architecture

| | Current (MongoDB) | New (MySQL) |
|---|---|---|
| Database engine | MongoDB Atlas / self-hosted | MySQL / MariaDB |
| ORM / driver | Mongoose | Sequelize + mysql2 |
| Hosting | MongoDB Atlas (cloud) | Hostinger MySQL |
| Backend runtime | Node.js / Express (Render) | Node.js / Express (Hostinger Business+) |

**Important:** Hostinger shared hosting supports **MySQL only** (not PostgreSQL, not MongoDB). Node.js application hosting is available on **Business** plans and above.

---

## 2. SQL Schema

The full schema is at `backend/src/config/sql/schema.sql`.

### Tables

| Table | Description |
|---|---|
| `admins` | Administrator accounts (bcrypt passwords preserved) |
| `site_settings` | School name, contact info, logos, social links |
| `hero_slides` | Homepage banner slides |
| `homepage_content` | About section, Why Choose Us, CTA text |
| `count_stats` | Statistics counters (FK → homepage_content) |
| `faculty` | Teacher/staff profiles |
| `courses` | Course listings |
| `course_books` | Books per course (FK → courses) |
| `events` | School events |
| `event_gallery` | Event gallery images (FK → events) |
| `gallery_albums` | Photo gallery albums |
| `gallery_images` | Images per album (FK → gallery_albums) |
| `notices` | Announcements and notices |
| `testimonials` | Parent/student testimonials |
| `media` | Media library files |
| `admission_enquiries` | Admission form submissions |
| `contact_messages` | Contact form submissions |

### Key design decisions

- All image fields are stored as two columns: `_url` (Cloudinary HTTPS URL) and `_public_id` (for deletion). No image binary data is stored in SQL.
- MongoDB subdocument arrays (gallery, books, countStats) become child tables with foreign keys.
- Slug fields are unique, generated from titles at migration time.
- Timestamps use MySQL `DATETIME` (`created_at`, `updated_at`).
- JSON fields (subjects, aboutPoints, tags) use MySQL JSON columns (compatible with MySQL 5.7.8+ and MariaDB 10.2+).

---

## 3. Required Environment Variables

### Backend (add to Render or Hostinger environment):

```env
# MySQL connection (Hostinger provides these when you create a database)
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=your_db_user
MYSQL_PASS=your_db_password
MYSQL_DB=your_db_name

# Keep existing variables:
JWT_SECRET=...
JWT_EXPIRES_IN=1d
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
FRONTEND_URL=https://cnpspublicschool.netlify.app
```

> **Remove** `MONGODB_URI` after migration is confirmed.  
> **Keep** `MONGODB_URI` during the transition period.

---

## 4. How to Create the Target Database

### On Hostinger (hPanel):

1. Log into your Hostinger control panel (hPanel).
2. Go to **Hosting → Manage → Databases → MySQL Databases**.
3. Create a new database (e.g., `cnps_school`).
4. Create a database user and assign it **all privileges** on the new database.
5. Note the host, port, username, password, and database name.

### Run the schema:

```bash
# From your local machine (requires MySQL client installed):
mysql -h HOST -P 3306 -u USER -p cnps_school < backend/src/config/sql/schema.sql

# Or on Hostinger via phpMyAdmin:
# Database → Import → select schema.sql → Go
```

---

## 5. How to Export or Access MongoDB Source Data

The migration script reads directly from MongoDB using the same `MONGODB_URI` in your `.env`. No manual export is needed.

If you want a manual backup first:

```bash
# Export all collections to JSON (requires mongodump):
mongodump --uri="$MONGODB_URI" --out=./mongo-backup

# Or export to JSON using mongoexport (one collection at a time):
mongoexport --uri="$MONGODB_URI" --collection=courses --out=courses.json
```

---

## 6. How to Run a Dry Run

A dry run reads all MongoDB records and counts them but does **not** write anything to MySQL.

```bash
cd backend
node scripts/migration/mongo-to-mysql.js --dry-run
```

Expected output:

```
CNPS MongoDB → MySQL Migration
Mode: DRY RUN (no writes)

Connecting to MongoDB…
  ✓ MongoDB connected

Migrating 2 admin(s)…
Migrating 1 site settings…
...

Migration Summary
────────────────────────────────────────────────────────────────────────
Collection                   Source    Migrated      Skipped   Failed
────────────────────────────────────────────────────────────────────────
admins                       2         2             0         0
...

DRY RUN complete — no records were written to MySQL.
```

---

## 7. How to Execute the Migration

**Prerequisites:**
- MySQL database created and schema applied (step 4).
- `.env` contains both `MONGODB_URI` and all `MYSQL_*` variables.

```bash
cd backend

# First: dry run to verify counts
node scripts/migration/mongo-to-mysql.js --dry-run

# Then: live migration
node scripts/migration/mongo-to-mysql.js
```

The script uses `INSERT IGNORE` — if a record already exists (matched by primary key) it is skipped. Re-running is safe.

---

## 8. How to Verify Record Counts and Relationships

After migration, verify counts match:

```sql
-- Example spot checks:
SELECT COUNT(*) FROM admins;
SELECT COUNT(*) FROM courses;
SELECT COUNT(*) FROM faculty;
SELECT COUNT(*) FROM events;
SELECT COUNT(*) FROM testimonials;

-- Verify foreign key integrity:
SELECT e.title, COUNT(g.id) AS gallery_count
FROM events e
LEFT JOIN event_gallery g ON g.event_id = e.id
GROUP BY e.id;

SELECT c.title, COUNT(b.id) AS book_count
FROM courses c
LEFT JOIN course_books b ON b.course_id = c.id
GROUP BY c.id;
```

Compare these counts against the migration summary output.

---

## 9. How to Roll Back Safely

**The MongoDB database is never modified** by the migration script. Rolling back means:

1. Stop the SQL-backend deployment.
2. Redeploy the MongoDB-backend version (original code).
3. Point `MONGODB_URI` back to the original connection string.

Do not drop the MySQL database until the SQL backend has been running in production for at least 30 days without issues.

---

## 10. How to Deploy the Migrated Application

### Option A: Hostinger Business+ (Node.js)

1. Create a Node.js app in Hostinger hPanel → **Node.js**.
2. Upload the `backend/` directory (without `node_modules`).
3. Set the entry point to `src/server.js`.
4. Add all environment variables via the hPanel environment editor.
5. Run `npm install` via the Hostinger terminal or hPanel.
6. Start the app.

**Hostinger limitations to know:**
- Only MySQL is available as a managed database on shared plans.
- Outbound SMTP (port 587) may be blocked — use the Gmail API transport (already configured).
- File system writes are ephemeral; always use Cloudinary for image storage (already configured).

### Option B: Continue on Render (current)

The existing backend can be updated to use MySQL instead of MongoDB by swapping the database layer. The backend code structure stays the same; only the controllers and models need to point to the SQL versions.

> **Note:** Implementing the full SQL-backed controllers is a multi-day effort. The migration script and schema are ready. The next step is to refactor each controller to use Sequelize queries instead of Mongoose queries, then test end-to-end before deploying.

### Current status

| Component | Status |
|---|---|
| SQL schema (`schema.sql`) | ✅ Ready |
| Sequelize models (`src/models/sql/index.js`) | ✅ Ready |
| Migration script (`scripts/migration/mongo-to-mysql.js`) | ✅ Ready |
| SQL-backed controllers | 🔲 Not yet implemented (MongoDB controllers still in use) |
| Production deployment | 🔲 Blocked — requires controller refactor and end-to-end testing |

The production system currently runs on MongoDB. Do not switch to MySQL in production until the controller refactor is complete and all features have been tested against the SQL database.
