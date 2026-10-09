/**
 * ============================================================
 * CNPS CMS — Automatic Database Initialization
 * ============================================================
 *
 * File: src/config/initDb.js
 *
 * PURPOSE:
 *   Automatically create the database and all required tables
 *   on backend startup. Safe to run multiple times (idempotent).
 *
 * SCHEMA SOURCE OF TRUTH:
 *   Every table definition here was verified against the ACTUAL
 *   database using DESCRIBE queries on the live XAMPP database.
 *   Do NOT modify table definitions without re-verifying with
 *   DESCRIBE <table> first.
 *
 * SAFETY RULES:
 *   - Never DROPs any table or database.
 *   - Never DELETEs or TRUNCATEs existing data.
 *   - Uses CREATE TABLE IF NOT EXISTS for all tables.
 *   - addColIfMissing() catches ER_DUP_FIELDNAME — safe to re-run.
 *   - Singleton seed rows inserted ONLY when table is completely empty.
 *
 * STARTUP ORDER (server.js):
 *   1. dotenv.config()
 *   2. initializeDatabase()  ← this file
 *   3. app.listen()
 */

import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// ─────────────────────────────────────────────────────────────
// Safe query — swallows known "already exists" errors only
// ─────────────────────────────────────────────────────────────
const IGNORED_CODES = new Set([
    "ER_TABLE_EXISTS_ERROR",
    "ER_DUP_FIELDNAME",
    "ER_DUP_KEYNAME",
    "ER_MULTIPLE_PRI_KEY",
    "ER_FK_DUP_NAME",
    "ER_DB_CREATE_EXISTS",
]);

async function safeQuery(conn, sql) {
    try {
        await conn.query(sql);
    } catch (err) {
        if (IGNORED_CODES.has(err.code)) return;
        throw err;
    }
}

