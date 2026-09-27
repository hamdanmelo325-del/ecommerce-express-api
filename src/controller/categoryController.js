const pool = require("../config/database");

// 1. جلب جميع التصنيفات
const getAllCategories = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM categories ORDER BY id ASC");
    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error("Error fetching categories:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 2. جلب تصنيف واحد بالـ ID
const getCategoryById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM categories WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error fetching category:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 3. إضافة تصنيف جديد
const createCategory = async (req, res) => {
  const { name, description } = req.body;
  try {
    const queryText = `
      INSERT INTO categories (name, description)
      VALUES ($1, $2) RETURNING *
    `;
    const result = await pool.query(queryText, [name, description]);
    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Error creating category:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 4. تعديل تصنيف
const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  try {
    const queryText = `
      UPDATE categories 
      SET name = $1, description = $2
      WHERE id = $3 RETURNING *
    `;
    const result = await pool.query(queryText, [name, description, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Error updating category:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 5. حذف تصنيف
const deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM categories WHERE id = $1 RETURNING *", [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.status(200).json({
      success: true,
      message: "Category deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting category:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};