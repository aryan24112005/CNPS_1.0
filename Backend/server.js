/**
 * CNPS CMS — Backend Entry Point
 *
 * Startup order:
 *  1. Load environment variables (.env)
 *  2. Run database initialization (create DB + tables + seed rows)
 *  3. Only on success → start Express server
 *
 * If database initialization fails, the process exits with a
 * clear error message describing what to check.
 */

import dotenv from "dotenv";
dotenv.config(); // Must be first — before any other imports read process.env

import { initializeDatabase } from "./src/config/initDb.js";
import app from "./src/app.js";

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        // ── Step 1: Database initialization ──────────────────
        await initializeDatabase();

        // ── Step 2: Start Express server ──────────────────────
        app.listen(PORT, () => {
            console.log(`🚀 CNPS Backend running on port ${PORT}`);
            console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
        });

    } catch (error) {
        console.error("\n❌ SERVER STARTUP FAILED\n");
        console.error("Reason:", error.message);
        console.error(
            "\n📋 Troubleshooting checklist:\n" +
            `   • DB_HOST     — ${process.env.DB_HOST || "(not set)"}\n` +
            `   • DB_PORT     — ${process.env.DB_PORT || "(not set)"}\n` +
            `   • DB_USER     — ${process.env.DB_USER || "(not set)"}\n` +
            `   • DB_PASSWORD — ${process.env.DB_PASSWORD ? "(set)" : "(empty)"}\n` +
            `   • DB_NAME     — ${process.env.DB_NAME || "(not set)"}\n` +
            "   • Check that the MySQL / Railway service is running\n" +
            "   • Check that the DB user has CREATE, ALTER, INSERT, SELECT privileges\n" +
            "   • On Railway: the database is pre-created — ensure credentials are correct\n"
        );
        process.exit(1);
    }
}

startServer();
