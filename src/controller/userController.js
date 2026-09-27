const pool = require("../config/database");

// 1. جلب جميع المستخدمين
const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name, email, role, is_active, created_at FROM users ORDER BY id ASC");
    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 2. جلب مستخدم بحسب الـ ID
const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT id, name, email, role, is_active, created_at FROM users WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error fetching user:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 3. إنشاء مستخدم جديد
const createUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  // التحقق من الحقول الفارغة (400 Bad Request)
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Name, email, and password are required" });
  }

  try {
    const queryText = `
      INSERT INTO users (name, email, password, role)
      VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, is_active, created_at
    `;
    const values = [name, email, password, role || 'customer'];
    const result = await pool.query(queryText, values);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: result.rows[0]
    });
  } catch (error) {
    // التعامل مع البريد المكرر (409 Conflict)
    if (error.code === '23505') {
      return res.status(409).json({ success: false, message: "Email already exists" });
    }
    console.error("Error creating user:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 4. تغيير حالة المستخدم (PATCH /status)
const updateUserStatus = async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;

  if (is_active === undefined) {
    return res.status(400).json({ success: false, message: "is_active field is required" });
  }

  try {
    const result = await pool.query(
      "UPDATE users SET is_active = $1 WHERE id = $2 RETURNING id, name, email, is_active",
      [is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "User status updated successfully",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Error updating user status:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUserStatus
};