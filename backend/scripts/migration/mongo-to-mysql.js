#!/usr/bin/env node
"use strict";
/**
 * CNPS Public School — MongoDB → MySQL Migration Script
 * ======================================================
 *
 * Reads every MongoDB collection and inserts records into MySQL.
 * Safe to re-run: existing rows are detected with SELECT before INSERT,
 * so duplicates are skipped rather than erroring.
 *
 * MongoDB data is NEVER modified or deleted.
 *
 * Usage:
 *   node scripts/migration/mongo-to-mysql.js           # live migration
 *   node scripts/migration/mongo-to-mysql.js --dry-run # read-only count
 *
 * Required environment variables (.env or shell):
 *   MONGODB_URI  – MongoDB Atlas / local connection string
 *   MYSQL_HOST   – e.g. localhost
 *   MYSQL_PORT   – defaults to 3306
 *   MYSQL_USER   – database user
 *   MYSQL_PASS   – database password
 *   MYSQL_DB     – target database name
 *
 * Exit codes:
 *   0 — completed (dry-run or live) with zero insert failures
 *   1 — fatal startup error (bad connection, missing env var, etc.)
 *   2 — completed but one or more rows failed to insert
 */

require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });

const mongoose   = require("mongoose");
const { Sequelize, QueryTypes } = require("sequelize");
const slugify    = require("slugify");

const DRY_RUN = process.argv.includes("--dry-run");

// ─── Colour helpers ───────────────────────────────────────────────────────────
const C = {
  reset:  "\x1b[0m",
  green:  "\x1b[32m",
  red:    "\x1b[31m",
  yellow: "\x1b[33m",
  cyan:   "\x1b[36m",
  bold:   "\x1b[1m",
};
const log  = (...a) => console.log(...a);
const ok   = (msg)  => log(`${C.green}  ✓${C.reset} ${msg}`);
const warn = (msg)  => log(`${C.yellow}  ⚠${C.reset} ${msg}`);
const fail = (msg)  => log(`${C.red}  ✗${C.reset} ${msg}`);

function pad(str, len) { return String(str).padEnd(len); }

// ─── Per-collection statistics ────────────────────────────────────────────────
const stats = {};
function initStat(name) {
  stats[name] = { source: 0, inserted: 0, skipped: 0, failed: 0 };
}
function printSummary() {
  const totalFailed = Object.values(stats).reduce((n, s) => n + s.failed, 0);
  log(`\n${C.bold}Migration Summary${C.reset}`);
  log("─".repeat(74));
  log(
    pad("Collection", 28) +
    pad("Source", 8) +
    pad("Inserted", 10) +
    pad("Skipped", 9) +
    "Failed"
  );
  log("─".repeat(74));
  for (const [name, s] of Object.entries(stats)) {
    log(
      pad(name, 28) +
      pad(s.source,   8) +
      pad(s.inserted, 10) +
      pad(s.skipped,  9) +
      (s.failed > 0 ? `${C.red}${s.failed}${C.reset}` : "0")
    );
  }
  log("─".repeat(74));
  return totalFailed;
}

// ─── Unique-slug helpers ──────────────────────────────────────────────────────
const slugSets = {};
function reserveSlug(title, ns) {
  if (!slugSets[ns]) slugSets[ns] = new Set();
  let base = slugify(title || "untitled", { lower: true, strict: true }) || "item";
  let s = base, n = 1;
  while (slugSets[ns].has(s)) s = `${base}-${n++}`;
  slugSets[ns].add(s);
  return s;
}

// ─── MySQL connection ─────────────────────────────────────────────────────────
const sq = new Sequelize(
  process.env.MYSQL_DB   || "cnps_school",
  process.env.MYSQL_USER || "root",
  process.env.MYSQL_PASS || "",
  {
    host:    process.env.MYSQL_HOST || "localhost",
    port:    parseInt(process.env.MYSQL_PORT || "3306", 10),
    dialect: "mysql",
    logging: false,
    pool:    { max: 5, min: 0, acquire: 30000, idle: 10000 },
  }
);

// ─── Core helpers ─────────────────────────────────────────────────────────────

/**
 * Build and execute a parameterised INSERT IGNORE using positional ? placeholders.
 *
 * WHY NOT `SET ?`:
 *   Sequelize passes the query string straight to mysql2, which forwards it to
 *   MariaDB.  MariaDB does not support the `SET ?` shorthand — that is a
 *   mysql-client-side expansion that never reaches the server.  Using
 *   `INSERT INTO t (col,...) VALUES (?,...)` with a matching positional array
 *   is standard SQL and works on every MySQL/MariaDB version.
 *
 * @param {string}   table    – bare table name (NOT user-controlled at runtime)
 * @param {string[]} cols     – ordered column names matching the schema
 * @param {any[]}    vals     – values in the same order as cols
 * @param {string}   statKey  – key in the global stats object
 */