// ─────────────────────────────────────────────────────────────
// Safely add a column if it doesn't already exist
// ─────────────────────────────────────────────────────────────
async function addColIfMissing(conn, table, column, def) {
    try {
        await conn.query(
            `ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${def}`
        );
        console.log(`   + Added column: ${table}.${column}`);
    } catch (err) {
        if (err.code === "ER_DUP_FIELDNAME") return; // Already exists — safe
        throw err;
    }
}

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────
export async function initializeDatabase() {
    const {
        DB_HOST     = "127.0.0.1",
        DB_PORT     = "3306",
        DB_USER,
        DB_PASSWORD = "",
        DB_NAME,
    } = process.env;

    if (!DB_USER || !DB_NAME) {
        throw new Error(
            "DB_USER and DB_NAME are required in .env.\n" +
            "Check your environment configuration."
        );
    }

    console.log("\n🔄 CNPS — Database Initialization");
    console.log(`   Host : ${DB_HOST}:${DB_PORT}`);
    console.log(`   DB   : ${DB_NAME}\n`);

    // ── Connect WITHOUT selecting a database ─────────────────
    // This allows CREATE DATABASE to work when needed.
    let conn;
    try {
        conn = await mysql.createConnection({
            host: DB_HOST,
            port: Number(DB_PORT),
            user: DB_USER,
            password: DB_PASSWORD,
        });
    } catch (err) {
        throw new Error(
            `Cannot connect to MySQL at ${DB_HOST}:${DB_PORT}.\n` +
            `Error: ${err.message}\n\n` +
            "Verify DB_HOST, DB_PORT, DB_USER, DB_PASSWORD in .env.\n" +
            "Ensure MySQL (XAMPP or Railway) is running."
        );
    }

    // ── CREATE DATABASE IF NOT EXISTS ────────────────────────
    try {
        await conn.query(
            `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`
             CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
        );
        console.log(`✅ Database ready: ${DB_NAME}`);
    } catch (err) {
        // Railway / managed hosts deny CREATE DATABASE — continue
        if (
            err.code === "ER_DBACCESS_DENIED_ERROR" ||
            err.code === "ER_ACCESS_DENIED_ERROR"
        ) {
            console.log(
                `ℹ️  CREATE DATABASE denied — assuming '${DB_NAME}' already exists.`
            );
        } else {
            throw err;
        }
    }

    // ── USE DATABASE ─────────────────────────────────────────
    try {
        await conn.query(`USE \`${DB_NAME}\``);
    } catch (err) {
        throw new Error(
            `Cannot USE database '${DB_NAME}': ${err.message}\n` +
            "Ensure the database exists and the user has SELECT privilege."
        );
    }

    // Disable FK checks so tables can be created in any order
    await conn.query("SET FOREIGN_KEY_CHECKS = 0");

    // ── CREATE TABLES ────────────────────────────────────────
    // IMPORTANT: Every column here was verified against the
    // actual XAMPP database using DESCRIBE <table>.
    console.log("🔨 Verifying tables...");

    // ── 1. cms_admins ─────────────────────────────────────────
    // Verified columns: id, name, email, password, role(admin|super_admin),
    //   profile_image, status(active|inactive), created_at, updated_at
    await safeQuery(conn, `
        CREATE TABLE IF NOT EXISTS \`cms_admins\` (
            \`id\`            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
            \`name\`          VARCHAR(100)  NOT NULL,
            \`email\`         VARCHAR(150)  NOT NULL,
            \`password\`      VARCHAR(255)  NOT NULL,
            \`role\`          ENUM('admin','super_admin') NOT NULL DEFAULT 'admin',
            \`profile_image\` VARCHAR(500)  NULL DEFAULT NULL,
            \`status\`        ENUM('active','inactive') NOT NULL DEFAULT 'active',
            \`created_at\`    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
            \`updated_at\`    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
                             ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (\`id\`),
            UNIQUE KEY \`uk_admins_email\` (\`email\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    // ── 2. password_reset_otps ────────────────────────────────
    // Verified columns: id, admin_id, email, otp_hash, expires_at,
    //   attempts, verified_at, used_at, created_at
    await safeQuery(conn, `
        CREATE TABLE IF NOT EXISTS \`password_reset_otps\` (
            \`id\`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
            \`admin_id\`    INT UNSIGNED NOT NULL,
            \`email\`       VARCHAR(150) NOT NULL,
            \`otp_hash\`    VARCHAR(255) NOT NULL,
            \`expires_at\`  DATETIME     NOT NULL,
            \`attempts\`    INT          NOT NULL DEFAULT 0,
            \`verified_at\` DATETIME     NULL DEFAULT NULL,
            \`used_at\`     DATETIME     NULL DEFAULT NULL,
            \`created_at\`  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (\`id\`),
            KEY \`idx_otp_admin\` (\`admin_id\`),
            KEY \`idx_otp_email\` (\`email\`),
            CONSTRAINT \`fk_otp_admin\`
                FOREIGN KEY (\`admin_id\`) REFERENCES \`cms_admins\` (\`id\`)
                ON DELETE CASCADE ON UPDATE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    // ── 3. about_page ─────────────────────────────────────────
    // Verified columns: id, title, subtitle, description, mission_title,
    //   mission_description, mission_image, vision_title, vision_description,
    //   vision_image, values_title, values_description, values_image,
    //   image, created_at, updated_at
    // Singleton — always id=1
    await safeQuery(conn, `
        CREATE TABLE IF NOT EXISTS \`about_page\` (
            \`id\`                  INT UNSIGNED NOT NULL AUTO_INCREMENT,
            \`title\`               VARCHAR(255) NULL DEFAULT NULL,
            \`subtitle\`            VARCHAR(500) NULL DEFAULT NULL,
            \`description\`         TEXT         NULL DEFAULT NULL,
            \`mission_title\`       VARCHAR(255) NULL DEFAULT NULL,
            \`mission_description\` TEXT         NULL DEFAULT NULL,
            \`mission_image\`       VARCHAR(500) NULL DEFAULT NULL,
            \`vision_title\`        VARCHAR(255) NULL DEFAULT NULL,
            \`vision_description\`  TEXT         NULL DEFAULT NULL,
            \`vision_image\`        VARCHAR(500) NULL DEFAULT NULL,
            \`values_title\`        VARCHAR(255) NULL DEFAULT NULL,
            \`values_description\`  TEXT         NULL DEFAULT NULL,
            \`values_image\`        VARCHAR(500) NULL DEFAULT NULL,
            \`image\`               VARCHAR(500) NULL DEFAULT NULL,
            \`created_at\`          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
            \`updated_at\`          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
                                   ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    // ── 4. about_sections ─────────────────────────────────────
    // Verified columns: id, section_key, title, description, bullets,
    //   image, sort_order, status, created_at, updated_at
    await safeQuery(conn, `
        CREATE TABLE IF NOT EXISTS \`about_sections\` (
            \`id\`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
            \`section_key\` VARCHAR(100) NOT NULL,
            \`title\`       VARCHAR(255) NULL DEFAULT NULL,
            \`description\` TEXT         NULL DEFAULT NULL,
            \`bullets\`     LONGTEXT     NULL DEFAULT NULL,
            \`image\`       VARCHAR(500) NULL DEFAULT NULL,
            \`sort_order\`  INT          NOT NULL DEFAULT 0,
            \`status\`      ENUM('active','inactive') NOT NULL DEFAULT 'active',
            \`created_at\`  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
            \`updated_at\`  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
                           ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (\`id\`),
            UNIQUE KEY \`uk_about_sections_key\` (\`section_key\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    // ── 5. courses ────────────────────────────────────────────
    // Verified columns: id, title, slug, category, class_name, image,
    //   short_description, description(longtext), class_teacher, timing,
    //   fee_pdf, timetable_pdf, status, sort_order, created_at, updated_at
    await safeQuery(conn, `
        CREATE TABLE IF NOT EXISTS \`courses\` (
            \`id\`                INT UNSIGNED NOT NULL AUTO_INCREMENT,
            \`title\`             VARCHAR(255) NOT NULL,
            \`slug\`              VARCHAR(255) NOT NULL,
            \`category\`          VARCHAR(100) NULL DEFAULT NULL,
            \`class_name\`        VARCHAR(100) NULL DEFAULT NULL,
            \`image\`             VARCHAR(500) NULL DEFAULT NULL,
            \`short_description\` TEXT         NULL DEFAULT NULL,
            \`description\`       LONGTEXT     NULL DEFAULT NULL,
            \`class_teacher\`     VARCHAR(150) NULL DEFAULT NULL,
            \`timing\`            VARCHAR(150) NULL DEFAULT NULL,
            \`fee_pdf\`           VARCHAR(500) NULL DEFAULT NULL,
            \`timetable_pdf\`     VARCHAR(500) NULL DEFAULT NULL,
            \`status\`            ENUM('active','inactive') NOT NULL DEFAULT 'active',
            \`sort_order\`        INT          NOT NULL DEFAULT 0,
            \`created_at\`        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
            \`updated_at\`        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
                                 ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (\`id\`),
            UNIQUE KEY \`uk_courses_slug\` (\`slug\`),
            KEY \`idx_courses_status\` (\`status\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    // ── 6. course_subjects ────────────────────────────────────
    // Verified columns: id, course_id, subject_name, sort_order, created_at
    await safeQuery(conn, `
        CREATE TABLE IF NOT EXISTS \`course_subjects\` (
            \`id\`           INT UNSIGNED NOT NULL AUTO_INCREMENT,
            \`course_id\`    INT UNSIGNED NOT NULL,
            \`subject_name\` VARCHAR(150) NOT NULL,
            \`sort_order\`   INT          NOT NULL DEFAULT 0,
            \`created_at\`   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (\`id\`),
            KEY \`idx_cs_course\` (\`course_id\`),
            CONSTRAINT \`fk_cs_course\`
                FOREIGN KEY (\`course_id\`) REFERENCES \`courses\` (\`id\`)
                ON DELETE CASCADE ON UPDATE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    // ── 7. course_books ───────────────────────────────────────
    // Verified columns: id, course_id, book_name, publisher, image,
    //   sort_order, created_at
    await safeQuery(conn, `
        CREATE TABLE IF NOT EXISTS \`course_books\` (
            \`id\`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
            \`course_id\`  INT UNSIGNED NOT NULL,
            \`book_name\`  VARCHAR(255) NOT NULL,
            \`publisher\`  VARCHAR(255) NULL DEFAULT NULL,
            \`image\`      VARCHAR(500) NULL DEFAULT NULL,
            \`sort_order\` INT          NOT NULL DEFAULT 0,
            \`created_at\` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (\`id\`),
            KEY \`idx_cb_course\` (\`course_id\`),
            CONSTRAINT \`fk_cb_course\`
                FOREIGN KEY (\`course_id\`) REFERENCES \`courses\` (\`id\`)
                ON DELETE CASCADE ON UPDATE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    // ── 8. events ─────────────────────────────────────────────
    await safeQuery(conn, `
        CREATE TABLE IF NOT EXISTS \`events\` (
            \`id\`                INT UNSIGNED NOT NULL AUTO_INCREMENT,
            \`title\`             VARCHAR(255) NOT NULL,
            \`slug\`              VARCHAR(255) NOT NULL,
            \`short_description\` TEXT         NULL DEFAULT NULL,
            \`description\`       LONGTEXT     NULL DEFAULT NULL,
            \`event_date\`        DATE         NOT NULL,
            \`start_time\`        TIME         NULL DEFAULT NULL,
            \`end_time\`          TIME         NULL DEFAULT NULL,
            \`venue\`             VARCHAR(300) NULL DEFAULT NULL,
            \`image\`             VARCHAR(500) NULL DEFAULT NULL,
            \`status\`            ENUM('active','inactive') NOT NULL DEFAULT 'active',
            \`sort_order\`        INT          NOT NULL DEFAULT 0,
            \`created_at\`        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
            \`updated_at\`        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
                                 ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (\`id\`),
            UNIQUE KEY \`uk_events_slug\` (\`slug\`),
            KEY \`idx_events_date\` (\`event_date\`),
            KEY \`idx_events_status\` (\`status\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    // ── 9. event_images ───────────────────────────────────────
    // Verified columns: id, event_id, image, caption, sort_order, created_at
    await safeQuery(conn, `
        CREATE TABLE IF NOT EXISTS \`event_images\` (
            \`id\`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
            \`event_id\`   INT UNSIGNED NOT NULL,
            \`image\`      VARCHAR(500) NOT NULL,
            \`caption\`    VARCHAR(500) NULL DEFAULT NULL,
            \`sort_order\` INT          NOT NULL DEFAULT 0,
            \`created_at\` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (\`id\`),
            KEY \`idx_ei_event\` (\`event_id\`),
            CONSTRAINT \`fk_ei_event\`
                FOREIGN KEY (\`event_id\`) REFERENCES \`events\` (\`id\`)
                ON DELETE CASCADE ON UPDATE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    // ── 10. faculty ───────────────────────────────────────────
    // Verified columns: id, name, designation, qualification, short_bio,
    //   bio(longtext), photo, email, phone, facebook_url, instagram_url,
    //   linkedin_url, youtube_url, status, sort_order, created_at, updated_at
    await safeQuery(conn, `
        CREATE TABLE IF NOT EXISTS \`faculty\` (
            \`id\`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
            \`name\`          VARCHAR(150) NOT NULL,
            \`designation\`   VARCHAR(150) NULL DEFAULT NULL,
            \`qualification\` VARCHAR(255) NULL DEFAULT NULL,
            \`short_bio\`     TEXT         NULL DEFAULT NULL,
            \`bio\`           LONGTEXT     NULL DEFAULT NULL,
            \`photo\`         VARCHAR(500) NULL DEFAULT NULL,
            \`email\`         VARCHAR(150) NULL DEFAULT NULL,
            \`phone\`         VARCHAR(30)  NULL DEFAULT NULL,
            \`facebook_url\`  VARCHAR(500) NULL DEFAULT NULL,
            \`instagram_url\` VARCHAR(500) NULL DEFAULT NULL,
            \`linkedin_url\`  VARCHAR(500) NULL DEFAULT NULL,
            \`youtube_url\`   VARCHAR(500) NULL DEFAULT NULL,
            \`status\`        ENUM('active','inactive') NOT NULL DEFAULT 'active',
            \`sort_order\`    INT          NOT NULL DEFAULT 0,
            \`created_at\`    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
            \`updated_at\`    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
                             ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (\`id\`),
            KEY \`idx_faculty_status\` (\`status\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    // ── 11. gallery ───────────────────────────────────────────
    // VERIFIED REAL SCHEMA: title, description, image, status, sort_order
    // NOTE: The galleryController.js uses caption/category columns which
    // do NOT exist in the real DB. Those controllers will need fixing
    // separately. This table definition matches the ACTUAL database.
    await safeQuery(conn, `
        CREATE TABLE IF NOT EXISTS \`gallery\` (
            \`id\`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
            \`title\`       VARCHAR(255) NULL DEFAULT NULL,
            \`description\` TEXT         NULL DEFAULT NULL,
            \`image\`       VARCHAR(500) NULL DEFAULT NULL,
            \`status\`      ENUM('active','inactive') NOT NULL DEFAULT 'active',
            \`sort_order\`  INT          NOT NULL DEFAULT 0,
            \`created_at\`  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
            \`updated_at\`  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
                           ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (\`id\`),
            KEY \`idx_gallery_status\` (\`status\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    // ── 12. gallery_albums ────────────────────────────────────
    // Verified columns: id, title, slug, description, cover_image,
    //   status, sort_order, created_at, updated_at
    await safeQuery(conn, `
        CREATE TABLE IF NOT EXISTS \`gallery_albums\` (
            \`id\`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
            \`title\`       VARCHAR(255) NOT NULL,
            \`slug\`        VARCHAR(255) NOT NULL,
            \`description\` TEXT         NULL DEFAULT NULL,
            \`cover_image\` VARCHAR(500) NULL DEFAULT NULL,
            \`status\`      ENUM('active','inactive') NOT NULL DEFAULT 'active',
            \`sort_order\`  INT          NOT NULL DEFAULT 0,
            \`created_at\`  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
            \`updated_at\`  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
                           ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (\`id\`),
            UNIQUE KEY \`uk_albums_slug\` (\`slug\`),
            KEY \`idx_albums_status\` (\`status\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    // ── 13. gallery_images ────────────────────────────────────
    // Verified columns: id, album_id, image, caption, sort_order,
    //   created_at, updated_at
    await safeQuery(conn, `
        CREATE TABLE IF NOT EXISTS \`gallery_images\` (
            \`id\`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
            \`album_id\`   INT UNSIGNED NOT NULL,
            \`image\`      VARCHAR(500) NOT NULL,
            \`caption\`    VARCHAR(500) NULL DEFAULT NULL,
            \`sort_order\` INT          NOT NULL DEFAULT 0,
            \`created_at\` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
            \`updated_at\` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
                          ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (\`id\`),
            KEY \`idx_gi_album\` (\`album_id\`),
            CONSTRAINT \`fk_gi_album\`
                FOREIGN KEY (\`album_id\`) REFERENCES \`gallery_albums\` (\`id\`)
                ON DELETE CASCADE ON UPDATE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    // ── 14. home_hero_slides ──────────────────────────────────
    // VERIFIED REAL SCHEMA: uses `image` column (NOT media_type/media_path).
    // The heroController.js uses media_type+media_path — those controllers
    // reference the wrong schema. This table matches the ACTUAL database.
    await safeQuery(conn, `
        CREATE TABLE IF NOT EXISTS \`home_hero_slides\` (
            \`id\`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
            \`title\`       VARCHAR(255) NULL DEFAULT NULL,
            \`subtitle\`    VARCHAR(500) NULL DEFAULT NULL,
            \`description\` TEXT         NULL DEFAULT NULL,
            \`image\`       VARCHAR(500) NULL DEFAULT NULL,
            \`button_text\` VARCHAR(100) NULL DEFAULT NULL,
            \`button_url\`  VARCHAR(500) NULL DEFAULT NULL,
            \`status\`      ENUM('active','inactive') NOT NULL DEFAULT 'active',
            \`sort_order\`  INT          NOT NULL DEFAULT 0,
            \`created_at\`  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
            \`updated_at\`  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
                           ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (\`id\`),
            KEY \`idx_hero_status\` (\`status\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    // ── 15. homepage_content ──────────────────────────────────
    // VERIFIED REAL SCHEMA: multi-row sections table with section_key.
    // NOT a singleton. Each row is a named content section.
    // Columns: id, section_key, title, subtitle, description, image,
    //   button_text, button_url, status, sort_order, created_at, updated_at
    await safeQuery(conn, `
        CREATE TABLE IF NOT EXISTS \`homepage_content\` (
            \`id\`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
            \`section_key\` VARCHAR(100) NOT NULL,
            \`title\`       VARCHAR(255) NULL DEFAULT NULL,
            \`subtitle\`    VARCHAR(500) NULL DEFAULT NULL,
            \`description\` TEXT         NULL DEFAULT NULL,
            \`image\`       VARCHAR(500) NULL DEFAULT NULL,
            \`button_text\` VARCHAR(100) NULL DEFAULT NULL,
            \`button_url\`  VARCHAR(500) NULL DEFAULT NULL,
            \`status\`      ENUM('active','inactive') NOT NULL DEFAULT 'active',
            \`sort_order\`  INT          NOT NULL DEFAULT 0,
            \`created_at\`  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
            \`updated_at\`  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
                           ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (\`id\`),
            UNIQUE KEY \`uk_hp_content_key\` (\`section_key\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    // ── 16. homepage_counts ───────────────────────────────────
    // VERIFIED REAL SCHEMA: uses `value` (not `number_value`).
    // Columns: id, label, value, icon, sort_order, status,
    //   created_at, updated_at
    await safeQuery(conn, `
        CREATE TABLE IF NOT EXISTS \`homepage_counts\` (
            \`id\`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
            \`label\`      VARCHAR(150) NOT NULL,
            \`value\`      VARCHAR(100) NULL DEFAULT NULL,
            \`icon\`       VARCHAR(100) NULL DEFAULT NULL,
            \`sort_order\` INT          NOT NULL DEFAULT 0,
            \`status\`     ENUM('active','inactive') NOT NULL DEFAULT 'active',
            \`created_at\` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
            \`updated_at\` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
                          ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (\`id\`),
            KEY \`idx_counts_status\` (\`status\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    // ── 17. news ──────────────────────────────────────────────
    // Exists in real database. NOT previously in initDb.
    // Columns: id, title, slug, short_description, content(longtext),
    //   image, news_date, status, sort_order, created_at, updated_at
    await safeQuery(conn, `
        CREATE TABLE IF NOT EXISTS \`news\` (
            \`id\`                INT UNSIGNED NOT NULL AUTO_INCREMENT,
            \`title\`             VARCHAR(255) NOT NULL,
            \`slug\`              VARCHAR(255) NOT NULL,
            \`short_description\` TEXT         NULL DEFAULT NULL,
            \`content\`           LONGTEXT     NULL DEFAULT NULL,
            \`image\`             VARCHAR(500) NULL DEFAULT NULL,
            \`news_date\`         DATE         NULL DEFAULT NULL,
            \`status\`            ENUM('active','inactive') NOT NULL DEFAULT 'active',
            \`sort_order\`        INT          NOT NULL DEFAULT 0,
            \`created_at\`        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
            \`updated_at\`        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
                                 ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (\`id\`),
            UNIQUE KEY \`uk_news_slug\` (\`slug\`),
            KEY \`idx_news_status\` (\`status\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    // ── 18. notices ───────────────────────────────────────────
    await safeQuery(conn, `
        CREATE TABLE IF NOT EXISTS \`notices\` (
            \`id\`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
            \`title\`       VARCHAR(255) NOT NULL,
            \`slug\`        VARCHAR(255) NOT NULL,
            \`type\`        ENUM('text','image','pdf','video') NOT NULL DEFAULT 'text',
            \`content\`     LONGTEXT     NULL DEFAULT NULL,
            \`file_path\`   VARCHAR(500) NULL DEFAULT NULL,
            \`video_url\`   VARCHAR(500) NULL DEFAULT NULL,
            \`notice_date\` DATE         NOT NULL,
            \`status\`      ENUM('active','inactive') NOT NULL DEFAULT 'active',
            \`sort_order\`  INT          NOT NULL DEFAULT 0,
            \`created_at\`  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
            \`updated_at\`  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
                           ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (\`id\`),
            UNIQUE KEY \`uk_notices_slug\` (\`slug\`),
            KEY \`idx_notices_date\` (\`notice_date\`),
            KEY \`idx_notices_status\` (\`status\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    // ── 19. testimonials ──────────────────────────────────────
    // VERIFIED REAL SCHEMA: name, designation, message, image, rating,
    //   status(active|inactive), sort_order, created_at, updated_at
    // NOT: role, avatar, review, user_id, status=pending/approved/rejected
    await safeQuery(conn, `
        CREATE TABLE IF NOT EXISTS \`testimonials\` (
            \`id\`          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
            \`name\`        VARCHAR(150)    NOT NULL,
            \`designation\` VARCHAR(150)    NULL DEFAULT NULL,
            \`message\`     TEXT            NOT NULL,
            \`image\`       VARCHAR(500)    NULL DEFAULT NULL,
            \`rating\`      TINYINT UNSIGNED NULL DEFAULT NULL
                           COMMENT '1-5 star rating',
            \`status\`      ENUM('active','inactive') NOT NULL DEFAULT 'active',
            \`sort_order\`  INT             NOT NULL DEFAULT 0,
            \`created_at\`  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
            \`updated_at\`  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
                           ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (\`id\`),
            KEY \`idx_testimonials_status\` (\`status\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    // ── 20. admission_enquiries ───────────────────────────────
    // VERIFIED REAL SCHEMA: has both `mobile` AND `phone`,
    //   plus `address` as a separate column (not just `message`).
    await safeQuery(conn, `
        CREATE TABLE IF NOT EXISTS \`admission_enquiries\` (
            \`id\`             INT UNSIGNED NOT NULL AUTO_INCREMENT,
            \`student_name\`   VARCHAR(150) NOT NULL,
            \`dob\`            DATE         NOT NULL,
            \`gender\`         ENUM('Male','Female','Other') NOT NULL,
            \`class_applying\` VARCHAR(100) NOT NULL,
            \`stream\`         VARCHAR(100) NULL DEFAULT NULL,
            \`science_group\`  VARCHAR(100) NULL DEFAULT NULL,
            \`parent_name\`    VARCHAR(150) NULL DEFAULT NULL,
            \`father_name\`    VARCHAR(150) NULL DEFAULT NULL,
            \`mother_name\`    VARCHAR(150) NULL DEFAULT NULL,
            \`mobile\`         VARCHAR(30)  NULL DEFAULT NULL,
            \`phone\`          VARCHAR(30)  NULL DEFAULT NULL,
            \`email\`          VARCHAR(150) NOT NULL,
            \`address\`        TEXT         NULL DEFAULT NULL,
            \`message\`        TEXT         NULL DEFAULT NULL,
            \`admin_notes\`    TEXT         NULL DEFAULT NULL,
            \`status\`         ENUM('new','contacted','under_review','approved','enrolled','rejected')
                              NOT NULL DEFAULT 'new',
            \`created_at\`     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
            \`updated_at\`     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
                              ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (\`id\`),
            KEY \`idx_admission_status\` (\`status\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    // ── 21. contact_messages ──────────────────────────────────
    await safeQuery(conn, `
        CREATE TABLE IF NOT EXISTS \`contact_messages\` (
            \`id\`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
            \`name\`       VARCHAR(150) NOT NULL,
            \`email\`      VARCHAR(200) NOT NULL,
            \`subject\`    VARCHAR(300) NULL DEFAULT NULL,
            \`message\`    TEXT         NOT NULL,
            \`status\`     ENUM('new','read','replied','archived') NOT NULL DEFAULT 'new',
            \`is_read\`    TINYINT(1)   NOT NULL DEFAULT 0,
            \`created_at\` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
            \`updated_at\` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
                          ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (\`id\`),
            KEY \`idx_contact_status\` (\`status\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    // ── 22. site_settings ─────────────────────────────────────
    // VERIFIED REAL SCHEMA: all columns are NULL-able,
    //   footer_links is LONGTEXT (not JSON type).
    await safeQuery(conn, `
        CREATE TABLE IF NOT EXISTS \`site_settings\` (
            \`id\`                 INT UNSIGNED NOT NULL AUTO_INCREMENT,
            \`website_title\`      VARCHAR(255) NULL DEFAULT NULL,
            \`website_tagline\`    VARCHAR(500) NULL DEFAULT NULL,
            \`contact_address\`    TEXT         NULL DEFAULT NULL,
            \`contact_phone\`      VARCHAR(100) NULL DEFAULT NULL,
            \`contact_email\`      VARCHAR(150) NULL DEFAULT NULL,
            \`office_hours\`       VARCHAR(255) NULL DEFAULT NULL,
            \`map_url\`            VARCHAR(1000) NULL DEFAULT NULL,
            \`facebook_url\`       VARCHAR(500) NULL DEFAULT NULL,
            \`instagram_url\`      VARCHAR(500) NULL DEFAULT NULL,
            \`youtube_url\`        VARCHAR(500) NULL DEFAULT NULL,
            \`linkedin_url\`       VARCHAR(500) NULL DEFAULT NULL,
            \`twitter_url\`        VARCHAR(500) NULL DEFAULT NULL,
            \`footer_description\` TEXT         NULL DEFAULT NULL,
            \`footer_tagline\`     VARCHAR(500) NULL DEFAULT NULL,
            \`footer_address\`     TEXT         NULL DEFAULT NULL,
            \`footer_phone\`       VARCHAR(100) NULL DEFAULT NULL,
            \`footer_email\`       VARCHAR(150) NULL DEFAULT NULL,
            \`footer_copyright\`   VARCHAR(500) NULL DEFAULT NULL,
            \`footer_links\`       LONGTEXT     NULL DEFAULT NULL,
            \`created_at\`         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
            \`updated_at\`         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
                                  ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    // ── 23. website_settings ──────────────────────────────────
    // VERIFIED REAL SCHEMA: website_name, logo, favicon, email, phone,
    //   address, facebook, instagram, youtube, linkedin, twitter
    // NOT: alternate_phone, alternate_email, whatsapp_number
    await safeQuery(conn, `
        CREATE TABLE IF NOT EXISTS \`website_settings\` (
            \`id\`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
            \`website_name\` VARCHAR(255) NULL DEFAULT NULL,
            \`logo\`        VARCHAR(500) NULL DEFAULT NULL,
            \`favicon\`     VARCHAR(500) NULL DEFAULT NULL,
            \`email\`       VARCHAR(150) NULL DEFAULT NULL,
            \`phone\`       VARCHAR(100) NULL DEFAULT NULL,
            \`address\`     TEXT         NULL DEFAULT NULL,
            \`facebook\`    VARCHAR(500) NULL DEFAULT NULL,
            \`instagram\`   VARCHAR(500) NULL DEFAULT NULL,
            \`youtube\`     VARCHAR(500) NULL DEFAULT NULL,
            \`linkedin\`    VARCHAR(500) NULL DEFAULT NULL,
            \`twitter\`     VARCHAR(500) NULL DEFAULT NULL,
            \`created_at\`  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
            \`updated_at\`  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
                           ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    console.log("✅ All 23 tables verified.\n");

    // ── SAFE COLUMN MIGRATIONS ────────────────────────────────
    // Add columns that may be missing on older deployments.
    // Each addColIfMissing() call is idempotent.
    console.log("🔧 Checking for missing columns...");

    // gallery: description column (may be missing on older deployments)
    await addColIfMissing(conn, "gallery", "description",
        "TEXT NULL DEFAULT NULL AFTER `title`");

    // gallery: category column for Why Us section tabs
    await addColIfMissing(conn, "gallery", "category",
        "ENUM('academic','development','campus') NULL DEFAULT NULL AFTER `description`");

    // contact_messages: is_read may be missing on older deployments
    await addColIfMissing(conn, "contact_messages", "is_read",
        "TINYINT(1) NOT NULL DEFAULT 0 AFTER `status`");
    await addColIfMissing(conn, "contact_messages", "subject",
        "VARCHAR(300) NULL DEFAULT NULL AFTER `email`");

    // cms_admins: profile_image was added in a later version
    await addColIfMissing(conn, "cms_admins", "profile_image",
        "VARCHAR(500) NULL DEFAULT NULL AFTER `role`");

    // about_page: image columns added after initial schema
    await addColIfMissing(conn, "about_page", "mission_image",
        "VARCHAR(500) NULL DEFAULT NULL AFTER `mission_description`");
    await addColIfMissing(conn, "about_page", "vision_image",
        "VARCHAR(500) NULL DEFAULT NULL AFTER `vision_description`");
    await addColIfMissing(conn, "about_page", "values_image",
        "VARCHAR(500) NULL DEFAULT NULL AFTER `values_description`");

    // admission_enquiries columns that were added incrementally
    await addColIfMissing(conn, "admission_enquiries", "mobile",
        "VARCHAR(30) NULL DEFAULT NULL AFTER `mother_name`");
    await addColIfMissing(conn, "admission_enquiries", "address",
        "TEXT NULL DEFAULT NULL AFTER `email`");
    await addColIfMissing(conn, "admission_enquiries", "admin_notes",
        "TEXT NULL DEFAULT NULL AFTER `message`");
    await addColIfMissing(conn, "admission_enquiries", "stream",
        "VARCHAR(100) NULL DEFAULT NULL AFTER `class_applying`");
    await addColIfMissing(conn, "admission_enquiries", "science_group",
        "VARCHAR(100) NULL DEFAULT NULL AFTER `stream`");
    await addColIfMissing(conn, "admission_enquiries", "father_name",
        "VARCHAR(150) NULL DEFAULT NULL AFTER `parent_name`");
    await addColIfMissing(conn, "admission_enquiries", "mother_name",
        "VARCHAR(150) NULL DEFAULT NULL AFTER `father_name`");

    console.log("✅ Column check complete.\n");

    // ── SINGLETON SEED ROWS ───────────────────────────────────
    // Insert required rows ONLY when the table is completely empty.
    // Only uses columns that are VERIFIED to exist in the real schema.
    console.log("🌱 Checking required singleton rows...");

    // about_page singleton (id=1) — uses verified columns only
    const [[{ apCount }]] = await conn.query(
        "SELECT COUNT(*) AS apCount FROM `about_page`"
    );
    if (Number(apCount) === 0) {
        await conn.query(`
            INSERT INTO \`about_page\`
                (id, title, subtitle, description,
                 mission_title, mission_description,
                 vision_title,  vision_description,
                 values_title,  values_description)
            VALUES
                (1, 'About CNPS Public School', '', '',
                 'Our Mission', '', 'Our Vision', '',
                 'Our Values', '')`);
        console.log("   ✅ Inserted default about_page row (id=1)");
    }

    // website_settings singleton (id=1) — insert only if empty
    // Only sets id — all other columns are NULL-able and optional.
    const [[{ wsCount }]] = await conn.query(
        "SELECT COUNT(*) AS wsCount FROM `website_settings`"
    );
    if (Number(wsCount) === 0) {
        await conn.query(
            "INSERT INTO `website_settings` (id, website_name) VALUES (1, 'CNPS Public School')"
        );
        console.log("   ✅ Inserted default website_settings row (id=1)");
    }

    // homepage_content: NOT a singleton — no seed rows needed.
    // Content is managed through the admin panel.

    // site_settings: NOT a singleton — created via admin Settings page.
    // No seed row needed.
    // CORRECTION: The public footer and settings API return 404 if this
    // table is empty. Insert a default row so the public site loads cleanly.
    const [[{ ssCount }]] = await conn.query(
        "SELECT COUNT(*) AS ssCount FROM `site_settings`"
    );
    if (Number(ssCount) === 0) {
        await conn.query(
            "INSERT INTO `site_settings` (website_title, footer_copyright) VALUES ('CNPS Public School', '© CNPS Public School. All Rights Reserved.')"
        );
        console.log("   ✅ Inserted default site_settings row");
    }

    console.log("✅ Singleton rows verified.\n");

    // ── RE-ENABLE FK CHECKS AND CLOSE ─────────────────────────
    await conn.query("SET FOREIGN_KEY_CHECKS = 1");
    await conn.end();

    console.log("🎉 Database initialization complete — starting server.\n");
}
