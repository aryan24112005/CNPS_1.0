"use strict";
require("dotenv").config();
const { Admin, sequelize } = require("../src/models/sql");

Admin.findAll({ attributes: ["id","name","email","role","status"] })
  .then((rows) => {
    console.log("Admins in DB:");
    rows.forEach(r => console.log(`  id=${r.id} email=${r.email} role=${r.role} status=${r.status}`));
  })
  .catch(e => console.error(e.message))
  .finally(() => sequelize.close());
