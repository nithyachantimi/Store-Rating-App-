import pool from "../config/db.js";
import bcrypt from "bcrypt";
import {
  getDetailedUserList,
  getStoreList,
  getTotalRatings,
  getTotalStores,
  getTotalUsers,
} from "../models/admin.model.js";
import {
  isValidEmail,
  normalizeEmail,
  validateUserFields,
} from "../utils/validation.js";

export const addStore = async (req, res) => {
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  const email = normalizeEmail(req.body?.email);
  const address = typeof req.body?.address === "string" ? req.body.address.trim() : "";
  const ownerId = Number(req.body?.owner_id);
  if (!name || name.length > 60 || !isValidEmail(email) || !address || address.length > 400 || !Number.isInteger(ownerId)) {
    return res.status(400).json({ success: false, message: "Enter a store name, valid email, address, and store owner." });
  }

  try {
    const [[owner]] = await pool.query(
      "SELECT id FROM users WHERE id = ? AND role = 'store_owner'",
      [ownerId]
    );
    if (!owner) {
      return res.status(400).json({ success: false, message: "Select a valid store owner." });
    }
    const [[existing]] = await pool.query("SELECT id FROM stores WHERE email = ?", [email]);
    if (existing) {
      return res.status(409).json({ success: false, message: "A store already uses this email." });
    }
    const [result] = await pool.query(
      "INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)",
      [name, email, address, ownerId]
    );
    return res.status(201).json({ success: true, message: "Store created successfully.", storeId: result.insertId });
  } catch (error) {
    console.error("Add store error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to create store." });
  }
};

export const addUser = async (req, res) => {
  const role = req.body?.role;
  if (!["user", "admin", "store_owner"].includes(role)) {
    return res.status(400).json({ success: false, message: "Select a valid role." });
  }
  const { errors, value } = validateUserFields(req.body);
  if (Object.keys(errors).length) {
    return res.status(400).json({ success: false, message: Object.values(errors)[0], errors });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)",
      [value.name, value.email, await bcrypt.hash(value.password, 10), value.address, role]
    );
    return res.status(201).json({
      success: true,
      message: "User created successfully.",
      user: { id: result.insertId, name: value.name, email: value.email, address: value.address, role },
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ success: false, message: "An account with this email already exists." });
    }
    console.error("Add user error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to create user." });
  }
};

export const dashboard = async (_req, res) => {
  try {
    const [total_users, total_stores, total_ratings, store_list, detailed_user_list] =
      await Promise.all([
        getTotalUsers(),
        getTotalStores(),
        getTotalRatings(),
        getStoreList(),
        getDetailedUserList(),
      ]);
    return res.json({
      stats: { total_users, total_stores, total_ratings },
      store_list,
      user_list: detailed_user_list.filter((user) => ["user", "admin"].includes(user.role)),
      detailed_user_list,
    });
  } catch (error) {
    console.error("Admin dashboard error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to load the admin dashboard." });
  }
};
