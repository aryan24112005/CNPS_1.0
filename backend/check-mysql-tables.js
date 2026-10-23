require("dotenv").config();

const sequelize = require("./src/config/sql/db");

async function checkTables() {
  try {
    const [tables] = await sequelize.query("SHOW TABLES");

    console.log("\nTables in database:");
    console.table(tables);

    console.log(`\nTotal tables found: ${tables.length}`);
  } catch (error) {
    console.error("Failed to fetch tables:", error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

checkTables();
