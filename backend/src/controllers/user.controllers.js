import pool from "../config/db.js";

export const getAllStores = async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.id AS store_id, s.name AS store_name, s.email, s.address,
             ROUND(averages.overall_rating, 2) AS overall_rating,
             mine.rating AS user_rating
      FROM stores s
      LEFT JOIN (
        SELECT store_id, AVG(rating) AS overall_rating
        FROM ratings GROUP BY store_id
      ) averages ON averages.store_id = s.id
      LEFT JOIN ratings mine ON mine.store_id = s.id AND mine.user_id = ?
      ORDER BY s.name ASC
    `, [ _req.user.id ]);
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error("Get stores error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to load stores." });
  }
};

export const addRating = async (req, res) => {
  const storeId = Number(req.params.id);
  const rating = Number(req.body?.rating);
  if (!Number.isInteger(storeId) || storeId < 1) {
    return res.status(400).json({ success: false, message: "Invalid store." });
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: "Rating must be a whole number from 1 to 5." });
  }

  try {
    const [[store]] = await pool.query("SELECT id FROM stores WHERE id = ?", [storeId]);
    if (!store) return res.status(404).json({ success: false, message: "Store not found." });

    await pool.query(
      `INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE rating = VALUES(rating), created_at = CURRENT_TIMESTAMP`,
      [req.user.id, storeId, rating]
    );
    const [[result]] = await pool.query(`
      SELECT COALESCE(ROUND(AVG(rating), 2), 0) AS overall_rating
      FROM ratings WHERE store_id = ?
    `, [storeId]);
    return res.json({
      success: true,
      message: "Rating saved successfully.",
      data: { overall_rating: result.overall_rating, user_rating: rating },
    });
  } catch (error) {
    console.error("Save rating error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to save rating." });
  }
};
