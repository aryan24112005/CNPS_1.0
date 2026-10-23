"use strict";
require("dotenv").config();
const bcrypt  = require("bcryptjs");
const { Admin, sequelize } = require("../src/models/sql");

async function main() {
  await sequelize.authenticate();

  const email    = process.env.ADMIN_EMAIL    || "admin@cnps.com";
  const password = process.env.ADMIN_PASSWORD || "Admin@12345";
  const name     = process.env.ADMIN_NAME     || "CNPS Administrator";

  const existing = await Admin.findOne({ where: { email } });
  if (existing) {
    console.log(`Admin with email "${email}" already exists. No changes made.`);
    await sequelize.close();
    process.exit(0);
  }

  const salt = await bcrypt.genSalt(12);
  const hashed = await bcrypt.hash(password, salt);

  await Admin.create({
    name, email, password: hashed,
    role: "super_admin", status: "active",
  });

  console.log(`\n✅ Admin account created successfully!`);
  console.log(`   Email    : ${email}`);
  console.log(`   Password : ${password}`);
  console.log(`\n⚠️  IMPORTANT: Change this password immediately after first login!\n`);
  await sequelize.close();
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Failed to create admin:", err.message);
  process.exit(1);
});
