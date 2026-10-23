require("dotenv").config();

const { sequelize, Admin } = require("./src/models/sql");

async function testAdminModel() {
  try {
    await sequelize.authenticate();

    const count = await Admin.count();

    console.log("MySQL connection: OK");
    console.log("Admin model: OK");
    console.log("Admins currently in MySQL:", count);
    console.log("Admin table:", Admin.getTableName());
  } catch (error) {
    console.error("Admin model test failed:", error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

testAdminModel();
