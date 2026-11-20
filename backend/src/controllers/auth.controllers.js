import pool from "../config/db.js";
import bcrypt from "bcrypt";
import { createToken } from "../config/jwt.js";
import {
  isValidEmail,
  normalizeEmail,
  validatePassword,
  validateUserFields,
} from "../utils/validation.js";

const publicUser = ({ id, name, email, address, role }) => ({
  id,
  name,
  email,
  address,
  role,
});

export const signup = async (req, res) => {
  const { errors, value } = validateUserFields(req.body);
  if (Object.keys(errors).length) {
    return res.status(400).json({ success: false, message: Object.values(errors)[0], errors });
  }

  try {
    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [
      value.email,
    ]);
    if (existing.length) {
      return res.status(409).json({ success: false, message: "An account with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(value.password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, 'user')",
      [value.name, value.email, passwordHash, value.address]
    );
    const user = {
      id: result.insertId,
      name: value.name,
      email: value.email,
      address: value.address,
      role: "user",
    };
    createToken(user, res);
    return res.status(201).json({ success: true, message: "Signup successful", user });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ success: false, message: "An account with this email already exists." });
    }
    console.error("Signup error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to create account." });
  }
};

export const login = async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = req.body?.password;
  if (!isValidEmail(email) || typeof password !== "string" || !password) {
    return res.status(400).json({ success: false, message: "Enter a valid email and password." });
  }

  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (!rows.length || !(await bcrypt.compare(password, rows[0].password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }
    const user = publicUser(rows[0]);
    createToken(rows[0], res);
    return res.json({ success: true, message: "Login successful", user });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to sign in right now." });
  }
};

export const logout = (_req, res) => {
  res.clearCookie("jwt", { httpOnly: true, sameSite: "lax", path: "/" });
  return res.status(200).json({ success: true, message: "Logged out successfully." });
};

export const updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (typeof currentPassword !== "string" || !currentPassword) {
    return res.status(400).json({ success: false, message: "Enter your current password." });
  }
  if (!validatePassword(newPassword)) {
    return res.status(400).json({
      success: false,
      message: "Password must be 8–16 characters and include an uppercase letter and a special character.",
    });
  }

  try {
    const [rows] = await pool.query("SELECT id, password FROM users WHERE id = ?", [
      req.user.id,
    ]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    if (!(await bcrypt.compare(currentPassword, rows[0].password))) {
      return res.status(401).json({ success: false, message: "Current password is incorrect." });
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password = ? WHERE id = ?", [
      passwordHash,
      req.user.id,
    ]);
    return res.json({ success: true, message: "Password updated successfully." });
  } catch (error) {
    console.error("Password update error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to update password." });
  }
};

export const checkAuth = (req, res) =>
  res.status(200).json({ success: true, user: req.user });
