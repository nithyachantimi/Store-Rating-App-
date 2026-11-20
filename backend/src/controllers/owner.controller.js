import pool from "../config/db.js";

export const getStoreRatingsByOwner = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.id AS store_id, s.name AS store_name, s.email AS store_email,
             s.address AS store_address,
             ROUND(averages.overall_rating, 2) AS overall_rating,
             r.id AS rating_id, r.rating, r.created_at,
             u.id AS user_id, u.name AS user_name, u.email AS user_email
      FROM stores s
      LEFT JOIN (
        SELECT store_id, AVG(rating) AS overall_rating
        FROM ratings GROUP BY store_id
      ) averages ON averages.store_id = s.id
      LEFT JOIN ratings r ON r.store_id = s.id
      LEFT JOIN users u ON u.id = r.user_id
      WHERE s.owner_id = ?
      ORDER BY s.name ASC, r.created_at DESC
    `, [req.user.id]);
    return res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Owner dashboard error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to load your store dashboard." });
  }
};
