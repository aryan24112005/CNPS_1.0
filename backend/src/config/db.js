"use strict";
const dns = require("node:dns");
const mongoose = require("mongoose");

// Fix Node.js DNS SRV resolution for MongoDB Atlas on some hosts
dns.setServers(["8.8.8.8", "1.1.1.1"]);

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not set in environment variables.");
  }

  await mongoose.connect(uri);

  console.log(`[DB] MongoDB connected: ${mongoose.connection.host}`);
}

module.exports = connectDB;
