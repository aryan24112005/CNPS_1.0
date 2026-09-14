import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import pool from "./src/config/db.js";

dotenv.config();

const createAdmin = async () => {
    try {
        const name = "Administrator";
        const email = "admin@cnps.com";
        const password = "Admin@12345";

        // Check if admin already exists
        const [existing] = await pool.query(
            "SELECT id FROM cms_admins WHERE email = ? LIMIT 1",
            [email]
        );

        if (existing.length > 0) {
            console.log("❌ Admin with this email already exists.");
            process.exit(0);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Insert admin
        await pool.query(
            `INSERT INTO cms_admins
       (name, email, password, role, status)
       VALUES (?, ?, ?, 'admin', 'active')`,
            [name, email, hashedPassword]
        );

        console.log("✅ Admin created successfully!");
        console.log("Email:", email);
        console.log("Password:", password);

        process.exit(0);
    } catch (error) {
        console.error("❌ Failed to create admin:", error);
        process.exit(1);
    }
};

createAdmin();