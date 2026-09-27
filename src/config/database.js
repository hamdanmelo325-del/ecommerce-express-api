const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_YTy2cMEA6OkQ@ep-icy-feather-b4sb78fx-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require&uselibpqcompat=true",
  ssl: { rejectUnauthorized: false }
});

module.exports = pool;