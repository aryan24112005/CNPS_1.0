"use strict";
require("dotenv").config();

const express      = require("express");
const cors         = require("cors");
const helmet       = require("helmet");
const morgan       = require("morgan");
const rateLimit    = require("express-rate-limit");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();

// ── Trust proxy (needed on Render / any PaaS) ────────────────
app.set("trust proxy", 1);

// ── Security headers ─────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false,
}));

// ── CORS ─────────────────────────────────────────────────────
const allowedOrigins = [
  "https://cnpspublicschooll.netlify.app",
  ...(process.env.FRONTEND_URL || "http://localhost:5173")
    .split(",").map((s) => s.trim()).filter(Boolean),
].filter((v, i, arr) => arr.indexOf(v) === i);

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

// ── Body parsing ──────────────────────────────────────────────
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// ── Request logging ───────────────────────────────────────────
if (process.env.NODE_ENV !== "test") app.use(morgan("dev"));

// ── Rate limiting ─────────────────────────────────────────────
app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, max: 500, standardHeaders: true, legacyHeaders: false, message: { success: false, message: "Too many requests. Please try again later." } }));
app.use("/api/auth/login", rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false, message: { success: false, message: "Too many login attempts. Please try again in 15 minutes." } }));
app.use("/api/contact", rateLimit({ windowMs: 60 * 60 * 1000, max: 15, standardHeaders: true, legacyHeaders: false, message: { success: false, message: "Too many enquiries submitted. Please try again in an hour." } }));

// ── Routes ────────────────────────────────────────────────────
app.use("/api/auth",         require("./routes/authRoutes"));
app.use("/api/hero",         require("./routes/heroRoutes"));
app.use("/api/homepage",     require("./routes/homepageRoutes"));
app.use("/api/faculty",      require("./routes/facultyRoutes"));
app.use("/api/courses",      require("./routes/courseRoutes"));
app.use("/api/events",       require("./routes/eventRoutes"));
app.use("/api/gallery",      require("./routes/galleryRoutes"));
app.use("/api/notices",      require("./routes/noticeRoutes"));
app.use("/api/testimonials", require("./routes/testimonialRoutes"));
app.use("/api/settings",     require("./routes/settingsRoutes"));
app.use("/api/admissions",   require("./routes/admissionRoutes"));
app.use("/api/contact",      require("./routes/contactRoutes"));
app.use("/api/media",        require("./routes/mediaRoutes"));

// ── Health check ──────────────────────────────────────────────
app.get("/api/health", (_req, res) =>
  res.json({ success: true, status: "ok", message: "CNPS Backend is running 🚀", time: new Date().toISOString() })
);

// ── 404 ───────────────────────────────────────────────────────
app.use("/api/*", (_req, res) =>
  res.status(404).json({ success: false, message: "API route not found." })
);

// ── Global error handler ──────────────────────────────────────
app.use(errorHandler);

// ── Start server ──────────────────────────────────────────────
const PORT = parseInt(process.env.PORT) || 5000;

const { sequelize } = require("./models/sql");

sequelize.authenticate()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`\n✅ CNPS Backend running on http://localhost:${PORT}`);
      console.log(`   Environment : ${process.env.NODE_ENV || "development"}`);
      console.log(`   MySQL       : connected (${process.env.MYSQL_DB || "cnps_school"})\n`);
    });

    // ── EADDRINUSE: give a clear, actionable error instead of a raw crash ──
    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`\n❌ Port ${PORT} is already in use.`);
        console.error(`   Another process (possibly an earlier backend instance) is already`);
        console.error(`   listening on port ${PORT}.`);
        console.error(`\n   Options:`);
        console.error(`     1. If the existing server is up-to-date, use it directly — no restart needed.`);
        console.error(`     2. To use a different port, set PORT=<number> in your .env file,`);
        console.error(`        then update VITE_API_URL in frontend/.env to match.`);
        console.error(`     3. To stop the existing server, close the terminal window running it,`);
        console.error(`        then run: npm run dev\n`);
        process.exit(1);
      } else {
        throw err;
      }
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MySQL:", err.message);
    console.error("   Check MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASS, MYSQL_DB in .env");
    process.exit(1);
  });

module.exports = app;
