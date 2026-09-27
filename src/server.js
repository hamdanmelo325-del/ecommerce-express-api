require("dotenv").config();
const app = require("./app");
const pool = require("./config/database");

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("✅ Database connected successfully to Neon PostgreSQL!");
    console.log("⏰ Current time from DB:", result.rows[0].now);

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Database Connection Error:", error);
  }
}

startServer();