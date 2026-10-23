"use strict";
require("dotenv").config();
const sequelize = require("../src/config/sql/db");

async function migrate() {
  try {
    const [cols] = await sequelize.query(
      "SHOW COLUMNS FROM `admission_enquiries` LIKE 'consent_accepted'"
    );

    if (cols.length > 0) {
      console.log("consent_accepted column already exists — skipping migration.");
    } else {
      await sequelize.query(
        "ALTER TABLE `admission_enquiries` ADD COLUMN `consent_accepted` TINYINT(1) NOT NULL DEFAULT 0 AFTER `admin_notes`"
      );
      await sequelize.query(
        "ALTER TABLE `admission_enquiries` ADD COLUMN `consent_version` VARCHAR(20) NULL AFTER `consent_accepted`"
      );
      await sequelize.query(
        "ALTER TABLE `admission_enquiries` ADD COLUMN `consent_at` DATETIME NULL AFTER `consent_version`"
      );
      console.log(
        "✅ Added consent_accepted, consent_version, consent_at to admission_enquiries"
      );
    }
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

migrate();
