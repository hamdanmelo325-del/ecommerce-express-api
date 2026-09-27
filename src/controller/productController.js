const pool = require("../config/database");

// 1. جلب جميع المنتجات مع البحث والترقيم
const getAllProducts = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let queryText = "SELECT * FROM products WHERE 1=1";
    const queryParams = [];

    if (search) {
      queryParams.push(`%${search}%`);
      queryText += ` AND name ILIKE $${queryParams.length}`;
    }

    if (category) {
      queryParams.push(category);
      queryText += ` AND category_id = $${queryParams.length}`;
    }

    queryParams.push(limit, offset);
    queryText += ` ORDER BY id ASC LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`;

    const result = await pool.query(queryText, queryParams);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      page: Number(page),
      data: result.rows
    });
  } catch (error) {
    console.error("Error fetching products:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 2. جلب منتج واحد بحسب الـ ID
const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM products WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error fetching product:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 3. إضافة منتج جديد مع التحقق (Validation)
const createProduct = async (req, res) => {
  const { category_id, name, description, price, stock_quantity, sku } = req.body;

  // التحقق من الحقول الفارغة (400 Bad Request)
  if (!category_id || !name || price === undefined || stock_quantity === undefined || !sku) {
    return res.status(400).json({ success: false, message: "All required fields must be provided" });
  }

  // التحقق من الأسعار والمخزون السالب (400 Bad Request)
  if (price < 0 || stock_quantity < 0) {
    return res.status(400).json({ success: false, message: "Price and stock quantity cannot be negative" });
  }

  try {
    const queryText = `
      INSERT INTO products (category_id, name, description, price, stock_quantity, sku)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
    `;
    const values = [category_id, name, description, price, stock_quantity, sku];
    const result = await pool.query(queryText, values);
    
    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: result.rows[0]
    });
  } catch (error) {
    // التعامل مع خطأ تكرار رمز SKU (409 Conflict)
    if (error.code === '23505') {
      return res.status(409).json({ success: false, message: "SKU already exists" });
    }
    console.error("Error creating product:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 4. تعديل منتج (PUT)
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, stock_quantity } = req.body;

  if (price !== undefined && price < 0 || stock_quantity !== undefined && stock_quantity < 0) {
    return res.status(400).json({ success: false, message: "Price and stock quantity cannot be negative" });
  }

  try {
    const queryText = `
      UPDATE products 
      SET name = $1, description = $2, price = $3, stock_quantity = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5 RETURNING *
    `;
    const result = await pool.query(queryText, [name, description, price, stock_quantity, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Error updating product:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 5. تعطيل منتج (PATCH /deactivate)
const deactivateProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "UPDATE products SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({
      success: true,
      message: "Product deactivated successfully",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Error deactivating product:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 6. حذف منتج (DELETE)
const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM products WHERE id = $1 RETURNING *", [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting product:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deactivateProduct,
  deleteProduct
};