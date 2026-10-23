"use strict";
const seq = require("../src/config/sql/db");

(async () => {
  try {
    await seq.authenticate();

    // Fix url and public_id to have empty-string defaults so partial inserts work
    await seq.query(
      "ALTER TABLE media " +
      "MODIFY COLUMN url VARCHAR(1000) NOT NULL DEFAULT '', " +
      "MODIFY COLUMN public_id VARCHAR(500) NOT NULL DEFAULT ''"
    );
    console.log("media  ✓  url and public_id defaults fixed");

    // Raise max_allowed_packet to 64 MB (needs root)
    try {
      await seq.query("SET GLOBAL max_allowed_packet = 67108864");
      const [[row]] = await seq.query("SELECT @@max_allowed_packet as mp");
      console.log("max_allowed_packet  ✓  " + Math.round(row.mp / 1024 / 1024) + " MB");
    } catch (e) {
      console.warn("Could not set max_allowed_packet globally:", e.message);
      console.warn("Add max_allowed_packet=64M to your my.ini [mysqld] section and restart MySQL.");
    }

    process.exit(0);
  } catch (err) {
    console.error("FAILED:", err.message);
    process.exit(1);
  }
})();
