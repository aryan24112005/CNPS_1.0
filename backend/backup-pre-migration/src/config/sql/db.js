"use strict";
/**
 * MySQL / Sequelize connection for Hostinger deployment.
 *
 * Required environment variables (set in Render / Hostinger environment):
 *   MYSQL_HOST     – database host (e.g. localhost or Hostinger MySQL server)
 *   MYSQL_PORT     – defaults to 3306
 *   MYSQL_USER     – database username
 *   MYSQL_PASS     – database password
 *   MYSQL_DB       – database name
 *
 * The connection pool is exported as `sequelize`. Call sequelize.authenticate()
 * to verify connectivity at application startup.
 */

const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.MYSQL_DB   || "cnps_school",
  process.env.MYSQL_USER || "root",
  process.env.MYSQL_PASS || "",
  {
    host:    process.env.MYSQL_HOST || "localhost",
    port:    parseInt(process.env.MYSQL_PORT || "3306", 10),
    dialect: "mysql",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    pool: {
      max:     10,
      min:     0,
      acquire: 30000,
      idle:    10000,
    },
    define: {
      // Use snake_case column names: createdAt → created_at
      underscored:   true,
      // Don't pluralise table names automatically
      freezeTableName: false,
      timestamps:    true,
    },
  }
);

module.exports = sequelize;
