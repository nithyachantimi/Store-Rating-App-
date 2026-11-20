import pool from "../config/db.js";

const count = async (table) => {
  const [rows] = await pool.query(`SELECT COUNT(*) AS count FROM ${table}`);
  return Number(rows[0].count);
};

export const getTotalUsers = () => count("users");
export const getTotalStores = () => count("stores");
export const getTotalRatings = () => count("ratings");

export const getStoreList = async () => {
  const [rows] = await pool.query(`
    SELECT s.id, s.name, s.email, s.address, s.owner_id,
           owner.name AS owner_name,
           ROUND(averages.overall_rating, 2) AS rating
    FROM stores s
    LEFT JOIN users owner ON owner.id = s.owner_id
    LEFT JOIN (
      SELECT store_id, AVG(rating) AS overall_rating
      FROM ratings GROUP BY store_id
    ) averages ON averages.store_id = s.id
    ORDER BY s.name ASC
  `);
  return rows;
};

export const getDetailedUserList = async () => {
  const [rows] = await pool.query(`
    SELECT u.id, u.name, u.email, u.address, u.role,
           CASE WHEN u.role = 'store_owner' THEN ROUND(owner_ratings.rating, 2)
                ELSE NULL END AS rating
    FROM users u
    LEFT JOIN (
      SELECT s.owner_id, AVG(r.rating) AS rating
      FROM stores s
      JOIN ratings r ON r.store_id = s.id
      GROUP BY s.owner_id
    ) owner_ratings ON owner_ratings.owner_id = u.id
    ORDER BY u.name ASC
  `);
  return rows;
};
