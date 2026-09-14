import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import pool from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import websiteSettingsRoutes from "./routes/websiteSettingsRoutes.js";
import homepageRoutes from "./routes/homepageRoutes.js";
import aboutRoutes from "./routes/aboutRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import facultyRoutes from "./routes/facultyRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import galleryRoutes from "./routes/galleryRoutes.js";
import noticeRoutes from "./routes/noticeRoutes.js";
import publicNoticeRoutes from "./routes/publicNoticeRoutes.js";
import testimonialRoutes from "./routes/testimonialRoutes.js";
import publicTestimonialRoutes from "./routes/publicTestimonialRoutes.js";
import publicGalleryRoutes from "./routes/publicGalleryRoutes.js";
import publicEventRoutes from "./routes/publicEventRoutes.js";
import publicCourseRoutes from "./routes/publicCourseRoutes.js";
import publicFacultyRoutes from "./routes/publicFacultyRoutes.js";
import heroRoutes from "./routes/heroRoutes.js";
import publicHeroRoutes from "./routes/publicHeroRoutes.js";
import homepageCountsRoutes from "./routes/homepageCountsRoutes.js";
import publicHomepageCountsRoutes
    from "./routes/publicHomepageCountsRoutes.js";
import publicAboutRoutes from "./routes/publicAboutRoutes.js";
import aboutSectionsRoutes from "./routes/aboutSectionsRoutes.js";
import publicAboutSectionsRoutes from "./routes/publicAboutSectionsRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import publicSettingsRoutes from "./routes/publicSettingsRoutes.js";
import contactMessagesRoutes from "./routes/contactMessagesRoutes.js";
import admissionRoutes from "./routes/admissionRoutes.js";








dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsPath = path.resolve(__dirname, "../uploads");

// Security
app.use(
    helmet({
        crossOriginResourcePolicy: {
            policy: "cross-origin",
        },
    })
);

// CORS
app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
    })
);

// Body parser
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// Logger
app.use(morgan("dev"));

app.use("/uploads", express.static(uploadsPath));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/website-settings", websiteSettingsRoutes);
app.use("/api/homepage", homepageRoutes);
app.use("/api/about", aboutRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/public/notices", publicNoticeRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/public/testimonials", publicTestimonialRoutes);
app.use("/api/public/gallery", publicGalleryRoutes);
app.use("/api/public/events", publicEventRoutes);
app.use("/api/public/courses", publicCourseRoutes);
app.use("/api/public/faculty", publicFacultyRoutes);
app.use("/api/home/hero", heroRoutes);
app.use("/api/public/home/hero", publicHeroRoutes);
app.use("/api/homepage/counts", homepageCountsRoutes);
app.use(
    "/api/public/homepage/counts",
    publicHomepageCountsRoutes
);
app.use("/api/public/about", publicAboutRoutes);
app.use(
    "/api/about/sections",
    aboutSectionsRoutes
);
app.use(
    "/api/public/about/sections",
    publicAboutSectionsRoutes
);
app.use("/api/settings", settingsRoutes);
app.use("/api/public/settings", publicSettingsRoutes);
app.use("/api/contact", contactMessagesRoutes);
app.use("/api/admission", admissionRoutes);



// Health check
app.get("/api/health", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT 1 AS db");

        res.json({
            success: true,
            message: "CNPS Backend is running 🚀",
            database: "Connected ✅",
        });
    } catch (error) {
        console.error("Database connection error:", error);

        res.status(500).json({
            success: false,
            message: "Database connection failed",
        });
    }
});

// Global error handler
app.use((err, req, res, next) => {
    console.error("Backend Error:", err);

    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                success: false,
                message: "File size must not exceed 20 MB.",
            });
        }

        if (err.code === "LIMIT_FILE_COUNT") {
            return res.status(400).json({
                success: false,
                message: "Maximum 50 files can be uploaded at once.",
            });
        }

        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }

    return res.status(400).json({
        success: false,
        message: err.message || "Something went wrong.",
    });
});

export default app;