const fs = require("fs");
const mysql = require("mysql2/promise");

const sqlFile =
  "C:\\xampp\\mysql\\cnps_cms_railway_import.sql";

const config = {
    host: "junction.proxy.rlwy.net",
    port: 45057,
    user: "root",
    password: "AOrCYLMkuEtecqCgrONHbgRmsaXNgBjj",
    database: "railway",
    multipleStatements: true,
};

async function importDatabase() {
    let connection;

    try {
        console.log("Reading SQL dump...");

        const sql = fs.readFileSync(sqlFile, "utf8");

        console.log(`SQL dump loaded: ${sql.length} characters`);
        console.log("Connecting to Railway MySQL...");

        connection = await mysql.createConnection(config);

        console.log("Connected successfully!");
        console.log("Importing database...");

        await connection.query(sql);

        console.log("=================================");
        console.log("DATABASE IMPORT SUCCESSFUL ✅");
        console.log("=================================");

    } catch (error) {
        console.error("DATABASE IMPORT FAILED ❌");
        console.error(error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

importDatabase();