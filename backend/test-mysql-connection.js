require("dotenv").config();

const sequelize = require("./src/config/sql/db");

async function testConnection() {
  try {
    await sequelize.authenticate();

    console.log("SUCCESS: MySQL connection established!");

    const [results] = await sequelize.query("SELECT DATABASE() AS databaseName");

    console.log("Connected database:", results[0].databaseName);
  } catch (error) {
    console.error("MySQL connection failed:", error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

testConnection();