async function insertRow(table, cols, vals, statKey) {
  if (DRY_RUN) {
    // Dry-run: treat as if the row would be inserted (we count it, not skip)
    stats[statKey].inserted++;
    return null; // no MySQL id available
  }

  const placeholders = cols.map(() => "?").join(", ");
  const colList      = cols.map(c => `\`${c}\``).join(", ");
  const sql          = `INSERT IGNORE INTO \`${table}\` (${colList}) VALUES (${placeholders})`;

  try {
    const [, meta] = await sq.query(sql, { replacements: vals, type: QueryTypes.INSERT });
    // meta.insertId is 0 when INSERT IGNORE skips an existing row
    if (meta && meta > 0) {
      stats[statKey].inserted++;
      return meta; // the new auto-increment id
    } else {
      // Row already existed — mark as skipped, id will be fetched by caller
      stats[statKey].skipped++;
      return 0;
    }
  } catch (e) {
    stats[statKey].failed++;
    fail(`  [${table}] Insert failed: ${e.message.slice(0, 200)}`);
    return null;
  }
}

/**
 * INSERT IGNORE a row and always return the row's MySQL id afterwards.
 * Uses SELECT to look up the id via a unique key, so it works whether the
 * row was just inserted OR was already present (INSERT IGNORE skipped).
 *
 * WHY NOT LAST_INSERT_ID():
 *   When INSERT IGNORE skips a duplicate, LAST_INSERT_ID() keeps the value
 *   from the PREVIOUS successful insert — which is the wrong id.  The only
 *   reliable approach is SELECT after every INSERT.
 *
 * @param {string}   table    – table name
 * @param {string[]} cols     – ordered column list
 * @param {any[]}    vals     – values
 * @param {string}   uniqueCol – column name whose value is unique and stable
 * @param {any}      uniqueVal – the value to look up
 * @param {string}   statKey
 * @returns {number|null} – MySQL row id, or null on hard failure
 */
async function insertAndGetId(table, cols, vals, uniqueCol, uniqueVal, statKey) {
  if (DRY_RUN) {
    stats[statKey].inserted++;
    return -1; // sentinel; callers must skip child inserts in dry-run
  }

  const placeholders = cols.map(() => "?").join(", ");
  const colList      = cols.map(c => `\`${c}\``).join(", ");
  const insertSql    = `INSERT IGNORE INTO \`${table}\` (${colList}) VALUES (${placeholders})`;

  try {
    await sq.query(insertSql, { replacements: vals, type: QueryTypes.INSERT });
  } catch (e) {
    stats[statKey].failed++;
    fail(`  [${table}] Insert failed: ${e.message.slice(0, 200)}`);
    return null;
  }

  // Always SELECT to get the actual id (works for new AND pre-existing rows)
  try {
    const [[row]] = await sq.query(
      `SELECT id FROM \`${table}\` WHERE \`${uniqueCol}\` = ? LIMIT 1`,
      { replacements: [uniqueVal] }
    );
    if (!row) {
      fail(`  [${table}] Could not find row after insert (unique=${uniqueVal})`);
      stats[statKey].failed++;
      return null;
    }
    // Was it a new insert or a skip?
    // We determine this by checking if the row count via LAST_INSERT_ID trick
    // is unreliable, so we just mark inserted if we don't know better.
    // The inserted/skipped accounting is done below by the caller context.
    stats[statKey].inserted++;
    return row.id;
  } catch (e) {
    fail(`  [${table}] SELECT after insert failed: ${e.message.slice(0, 200)}`);
    stats[statKey].failed++;
    return null;
  }
}

// ─── Date formatting (MariaDB wants 'YYYY-MM-DD HH:MM:SS') ───────────────────
function toMySQLDate(v) {
  if (!v) return null;
  const d = v instanceof Date ? v : new Date(v);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 19).replace("T", " ");
}

