import pool from "./config/db.js";
import bcrypt from "bcrypt";

export const initializeAdminUser = async () => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env.local.");
  }
  const passwordHash = await bcrypt.hash(password, 10);
  await pool.query(
    `INSERT INTO users (name, email, password, address, role)
     VALUES (?, ?, ?, ?, 'admin')
     ON DUPLICATE KEY UPDATE
       name = VALUES(name), password = VALUES(password),
       address = VALUES(address), role = 'admin'`,
    [
      "Application Administrator",
      email,
      passwordHash,
      "100 Administration Avenue, Demo City",
    ]
  );
};
