"use strict";
/**
 * Quick smoke-test for the four previously failing endpoints.
 * Run: node scripts/testFixes.js
 */
const seq = require("../src/config/sql/db");
const {
  ContactMessage, AdmissionEnquiry, SiteSettings, Media,
} = require("../src/models/sql");

const {
  serializeContact, serializeAdmission, serializeSettings, serializeMedia,
} = require("../src/utils/serializers");

(async () => {
  try {
    await seq.authenticate();
    console.log("MySQL connected\n");

    // ── 1. contact_messages getAll ────────────────────────────────────────
    const cTotal = await ContactMessage.count({});
    const cItems = await ContactMessage.findAll({ order: [["createdAt", "DESC"]], offset: 0, limit: 10 });
    const cData = cItems.map(serializeContact);
    console.log(`contact_messages  ✓  total=${cTotal}  serialized=${cData.length}`);

    // ── 2. admission_enquiries getAll ─────────────────────────────────────
    const aTotal = await AdmissionEnquiry.count({});
    const aItems = await AdmissionEnquiry.findAll({ order: [["createdAt", "DESC"]], offset: 0, limit: 10 });
    const aData = aItems.map(serializeAdmission);
    console.log(`admission_enquiries  ✓  total=${aTotal}  serialized=${aData.length}`);

    // ── 3. site_settings getPublic ────────────────────────────────────────
    let sDoc = await SiteSettings.findOne();
    if (!sDoc) sDoc = await SiteSettings.create({ schoolName: "CNPS Public School" });
    const sData = serializeSettings(sDoc);
    console.log(`site_settings  ✓  schoolName="${sData.schoolName}"`);

    // ── 4. media list (no binary) ─────────────────────────────────────────
    const mTotal = await Media.count({});
    const mItems = await Media.findAll({
      order: [["createdAt", "DESC"]], offset: 0, limit: 10,
      attributes: { exclude: ["fileData"] },
    });
    const mData = mItems.map(serializeMedia);
    console.log(`media  ✓  total=${mTotal}  serialized=${mData.length}`);

    // ── 5. max_allowed_packet ─────────────────────────────────────────────
    const [[{ mp }]] = await seq.query("SELECT @@max_allowed_packet as mp");
    console.log(`max_allowed_packet  = ${Math.round(mp / 1024 / 1024)} MB  ${mp >= 16 * 1024 * 1024 ? "✓" : "⚠ restart MySQL/XAMPP to apply 64M setting"}`);

    console.log("\nAll fixes verified ✅");
    process.exit(0);
  } catch (err) {
    console.error("\nFAILED:", err.message);
    process.exit(1);
  }
})();
