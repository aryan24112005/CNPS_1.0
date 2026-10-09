"use strict";
require("dotenv").config();
const connectDB = require("../src/config/db");
const Admin     = require("../src/models/Admin");

async function main() {
  await connectDB();

  const email    = process.env.ADMIN_EMAIL    || "admin@cnps.com";
  const password = process.env.ADMIN_PASSWORD || "Admin@12345";
  const name     = process.env.ADMIN_NAME     || "CNPS Administrator";

  const existing = await Admin.findOne({ email });
  if (existing) {
    console.log(`Admin with email "${email}" already exists. No changes made.`);
    process.exit(0);
  }

  await Admin.create({ name, email, password, role: "superadmin", status: "active" });
  console.log(`\n✅ Admin account created successfully!`);
  console.log(`   Email    : ${email}`);
  console.log(`   Password : ${password}`);
  console.log(`\n⚠️  IMPORTANT: Change this password immediately after first login!\n`);
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Failed to create admin:", err.message);
  process.exit(1);
});
