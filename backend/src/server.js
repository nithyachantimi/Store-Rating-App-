import app from "./app.js";
import dotenv from "dotenv";
import initDB from "./init.js";
dotenv.config({ path: [".env.local", ".env"] });
const PORT = process.env.PORT || 5000;

try {
  await initDB();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
} catch (error) {
  console.error("Application startup failed:", error.message);
  process.exitCode = 1;
}
