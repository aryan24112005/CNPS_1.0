"use strict";
/**
 * Fix schema mismatches between the Sequelize models and the actual MySQL tables.
 * Run once: node scripts/fixSchema.js
 */
const seq = require("../src/config/sql/db");

(async () => {
  try {
    await seq.authenticate();
    console.log("Connected to MySQL\n");

    // ── contact_messages ───────────────────────────────────────────────────
    await seq.query(
      "ALTER TABLE contact_messages " +
      "ADD COLUMN IF NOT EXISTS is_read TINYINT(1) NOT NULL DEFAULT 0 AFTER message, " +
      "ADD COLUMN IF NOT EXISTS admin_notes TEXT NULL AFTER status"
    );
    console.log("contact_messages  ✓  is_read, admin_notes added (or already present)");

    // ── admission_enquiries ────────────────────────────────────────────────
    // The old table used: parent_name, class_applying, message, notes
    // The model expects:  student_name, dob, gender, class_name, stream,
    //                     science_group, father_name, mother_name, mobile,
    //                     email, address, status, admin_notes
    // First rename columns that just changed names, then add missing ones.
    const [admCols] = await seq.query("SHOW COLUMNS FROM admission_enquiries");
    const admColNames = admCols.map((c) => c.Field);

    if (admColNames.includes("parent_name") && !admColNames.includes("father_name")) {
      await seq.query("ALTER TABLE admission_enquiries CHANGE COLUMN parent_name father_name VARCHAR(200) NOT NULL DEFAULT ''");
      console.log("admission_enquiries  ✓  renamed parent_name → father_name");
    }
    if (admColNames.includes("class_applying") && !admColNames.includes("class_name")) {
      await seq.query("ALTER TABLE admission_enquiries CHANGE COLUMN class_applying class_name VARCHAR(100) NOT NULL");
      console.log("admission_enquiries  ✓  renamed class_applying → class_name");
    }
    if (admColNames.includes("notes") && !admColNames.includes("admin_notes")) {
      await seq.query("ALTER TABLE admission_enquiries CHANGE COLUMN notes admin_notes TEXT NULL");
      console.log("admission_enquiries  ✓  renamed notes → admin_notes");
    }
    if (admColNames.includes("message") && !admColNames.includes("address")) {
      await seq.query("ALTER TABLE admission_enquiries CHANGE COLUMN message address TEXT NOT NULL");
      console.log("admission_enquiries  ✓  renamed message → address");
    }

    // Re-fetch column list after renames
    const [admCols2] = await seq.query("SHOW COLUMNS FROM admission_enquiries");
    const admColNames2 = admCols2.map((c) => c.Field);

    const admAdd = [];
    if (!admColNames2.includes("dob"))          admAdd.push("ADD COLUMN dob VARCHAR(50) NULL");
    if (!admColNames2.includes("gender"))        admAdd.push("ADD COLUMN gender ENUM('Male','Female','Other') NOT NULL DEFAULT 'Male'");
    if (!admColNames2.includes("stream"))        admAdd.push("ADD COLUMN stream VARCHAR(100) NOT NULL DEFAULT ''");
    if (!admColNames2.includes("science_group")) admAdd.push("ADD COLUMN science_group VARCHAR(100) NOT NULL DEFAULT ''");
    if (!admColNames2.includes("mother_name"))   admAdd.push("ADD COLUMN mother_name VARCHAR(200) NOT NULL DEFAULT ''");
    if (!admColNames2.includes("mobile"))        admAdd.push("ADD COLUMN mobile VARCHAR(50) NOT NULL DEFAULT ''");
    if (!admColNames2.includes("student_name") && admColNames2.includes("email")) {
      // email column from original schema becomes the student_name if there's no student_name yet
    }
    if (!admColNames2.includes("student_name"))  admAdd.push("ADD COLUMN student_name VARCHAR(200) NOT NULL DEFAULT '' FIRST");
    if (!admColNames2.includes("admin_notes"))   admAdd.push("ADD COLUMN admin_notes TEXT NULL");

    if (admAdd.length) {
      await seq.query("ALTER TABLE admission_enquiries " + admAdd.join(", "));
      console.log("admission_enquiries  ✓  added: " + admAdd.join("; "));
    } else {
      console.log("admission_enquiries  ✓  all columns present");
    }

    // Make mobile column NOT NULL (if it was just added with empty default, that's fine)
    // ── site_settings ──────────────────────────────────────────────────────
    const settAdd = [
      "ADD COLUMN IF NOT EXISTS phone2 VARCHAR(50) NULL AFTER phone",
      "ADD COLUMN IF NOT EXISTS principal_name VARCHAR(200) NULL AFTER favicon_public_id",
      "ADD COLUMN IF NOT EXISTS principal_message TEXT NULL AFTER principal_name",
      "ADD COLUMN IF NOT EXISTS footer_about TEXT NULL AFTER principal_message",
      "ADD COLUMN IF NOT EXISTS footer_copyright VARCHAR(500) NULL AFTER footer_about",
      "ADD COLUMN IF NOT EXISTS about_heading VARCHAR(300) NULL AFTER footer_copyright",
      "ADD COLUMN IF NOT EXISTS about_description TEXT NULL AFTER about_heading",
      "ADD COLUMN IF NOT EXISTS about_mission TEXT NULL AFTER about_description",
      "ADD COLUMN IF NOT EXISTS about_vision TEXT NULL AFTER about_mission",
      "ADD COLUMN IF NOT EXISTS about_values TEXT NULL AFTER about_vision",
      "ADD COLUMN IF NOT EXISTS about_images JSON NULL AFTER about_image3_public_id",
    ];
    await seq.query("ALTER TABLE site_settings " + settAdd.join(", "));
    console.log("site_settings        ✓  all extra columns added (or already present)");

    // ── media (add file_data LONGBLOB) ─────────────────────────────────────
    const [mediaCols] = await seq.query("SHOW COLUMNS FROM media");
    const mediaColNames = mediaCols.map((c) => c.Field);
    if (!mediaColNames.includes("file_data")) {
      await seq.query("ALTER TABLE media ADD COLUMN file_data LONGBLOB NULL AFTER original_name");
      console.log("media                ✓  file_data LONGBLOB added");
    } else {
      console.log("media                ✓  file_data already present");
    }

    console.log("\nSchema fix complete.");
    process.exit(0);
  } catch (err) {
    console.error("Schema fix FAILED:", err.message);
    process.exit(1);
  }
})();