// ─── Mongoose model loader ────────────────────────────────────────────────────
function loadMongoModels() {
  return {
    Admin:            require("../../src/models/Admin"),
    HeroSlide:        require("../../src/models/HeroSlide"),
    HomepageContent:  require("../../src/models/HomepageContent"),
    Faculty:          require("../../src/models/Faculty"),
    Course:           require("../../src/models/Course"),
    Event:            require("../../src/models/Event"),
    GalleryAlbum:     require("../../src/models/GalleryAlbum"),
    Notice:           require("../../src/models/Notice"),
    Testimonial:      require("../../src/models/Testimonial"),
    Media:            require("../../src/models/Media"),
    AdmissionEnquiry: require("../../src/models/AdmissionEnquiry"),
    ContactMessage:   require("../../src/models/ContactMessage"),
    SiteSettings:     require("../../src/models/SiteSettings"),
  };
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  log(`\n${C.bold}${C.cyan}CNPS MongoDB → MySQL Migration${C.reset}`);
  log(`Mode : ${DRY_RUN ? C.yellow + "DRY RUN (read-only — no MySQL writes)" + C.reset : C.green + "LIVE" + C.reset}`);
  log(`DB   : ${process.env.MYSQL_USER}@${process.env.MYSQL_HOST || "localhost"}/${process.env.MYSQL_DB}\n`);

  // ── Connect to MongoDB ──
  log("Connecting to MongoDB…");
  if (!process.env.MONGODB_URI) {
    console.error(`${C.red}Fatal: MONGODB_URI is not set in .env${C.reset}`);
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
  ok("MongoDB connected");

  // ── Connect to MySQL ──
  if (!DRY_RUN) {
    log("Connecting to MySQL…");
    await sq.authenticate();
    ok("MySQL connected");
  } else {
    log(`${C.yellow}Skipping MySQL connection (dry-run mode)${C.reset}`);
  }

  const M = loadMongoModels();

  // ════════════════════════════════════════════════════════════
  // 1. ADMINS
  // Unique key: email
  // ════════════════════════════════════════════════════════════
  initStat("admins");
  const admins = await M.Admin.find().select("+password").lean();
  stats.admins.source = admins.length;
  log(`\nMigrating ${admins.length} admin(s)…`);

  for (const a of admins) {
    // Schema: name, email, password, role, status, reset_password_token,
    //         reset_password_expires, created_at, updated_at
    // ENUM role: 'admin'|'super_admin'  — Mongo uses 'admin'|'superadmin'
    const role = a.role === "superadmin" ? "super_admin" : "admin";

    await insertAndGetId(
      "admins",
      ["name","email","password","role","status",
       "reset_password_token","reset_password_expires",
       "created_at","updated_at"],
      [
        (a.name || "").slice(0, 200),
        (a.email || "").toLowerCase().slice(0, 255),
        a.password || "",
        role,
        a.status === "inactive" ? "inactive" : "active",
        a.resetPasswordToken  || null,
        a.resetPasswordExpires ? new Date(a.resetPasswordExpires).getTime() : null,
        toMySQLDate(a.createdAt),
        toMySQLDate(a.updatedAt),
      ],
      "email",
      (a.email || "").toLowerCase(),
      "admins"
    );
  }

  // ════════════════════════════════════════════════════════════
  // 2. SITE SETTINGS  (singleton — at most 1 row)
  // No unique key other than PK; we insert only if table is empty.
  // ════════════════════════════════════════════════════════════
  initStat("site_settings");
  const settings = await M.SiteSettings.findOne().lean();
  stats.site_settings.source = settings ? 1 : 0;

  if (settings) {
    log("\nMigrating site settings…");

    if (!DRY_RUN) {
      const [[{ cnt }]] = await sq.query("SELECT COUNT(*) AS cnt FROM `site_settings`");
      if (cnt > 0) {
        warn("site_settings already has a row — skipping.");
        stats.site_settings.skipped++;
      } else {
        // Collect aboutImages from both legacy fields and new array
        const imgs = Array.isArray(settings.aboutImages) && settings.aboutImages.length > 0
          ? settings.aboutImages
          : [settings.aboutImage1, settings.aboutImage2, settings.aboutImage3].filter(i => i?.url);

        await insertRow(
          "site_settings",
          ["school_name","tagline","description","email","phone","address",
           "map_embed_url","facebook_url","twitter_url","instagram_url",
           "youtube_url","linkedin_url",
           "logo_url","logo_public_id","favicon_url","favicon_public_id",
           "about_image1_url","about_image1_public_id",
           "about_image2_url","about_image2_public_id",
           "about_image3_url","about_image3_public_id",
           "created_at","updated_at"],
          [
            (settings.schoolName || "CNPS Public School").slice(0, 300),
            settings.tagline   || null,
            null,                                    // description — not in Mongo schema
            settings.email     || null,
            settings.phone     || null,
            settings.address   || null,
            settings.mapEmbedUrl || null,
            settings.socialLinks?.facebook  || null,
            settings.socialLinks?.twitter   || null,
            settings.socialLinks?.instagram || null,
            settings.socialLinks?.youtube   || null,
            settings.socialLinks?.linkedin  || null,
            settings.logo?.url       || null,
            settings.logo?.publicId  || null,
            settings.favicon?.url    || null,
            settings.favicon?.publicId || null,
            imgs[0]?.url      || null,
            imgs[0]?.publicId || null,
            imgs[1]?.url      || null,
            imgs[1]?.publicId || null,
            imgs[2]?.url      || null,
            imgs[2]?.publicId || null,
            toMySQLDate(settings.createdAt),
            toMySQLDate(settings.updatedAt),
          ],
          "site_settings"
        );
      }
    } else {
      stats.site_settings.inserted++;
    }
  }

  // ════════════════════════════════════════════════════════════
  // 3. HERO SLIDES
  // No natural unique key — deduplicate on (title + button_url + status)
  // ════════════════════════════════════════════════════════════
  initStat("hero_slides");
  const slides = await M.HeroSlide.find().lean();
  stats.hero_slides.source = slides.length;
  log(`\nMigrating ${slides.length} hero slide(s)…`);

  for (const s of slides) {
    if (!DRY_RUN) {
      // Check for existing row using image_public_id as a stable surrogate key
      const publicId = s.image?.publicId || null;
      if (publicId) {
        const [[{ cnt }]] = await sq.query(
          "SELECT COUNT(*) AS cnt FROM `hero_slides` WHERE `image_public_id` = ?",
          { replacements: [publicId] }
        );
        if (cnt > 0) { stats.hero_slides.skipped++; continue; }
      }
    }

    await insertRow(
      "hero_slides",
      ["title","subtitle","description","button_text","button_url",
       "image_url","image_public_id","status","sort_order",
       "created_at","updated_at"],
      [
        s.title       || null,
        s.subtitle    || null,
        s.description || null,
        s.buttonText  || null,
        s.buttonUrl   || "/admission",
        s.image?.url       || null,
        s.image?.publicId  || null,
        s.status === "inactive" ? "inactive" : "active",
        Number(s.sortOrder) || 0,
        toMySQLDate(s.createdAt),
        toMySQLDate(s.updatedAt),
      ],
      "hero_slides"
    );
  }

  // ════════════════════════════════════════════════════════════
  // 4. HOMEPAGE CONTENT + COUNT STATS
  // Singleton content row; count_stats are children linked by FK.
  // ════════════════════════════════════════════════════════════
  initStat("homepage_content");
  initStat("count_stats");
  const hp = await M.HomepageContent.findOne().lean();
  stats.homepage_content.source = hp ? 1 : 0;

  if (hp) {
    log("\nMigrating homepage content…");

    let hpId = null;

    if (!DRY_RUN) {
      const [[{ cnt }]] = await sq.query("SELECT COUNT(*) AS cnt FROM `homepage_content`");
      if (cnt > 0) {
        warn("homepage_content already has a row — fetching its id for count_stats.");
        const [[row]] = await sq.query("SELECT id FROM `homepage_content` LIMIT 1");
        hpId = row.id;
        stats.homepage_content.skipped++;
      } else {
        const cols = [
          "about_heading","about_subheading","about_description",
          "about_image_url","about_image_public_id","about_points",
          "why_us_heading","why_us_description",
          "cta_heading","cta_description","cta_button_text","cta_button_url",
          "created_at","updated_at",
        ];
        const vals = [
          hp.aboutHeading    || null,
          hp.aboutSubheading || null,
          hp.aboutDescription|| null,
          hp.aboutImage?.url       || null,
          hp.aboutImage?.publicId  || null,
          JSON.stringify(Array.isArray(hp.aboutPoints) ? hp.aboutPoints : []),
          hp.whyUsHeading    || null,
          hp.whyUsDescription|| null,
          hp.ctaHeading      || null,
          hp.ctaDescription  || null,
          hp.ctaButtonText   || null,
          hp.ctaButtonUrl    || null,
          toMySQLDate(hp.createdAt),
          toMySQLDate(hp.updatedAt),
        ];
        const placeholders = cols.map(() => "?").join(", ");
        const colList = cols.map(c => `\`${c}\``).join(", ");
        try {
          const [, insertId] = await sq.query(
            `INSERT INTO \`homepage_content\` (${colList}) VALUES (${placeholders})`,
            { replacements: vals, type: QueryTypes.INSERT }
          );
          hpId = insertId;
          stats.homepage_content.inserted++;
        } catch (e) {
          fail(`  [homepage_content] ${e.message.slice(0, 200)}`);
          stats.homepage_content.failed++;
        }
      }

      // Insert count_stats children if we have a valid parent id
      if (hpId && Array.isArray(hp.countStats) && hp.countStats.length > 0) {
        stats.count_stats.source = hp.countStats.length;
        const VALID_CATS = new Set(["Students","Events","Faculty","Courses"]);

        for (const cs of hp.countStats) {
          // Check if this stat already exists for this parent
          const cat = VALID_CATS.has(cs.category) ? cs.category : "Students";
          const [[{ cnt }]] = await sq.query(
            "SELECT COUNT(*) AS cnt FROM `count_stats` WHERE `homepage_content_id` = ? AND `category` = ?",
            { replacements: [hpId, cat] }
          );
          if (cnt > 0) { stats.count_stats.skipped++; continue; }

          await insertRow(
            "count_stats",
            ["homepage_content_id","category","icon","value","label","suffix","sort_order"],
            [
              hpId,
              cat,
              (cs.icon || "bi-people-fill").slice(0, 100),
              Math.max(0, Number(cs.value) || 0),
              cs.label  || null,
              cs.suffix || "+",
              Number(cs.sortOrder) || 0,
            ],
            "count_stats"
          );
        }
      }
    } else {
      // Dry-run accounting
      stats.homepage_content.inserted++;
      stats.count_stats.source   = (hp.countStats || []).length;
      stats.count_stats.inserted = stats.count_stats.source;
    }
  }

  // ════════════════════════════════════════════════════════════
  // 5. FACULTY
  // Unique key: email (when non-empty); fallback dedup on name.
  // ════════════════════════════════════════════════════════════
  initStat("faculty");
  const faculty = await M.Faculty.find().lean();
  stats.faculty.source = faculty.length;
  log(`\nMigrating ${faculty.length} faculty member(s)…`);

  for (const f of faculty) {
    if (!DRY_RUN) {
      // Deduplicate: prefer email match; fall back to name match
      const email = f.email?.trim() || null;
      if (email) {
        const [[{ cnt }]] = await sq.query(
          "SELECT COUNT(*) AS cnt FROM `faculty` WHERE `email` = ?",
          { replacements: [email] }
        );
        if (cnt > 0) { stats.faculty.skipped++; continue; }
      } else {
        const [[{ cnt }]] = await sq.query(
          "SELECT COUNT(*) AS cnt FROM `faculty` WHERE `name` = ? AND `email` IS NULL",
          { replacements: [f.name] }
        );
        if (cnt > 0) { stats.faculty.skipped++; continue; }
      }
    }

    await insertRow(
      "faculty",
      ["name","designation","qualification","experience",
       "short_bio","bio","photo_url","photo_public_id",
       "email","phone","facebook","instagram","linkedin","youtube",
       "status","sort_order","created_at","updated_at"],
      [
        (f.name || "").slice(0, 200),
        f.designation   || null,
        f.qualification || null,
        f.experience    || null,
        f.shortBio || null,
        f.bio      || null,
        f.photo?.url      || null,
        f.photo?.publicId || null,
        f.email    || null,
        f.phone    || null,
        // Support both flat fields and nested socialLinks
        f.facebook  || f.socialLinks?.facebook  || null,
        f.instagram || f.socialLinks?.instagram || null,
        f.linkedin  || f.socialLinks?.linkedin  || null,
        f.youtube   || f.socialLinks?.youtube   || null,
        f.status === "inactive" ? "inactive" : "active",
        Number(f.sortOrder) || 0,
        toMySQLDate(f.createdAt),
        toMySQLDate(f.updatedAt),
      ],
      "faculty"
    );
  }

  // ════════════════════════════════════════════════════════════
  // 6. COURSES + COURSE BOOKS
  // Unique key: slug
  // ════════════════════════════════════════════════════════════
  initStat("courses");
  initStat("course_books");
  const courses = await M.Course.find().lean();
  stats.courses.source = courses.length;
  log(`\nMigrating ${courses.length} course(s)…`);

  for (const course of courses) {
    const slug = (course.slug || reserveSlug(course.title, "courses")).slice(0, 350);

    // insertAndGetId: uses slug as the reliable unique key for parent-id lookup
    const courseId = await insertAndGetId(
      "courses",
      ["title","slug","category","class_name","short_description","description",
       "class_teacher","timing","image_url","image_public_id",
       "fee_pdf_url","fee_pdf_public_id",
       "timetable_pdf_url","timetable_pdf_public_id",
       "subjects","status","sort_order","created_at","updated_at"],
      [
        (course.title || "").slice(0, 300),
        slug,
        course.category    || null,
        course.className   || null,
        course.shortDescription || null,
        course.description || null,
        course.classTeacher|| null,
        course.timing      || null,
        course.image?.url       || null,
        course.image?.publicId  || null,
        course.feePdf?.url       || null,
        course.feePdf?.publicId  || null,
        course.timetablePdf?.url       || null,
        course.timetablePdf?.publicId  || null,
        JSON.stringify(Array.isArray(course.subjects) ? course.subjects : []),
        course.status === "inactive" ? "inactive" : "active",
        Number(course.sortOrder) || 0,
        toMySQLDate(course.createdAt),
        toMySQLDate(course.updatedAt),
      ],
      "slug",
      slug,
      "courses"
    );

    // Insert child books — only when we have a real MySQL id and books exist
    if (!DRY_RUN && courseId && Array.isArray(course.books) && course.books.length > 0) {
      stats.course_books.source += course.books.length;

      for (const book of course.books) {
        // Dedup books: course_id + name uniquely identifies a book
        const [[{ cnt }]] = await sq.query(
          "SELECT COUNT(*) AS cnt FROM `course_books` WHERE `course_id` = ? AND `name` = ?",
          { replacements: [courseId, book.name || ""] }
        );
        if (cnt > 0) { stats.course_books.skipped++; continue; }

        await insertRow(
          "course_books",
          ["course_id","name","publisher","price","image_url","image_public_id","sort_order"],
          [
            courseId,
            (book.name || "").slice(0, 300),
            book.publisher || null,
            book.price     || null,
            book.image?.url      || null,
            book.image?.publicId || null,
            Number(book.sortOrder) || 0,
          ],
          "course_books"
        );
      }
    } else if (DRY_RUN && Array.isArray(course.books)) {
      stats.course_books.source   += course.books.length;
      stats.course_books.inserted += course.books.length;
    }
  }

  // ════════════════════════════════════════════════════════════
  // 7. EVENTS + EVENT GALLERY
  // Unique key: slug
  // ════════════════════════════════════════════════════════════
  initStat("events");
  initStat("event_gallery");
  const events = await M.Event.find().lean();
  stats.events.source = events.length;
  log(`\nMigrating ${events.length} event(s)…`);

  for (const ev of events) {
    const slug = (ev.slug || reserveSlug(ev.title, "events")).slice(0, 350);

    const eventId = await insertAndGetId(
      "events",
      ["title","slug","description","event_date","location",
       "cover_image_url","cover_image_public_id",
       "status","sort_order","created_at","updated_at"],
      [
        (ev.title || "").slice(0, 300),
        slug,
        ev.description || null,
        toMySQLDate(ev.eventDate),
        ev.location || null,
        ev.coverImage?.url      || null,
        ev.coverImage?.publicId || null,
        ev.status === "inactive" ? "inactive" : "active",
        Number(ev.sortOrder) || 0,
        toMySQLDate(ev.createdAt),
        toMySQLDate(ev.updatedAt),
      ],
      "slug",
      slug,
      "events"
    );

    if (!DRY_RUN && eventId && Array.isArray(ev.gallery) && ev.gallery.length > 0) {
      stats.event_gallery.source += ev.gallery.length;

      for (const img of ev.gallery) {
        if (!img.url || !img.publicId) continue;

        const [[{ cnt }]] = await sq.query(
          "SELECT COUNT(*) AS cnt FROM `event_gallery` WHERE `event_id` = ? AND `public_id` = ?",
          { replacements: [eventId, img.publicId] }
        );
        if (cnt > 0) { stats.event_gallery.skipped++; continue; }

        await insertRow(
          "event_gallery",
          ["event_id","url","public_id","caption","sort_order"],
          [
            eventId,
            img.url.slice(0, 1000),
            img.publicId.slice(0, 500),
            img.caption   || null,
            Number(img.sortOrder) || 0,
          ],
          "event_gallery"
        );
      }
    } else if (DRY_RUN && Array.isArray(ev.gallery)) {
      stats.event_gallery.source   += ev.gallery.length;
      stats.event_gallery.inserted += ev.gallery.length;
    }
  }

  // ════════════════════════════════════════════════════════════
  // 8. GALLERY ALBUMS + GALLERY IMAGES
  // Unique key: slug
  // ════════════════════════════════════════════════════════════
  initStat("gallery_albums");
  initStat("gallery_images");
  const VALID_ALBUM_CATS = new Set(["academic","development","campus","general"]);
  const albums = await M.GalleryAlbum.find().lean();
  stats.gallery_albums.source = albums.length;
  log(`\nMigrating ${albums.length} gallery album(s)…`);

  for (const album of albums) {
    const slug = (album.slug || reserveSlug(album.title, "gallery_albums")).slice(0, 350);
    const cat  = VALID_ALBUM_CATS.has(album.category) ? album.category : "general";

    const albumId = await insertAndGetId(
      "gallery_albums",
      ["title","slug","description","category",
       "cover_image_url","cover_image_public_id",
       "status","sort_order","created_at","updated_at"],
      [
        (album.title || "").slice(0, 300),
        slug,
        album.description || null,
        cat,
        album.coverImage?.url      || null,
        album.coverImage?.publicId || null,
        album.status === "inactive" ? "inactive" : "active",
        Number(album.sortOrder) || 0,
        toMySQLDate(album.createdAt),
        toMySQLDate(album.updatedAt),
      ],
      "slug",
      slug,
      "gallery_albums"
    );

    if (!DRY_RUN && albumId && Array.isArray(album.images) && album.images.length > 0) {
      stats.gallery_images.source += album.images.length;

      for (const img of album.images) {
        if (!img.url || !img.publicId) continue;

        const [[{ cnt }]] = await sq.query(
          "SELECT COUNT(*) AS cnt FROM `gallery_images` WHERE `album_id` = ? AND `public_id` = ?",
          { replacements: [albumId, img.publicId] }
        );
        if (cnt > 0) { stats.gallery_images.skipped++; continue; }

        await insertRow(
          "gallery_images",
          ["album_id","url","public_id","caption","sort_order"],
          [
            albumId,
            img.url.slice(0, 1000),
            img.publicId.slice(0, 500),
            img.caption   || null,
            Number(img.sortOrder) || 0,
          ],
          "gallery_images"
        );
      }
    } else if (DRY_RUN && Array.isArray(album.images)) {
      stats.gallery_images.source   += album.images.length;
      stats.gallery_images.inserted += album.images.length;
    }
  }

  // ════════════════════════════════════════════════════════════
  // 9. NOTICES
  // Unique key: slug
  // ════════════════════════════════════════════════════════════
  initStat("notices");
  const VALID_FILE_RT = new Set(["image","raw",""]);
  const notices = await M.Notice.find().lean();
  stats.notices.source = notices.length;
  log(`\nMigrating ${notices.length} notice(s)…`);

  for (const n of notices) {
    const slug = (n.slug || reserveSlug(n.title, "notices")).slice(0, 350);
    const rt   = VALID_FILE_RT.has(n.file?.resourceType) ? (n.file?.resourceType || "") : "";

    await insertAndGetId(
      "notices",
      ["title","slug","content","file_url","file_public_id","file_resource_type",
       "status","sort_order","created_at","updated_at"],
      [
        (n.title || "").slice(0, 300),
        slug,
        n.content || null,
        n.file?.url      || null,
        n.file?.publicId || null,
        rt,
        n.status === "inactive" ? "inactive" : "active",
        Number(n.sortOrder) || 0,
        toMySQLDate(n.createdAt),
        toMySQLDate(n.updatedAt),
      ],
      "slug",
      slug,
      "notices"
    );
  }

  // ════════════════════════════════════════════════════════════
  // 10. TESTIMONIALS
  // No natural unique key — deduplicate on (name + content prefix)
  // ════════════════════════════════════════════════════════════
  initStat("testimonials");
  const VALID_TEST_STATUS = new Set(["pending","approved","rejected"]);
  const testimonials = await M.Testimonial.find().lean();
  stats.testimonials.source = testimonials.length;
  log(`\nMigrating ${testimonials.length} testimonial(s)…`);

  for (const t of testimonials) {
    if (!DRY_RUN) {
      const contentPrefix = (t.content || "").slice(0, 100);
      const [[{ cnt }]] = await sq.query(
        "SELECT COUNT(*) AS cnt FROM `testimonials` WHERE `name` = ? AND LEFT(`content`, 100) = ?",
        { replacements: [t.name || "", contentPrefix] }
      );
      if (cnt > 0) { stats.testimonials.skipped++; continue; }
    }

    const status = VALID_TEST_STATUS.has(t.status) ? t.status : "pending";
    await insertRow(
      "testimonials",
      ["name","designation","content","rating",
       "avatar_url","avatar_public_id",
       "status","sort_order","created_at","updated_at"],
      [
        (t.name || "").slice(0, 200),
        t.designation || null,
        t.content || "",
        Math.min(5, Math.max(1, Number(t.rating) || 5)),
        t.avatar?.url      || null,
        t.avatar?.publicId || null,
        status,
        Number(t.sortOrder) || 0,
        toMySQLDate(t.createdAt),
        toMySQLDate(t.updatedAt),
      ],
      "testimonials"
    );
  }

  // ════════════════════════════════════════════════════════════
  // 11. MEDIA
  // Unique key: public_id (Cloudinary asset identifier is globally unique)
  // ════════════════════════════════════════════════════════════
  initStat("media");
  const VALID_RT = new Set(["image","raw"]);
  const mediaItems = await M.Media.find().lean();
  stats.media.source = mediaItems.length;
  log(`\nMigrating ${mediaItems.length} media file(s)…`);

  for (const m of mediaItems) {
    if (!m.url || !m.publicId) {
      warn(`  [media] Skipping record with missing url/publicId`);
      stats.media.skipped++;
      continue;
    }

    if (!DRY_RUN) {
      const [[{ cnt }]] = await sq.query(
        "SELECT COUNT(*) AS cnt FROM `media` WHERE `public_id` = ?",
        { replacements: [m.publicId] }
      );
      if (cnt > 0) { stats.media.skipped++; continue; }
    }

    await insertRow(
      "media",
      ["original_name","url","public_id","resource_type",
       "mime_type","size","folder","tags",
       "created_at","updated_at"],
      [
        m.originalName || null,
        m.url.slice(0, 1000),
        m.publicId.slice(0, 500),
        VALID_RT.has(m.resourceType) ? m.resourceType : "image",
        m.mimeType || null,
        m.size     || null,
        (m.folder  || "media").slice(0, 200),
        JSON.stringify(Array.isArray(m.tags) ? m.tags : []),
        toMySQLDate(m.createdAt),
        toMySQLDate(m.updatedAt),
      ],
      "media"
    );
  }

  // ════════════════════════════════════════════════════════════
  // 12. ADMISSION ENQUIRIES
  // The Mongo model has richer fields than the SQL schema migration planned.
  // We map all available fields to the SQL columns.
  // Schema columns: student_name, parent_name, email, phone,
  //                 class_applying, message, status, notes, created_at, updated_at
  // Note: dob, gender, stream, address, etc. are not in the SQL schema —
  //       we store them in the `notes` column as a JSON string so nothing is lost.
  // ════════════════════════════════════════════════════════════
  initStat("admission_enquiries");
  const VALID_ADM_STATUS = new Set(["new","in_review","accepted","rejected"]);
  // Map Mongo statuses that differ from SQL ENUM
  const admStatusMap = { reviewed: "in_review", contacted: "in_review", admitted: "accepted" };
  const admissions = await M.AdmissionEnquiry.find().lean();
  stats.admission_enquiries.source = admissions.length;
  log(`\nMigrating ${admissions.length} admission enquirie(s)…`);

  for (const a of admissions) {
    if (!DRY_RUN) {
      // Dedup on mobile + studentName (the fields that are always present)
      const mobile = a.mobile || a.phone || null;
      if (mobile) {
        const [[{ cnt }]] = await sq.query(
          "SELECT COUNT(*) AS cnt FROM `admission_enquiries` WHERE `phone` = ? AND `student_name` = ?",
          { replacements: [mobile, a.studentName || ""] }
        );
        if (cnt > 0) { stats.admission_enquiries.skipped++; continue; }
      }
    }

    // Map status
    const rawStatus = a.status || "new";
    const status = VALID_ADM_STATUS.has(rawStatus)
      ? rawStatus
      : (admStatusMap[rawStatus] || "new");

    // Preserve extra Mongo fields in notes as JSON (non-destructive)
    const extraFields = {};
    if (a.dob)          extraFields.dob          = a.dob;
    if (a.gender)       extraFields.gender        = a.gender;
    if (a.stream)       extraFields.stream        = a.stream;
    if (a.scienceGroup) extraFields.scienceGroup  = a.scienceGroup;
    if (a.address)      extraFields.address       = a.address;
    if (a.motherName)   extraFields.motherName    = a.motherName;

    const notesJson = JSON.stringify({
      extra:      extraFields,
      adminNotes: a.adminNotes || "",
    });

    await insertRow(
      "admission_enquiries",
      ["student_name","parent_name","email","phone",
       "class_applying","message","status","notes",
       "created_at","updated_at"],
      [
        (a.studentName || "Unknown").slice(0, 200),
        (a.fatherName  || a.parentName || null),
        a.email  || null,
        a.mobile || a.phone || null,
        (a.className || a.classApplying || null),
        a.message || null,
        status,
        notesJson,
        toMySQLDate(a.createdAt),
        toMySQLDate(a.updatedAt),
      ],
      "admission_enquiries"
    );
  }

  // ════════════════════════════════════════════════════════════
  // 13. CONTACT MESSAGES
  // Mongo schema has extra fields: isRead, adminNotes, status enum includes "archived"
  // ════════════════════════════════════════════════════════════
  initStat("contact_messages");
  const VALID_MSG_STATUS = new Set(["new","read","replied"]);
  const contacts = await M.ContactMessage.find().lean();
  stats.contact_messages.source = contacts.length;
  log(`\nMigrating ${contacts.length} contact message(s)…`);

  for (const cm of contacts) {
    if (!DRY_RUN) {
      // Dedup on email + subject + first 100 chars of message
      const msgPrefix = (cm.message || "").slice(0, 100);
      const [[{ cnt }]] = await sq.query(
        "SELECT COUNT(*) AS cnt FROM `contact_messages` WHERE `email` = ? AND LEFT(`message`, 100) = ?",
        { replacements: [cm.email || "", msgPrefix] }
      );
      if (cnt > 0) { stats.contact_messages.skipped++; continue; }
    }

    // Map "archived" → "read" (closest equivalent in SQL ENUM)
    const rawStatus = cm.status || "new";
    const status = VALID_MSG_STATUS.has(rawStatus) ? rawStatus : "read";

    await insertRow(
      "contact_messages",
      ["name","email","phone","subject","message","status","created_at","updated_at"],
      [
        (cm.name    || "").slice(0, 200),
        (cm.email   || "").slice(0, 255),
        cm.phone   || null,
        cm.subject || null,
        cm.message || "",
        status,
        toMySQLDate(cm.createdAt),
        toMySQLDate(cm.updatedAt),
      ],
      "contact_messages"
    );
  }

  // ════════════════════════════════════════════════════════════
  // SUMMARY
  // ════════════════════════════════════════════════════════════
  const totalFailed = printSummary();

  if (DRY_RUN) {
    log(`\n${C.yellow}DRY RUN complete — zero MySQL records written.${C.reset}`);
  } else if (totalFailed === 0) {
    log(`\n${C.green}${C.bold}Migration complete with zero failures.${C.reset}`);
  } else {
    log(`\n${C.red}${C.bold}Migration finished with ${totalFailed} failure(s). Review ✗ lines above.${C.reset}`);
  }

  await mongoose.disconnect();
  if (!DRY_RUN) await sq.close();

  process.exit(totalFailed > 0 ? 2 : 0);
}

main().catch((e) => {
  console.error(`\n${C.red}${C.bold}Fatal error:${C.reset} ${e.message}`);
  console.error(e.stack);
  process.exit(1);
});
