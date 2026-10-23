-- ============================================================
-- CNPS Public School — MySQL / MariaDB Schema
-- Compatible with Hostinger MySQL databases.
--
-- Run this file once to create the database structure.
-- Usage: mysql -h HOST -u USER -p DATABASE < schema.sql
-- ============================================================

SET NAMES utf8mb4;
SET foreign_key_checks = 0;

-- ── admins ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `admins` (
  `id`                    INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `name`                  VARCHAR(200)     NOT NULL,
  `email`                 VARCHAR(255)     NOT NULL,
  `password`              VARCHAR(255)     NOT NULL,   -- bcrypt hash
  `role`                  ENUM('admin','super_admin') NOT NULL DEFAULT 'admin',
  `status`                ENUM('active','inactive')  NOT NULL DEFAULT 'active',
  `reset_password_token`  VARCHAR(255)     NULL,
  `reset_password_expires` BIGINT UNSIGNED NULL,        -- Unix ms timestamp
  `created_at`            DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`            DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_admins_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── site_settings ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `site_settings` (
  `id`                INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `school_name`       VARCHAR(300)  NOT NULL DEFAULT 'CNPS Public School',
  `tagline`           VARCHAR(500)  NULL,
  `description`       TEXT          NULL,
  `email`             VARCHAR(255)  NULL,
  `phone`             VARCHAR(50)   NULL,
  `phone2`            VARCHAR(50)   NULL,
  `address`           TEXT          NULL,
  `map_embed_url`     TEXT          NULL,
  `facebook_url`      VARCHAR(500)  NULL,
  `twitter_url`       VARCHAR(500)  NULL,
  `instagram_url`     VARCHAR(500)  NULL,
  `youtube_url`       VARCHAR(500)  NULL,
  `linkedin_url`      VARCHAR(500)  NULL,
  `logo_url`          VARCHAR(1000) NULL,
  `logo_public_id`    VARCHAR(500)  NULL,
  `favicon_url`       VARCHAR(1000) NULL,
  `favicon_public_id` VARCHAR(500)  NULL,
  `principal_name`        VARCHAR(200) NULL,
  `principal_message`     TEXT         NULL,
  `footer_about`          TEXT         NULL,
  `footer_copyright`      VARCHAR(500) NULL,
  `about_heading`         VARCHAR(300) NULL,
  `about_description`     TEXT         NULL,
  `about_mission`         TEXT         NULL,
  `about_vision`          TEXT         NULL,
  `about_values`          TEXT         NULL,
  `about_image1_url`       VARCHAR(1000) NULL,
  `about_image1_public_id` VARCHAR(500)  NULL,
  `about_image2_url`       VARCHAR(1000) NULL,
  `about_image2_public_id` VARCHAR(500)  NULL,
  `about_image3_url`       VARCHAR(1000) NULL,
  `about_image3_public_id` VARCHAR(500)  NULL,
  `about_images`           JSON         NULL,
  `created_at`        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── hero_slides ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `hero_slides` (
  `id`          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `title`       VARCHAR(300)  NULL,
  `subtitle`    VARCHAR(500)  NULL,
  `description` TEXT          NULL,
  `button_text` VARCHAR(100)  NULL,
  `button_url`  VARCHAR(500)  NULL DEFAULT '/admission',
  `image_url`   VARCHAR(1000) NULL,
  `image_public_id` VARCHAR(500) NULL,
  `status`      ENUM('active','inactive') NOT NULL DEFAULT 'active',
  `sort_order`  INT           NOT NULL DEFAULT 0,
  `created_at`  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_hero_status` (`status`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── homepage_content ───────────────────────────────────────────────────────
-- Singleton row (only one record exists at a time)
CREATE TABLE IF NOT EXISTS `homepage_content` (
  `id`                 INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `about_heading`      VARCHAR(300) NULL,
  `about_subheading`   VARCHAR(500) NULL,
  `about_description`  TEXT         NULL,
  `about_image_url`    VARCHAR(1000) NULL,
  `about_image_public_id` VARCHAR(500) NULL,
  `about_points`       JSON         NULL,   -- JSON array of strings
  `why_us_heading`     VARCHAR(300) NULL,
  `why_us_description` TEXT         NULL,
  `cta_heading`        VARCHAR(300) NULL,
  `cta_description`    TEXT         NULL,
  `cta_button_text`    VARCHAR(100) NULL,
  `cta_button_url`     VARCHAR(500) NULL,
  `created_at`         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── count_stats ────────────────────────────────────────────────────────────
-- Child rows of homepage_content (replaces MongoDB countStats subdocument array)
CREATE TABLE IF NOT EXISTS `count_stats` (
  `id`                   INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `homepage_content_id`  INT UNSIGNED NOT NULL,
  `category`             ENUM('Students','Events','Faculty','Courses') NOT NULL DEFAULT 'Students',
  `icon`                 VARCHAR(100) NULL DEFAULT 'bi-people-fill',
  `value`                INT UNSIGNED NOT NULL DEFAULT 0,
  `label`                VARCHAR(200) NULL,
  `suffix`               VARCHAR(20)  NULL DEFAULT '+',
  `sort_order`           INT          NOT NULL DEFAULT 0,
  `created_at`           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_stats_homepage` (`homepage_content_id`),
  CONSTRAINT `fk_stats_homepage` FOREIGN KEY (`homepage_content_id`)
    REFERENCES `homepage_content`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── faculty ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `faculty` (
  `id`            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `name`          VARCHAR(200)  NOT NULL,
  `designation`   VARCHAR(200)  NULL,
  `qualification` VARCHAR(300)  NULL,
  `experience`    VARCHAR(100)  NULL,
  `short_bio`     TEXT          NULL,
  `bio`           TEXT          NULL,
  `photo_url`     VARCHAR(1000) NULL,
  `photo_public_id` VARCHAR(500) NULL,
  `email`         VARCHAR(255)  NULL,
  `phone`         VARCHAR(50)   NULL,
  `facebook`      VARCHAR(500)  NULL,
  `instagram`     VARCHAR(500)  NULL,
  `linkedin`      VARCHAR(500)  NULL,
  `youtube`       VARCHAR(500)  NULL,
  `status`        ENUM('active','inactive') NOT NULL DEFAULT 'active',
  `sort_order`    INT           NOT NULL DEFAULT 0,
  `created_at`    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_faculty_status` (`status`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── courses ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `courses` (
  `id`                INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `title`             VARCHAR(300)  NOT NULL,
  `slug`              VARCHAR(350)  NOT NULL,
  `category`          VARCHAR(100)  NULL,
  `class_name`        VARCHAR(100)  NULL,
  `short_description` TEXT          NULL,
  `description`       TEXT          NULL,
  `class_teacher`     VARCHAR(200)  NULL,
  `timing`            VARCHAR(200)  NULL,
  `image_url`         VARCHAR(1000) NULL,
  `image_public_id`   VARCHAR(500)  NULL,
  `fee_pdf_url`       VARCHAR(1000) NULL,
  `fee_pdf_public_id` VARCHAR(500)  NULL,
  `timetable_pdf_url`       VARCHAR(1000) NULL,
  `timetable_pdf_public_id` VARCHAR(500)  NULL,
  `subjects`          JSON          NULL,   -- JSON array of strings
  `status`            ENUM('active','inactive') NOT NULL DEFAULT 'active',
  `sort_order`        INT           NOT NULL DEFAULT 0,
  `created_at`        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_courses_slug` (`slug`),
  KEY `idx_courses_status` (`status`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── course_books ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `course_books` (
  `id`          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `course_id`   INT UNSIGNED  NOT NULL,
  `name`        VARCHAR(300)  NOT NULL,
  `publisher`   VARCHAR(300)  NULL,
  `price`       VARCHAR(50)   NULL,
  `image_url`   VARCHAR(1000) NULL,
  `image_public_id` VARCHAR(500) NULL,
  `sort_order`  INT           NOT NULL DEFAULT 0,
  `created_at`  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_books_course` (`course_id`),
  CONSTRAINT `fk_books_course` FOREIGN KEY (`course_id`)
    REFERENCES `courses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── events ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `events` (
  `id`                INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `title`             VARCHAR(300)  NOT NULL,
  `slug`              VARCHAR(350)  NOT NULL,
  `description`       TEXT          NULL,
  `event_date`        DATETIME      NULL,
  `location`          VARCHAR(300)  NULL,
  `cover_image_url`   VARCHAR(1000) NULL,
  `cover_image_public_id` VARCHAR(500) NULL,
  `status`            ENUM('active','inactive') NOT NULL DEFAULT 'active',
  `sort_order`        INT           NOT NULL DEFAULT 0,
  `created_at`        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_events_slug` (`slug`),
  KEY `idx_events_status` (`status`, `event_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── event_gallery ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `event_gallery` (
  `id`          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `event_id`    INT UNSIGNED  NOT NULL,
  `url`         VARCHAR(1000) NOT NULL,
  `public_id`   VARCHAR(500)  NOT NULL,
  `caption`     VARCHAR(500)  NULL,
  `sort_order`  INT           NOT NULL DEFAULT 0,
  `created_at`  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_event_gallery_event` (`event_id`),
  CONSTRAINT `fk_event_gallery` FOREIGN KEY (`event_id`)
    REFERENCES `events`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── gallery_albums ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `gallery_albums` (
  `id`                  INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `title`               VARCHAR(300)  NOT NULL,
  `slug`                VARCHAR(350)  NOT NULL,
  `description`         TEXT          NULL,
  `category`            ENUM('academic','development','campus','general') NOT NULL DEFAULT 'general',
  `cover_image_url`     VARCHAR(1000) NULL,
  `cover_image_public_id` VARCHAR(500) NULL,
  `status`              ENUM('active','inactive') NOT NULL DEFAULT 'active',
  `sort_order`          INT           NOT NULL DEFAULT 0,
  `created_at`          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_albums_slug` (`slug`),
  KEY `idx_albums_status` (`status`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── gallery_images ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `gallery_images` (
  `id`          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `album_id`    INT UNSIGNED  NOT NULL,
  `url`         VARCHAR(1000) NOT NULL,
  `public_id`   VARCHAR(500)  NOT NULL,
  `caption`     VARCHAR(500)  NULL,
  `sort_order`  INT           NOT NULL DEFAULT 0,
  `created_at`  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_gallery_images_album` (`album_id`),
  CONSTRAINT `fk_gallery_images_album` FOREIGN KEY (`album_id`)
    REFERENCES `gallery_albums`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── notices ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `notices` (
  `id`                  INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `title`               VARCHAR(300)  NOT NULL,
  `slug`                VARCHAR(350)  NOT NULL,
  `content`             TEXT          NULL,
  `file_url`            VARCHAR(1000) NULL,
  `file_public_id`      VARCHAR(500)  NULL,
  `file_resource_type`  ENUM('image','raw','') NULL DEFAULT '',
  `status`              ENUM('active','inactive') NOT NULL DEFAULT 'active',
  `sort_order`          INT           NOT NULL DEFAULT 0,
  `created_at`          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_notices_slug` (`slug`),
  KEY `idx_notices_status` (`status`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── testimonials ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `testimonials` (
  `id`          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `name`        VARCHAR(200)  NOT NULL,
  `designation` VARCHAR(200)  NULL,
  `content`     TEXT          NOT NULL,
  `rating`      TINYINT UNSIGNED NOT NULL DEFAULT 5,
  `avatar_url`  VARCHAR(1000) NULL,
  `avatar_public_id` VARCHAR(500) NULL,
  `status`      ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `sort_order`  INT           NOT NULL DEFAULT 0,
  `created_at`  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_testimonials_status` (`status`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── media ──────────────────────────────────────────────────────────────────
-- Stores uploaded file binary data (LONGBLOB) and metadata.
-- Images/PDFs are served via GET /api/media/:id which streams the BLOB.
CREATE TABLE IF NOT EXISTS `media` (
  `id`            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `original_name` VARCHAR(500)  NULL,
  `file_data`     LONGBLOB      NOT NULL,
  `url`           VARCHAR(1000) NULL,
  `public_id`     VARCHAR(500)  NULL,
  `resource_type` ENUM('image','raw') NOT NULL DEFAULT 'image',
  `mime_type`     VARCHAR(100)  NULL,
  `size`          BIGINT UNSIGNED NULL,
  `folder`        VARCHAR(200)  NULL DEFAULT 'media',
  `uploaded_by`   INT UNSIGNED  NULL,
  `tags`          JSON          NULL,
  `created_at`    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_media_resource_type` (`resource_type`),
  KEY `idx_media_folder` (`folder`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── admission_enquiries ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `admission_enquiries` (
  `id`              INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `student_name`    VARCHAR(200)  NOT NULL,
  `dob`             VARCHAR(50)   NULL,
  `gender`          ENUM('Male','Female','Other') NOT NULL,
  `class_name`      VARCHAR(100)  NOT NULL,
  `stream`          VARCHAR(100)  NULL DEFAULT '',
  `science_group`   VARCHAR(100)  NULL DEFAULT '',
  `father_name`     VARCHAR(200)  NULL DEFAULT '',
  `mother_name`     VARCHAR(200)  NULL DEFAULT '',
  `mobile`          VARCHAR(50)   NOT NULL,
  `email`           VARCHAR(255)  NULL DEFAULT '',
  `address`         TEXT          NOT NULL,
  `status`          ENUM('new','reviewed','contacted','admitted','rejected') NOT NULL DEFAULT 'new',
  `admin_notes`     TEXT          NULL,
  `created_at`      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_admissions_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── contact_messages ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `contact_messages` (
  `id`          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `name`        VARCHAR(200)  NOT NULL,
  `email`       VARCHAR(255)  NOT NULL,
  `phone`       VARCHAR(50)   NULL,
  `subject`     VARCHAR(300)  NULL,
  `message`     TEXT          NOT NULL,
  `is_read`     TINYINT(1)    NOT NULL DEFAULT 0,
  `status`      ENUM('new','read','replied','archived') NOT NULL DEFAULT 'new',
  `admin_notes` TEXT          NULL,
  `created_at`  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_contact_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET foreign_key_checks = 1;
