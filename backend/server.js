const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { initDB, dbRun, dbGet, dbAll } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'aether_super_secret_placement_key';

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Database
initDB();

// ==========================================
// Authentication Middleware
// ==========================================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required. Please log in.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Session expired or invalid token. Please log in again.' });
    }
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Administrator privileges required.' });
  }
};

// ==========================================
// Authentication Routes
// ==========================================

// Register User
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Set role as admin if registering with admin email, otherwise default user
    let role = 'user';
    if (email.toLowerCase() === 'admin@aether.com' || email.toLowerCase().startsWith('admin_aether')) {
      role = 'admin';
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Save user
    const result = await dbRun(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, passwordHash, role]
    );

    // Generate token
    const token = jwt.sign(
      { id: result.lastID, email, name, role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: { id: result.lastID, name, email, role }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error registering user' });
  }
});

// Login User
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Get Current User details
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await dbGet('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ==========================================
// Product Routes
// ==========================================

// Get All Products (with search and filter)
app.get('/api/products', async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (sort) {
      if (sort === 'price_asc') {
        query += ' ORDER BY price ASC';
      } else if (sort === 'price_desc') {
        query += ' ORDER BY price DESC';
      } else {
        query += ' ORDER BY created_at DESC';
      }
    } else {
      query += ' ORDER BY created_at DESC';
    }

    const products = await dbAll(query, params);
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// Get Single Product
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await dbGet('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching product' });
  }
});

// Admin: Add New Product
app.post('/api/products', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, price, stock, category, image_url } = req.body;
    if (!name || !description || !price || stock === undefined || !category || !image_url) {
      return res.status(400).json({ message: 'All product fields are required' });
    }

    const result = await dbRun(
      'INSERT INTO products (name, description, price, stock, category, image_url) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description, price, stock, category, image_url]
    );

    const newProduct = await dbGet('SELECT * FROM products WHERE id = ?', [result.lastID]);
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ message: 'Error creating product' });
  }
});

// Admin: Update Product
app.put('/api/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, price, stock, category, image_url } = req.body;
    const product = await dbGet('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await dbRun(
      `UPDATE products SET name = ?, description = ?, price = ?, stock = ?, category = ?, image_url = ? WHERE id = ?`,
      [
        name || product.name,
        description || product.description,
        price || product.price,
        stock !== undefined ? stock : product.stock,
        category || product.category,
        image_url || product.image_url,
        req.params.id
      ]
    );

    const updatedProduct = await dbGet('SELECT * FROM products WHERE id = ?', [req.params.id]);
    res.json(updatedProduct);
  } catch (err) {
    res.status(500).json({ message: 'Error updating product' });
  }
});

// Admin: Delete Product
app.delete('/api/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const product = await dbGet('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await dbRun('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting product' });
  }
});

// ==========================================
// Order / Checkout Routes
// ==========================================

// Create Checkout Order (Handles transaction logic manually for safety)
app.post('/api/orders', authenticateToken, async (req, res) => {
  try {
    const { items, total_amount } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // 1. Validate Stock first
    for (const item of items) {
      const product = await dbGet('SELECT * FROM products WHERE id = ?', [item.product_id]);
      if (!product) {
        return res.status(404).json({ message: `Product ID ${item.product_id} not found.` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, requested: ${item.quantity}.`
        });
      }
    }

    // 2. Create Order
    // Set payment_status as paid (mock checkout)
    const orderResult = await dbRun(
      'INSERT INTO orders (user_id, total_amount, status, payment_status) VALUES (?, ?, ?, ?)',
      [req.user.id, total_amount, 'completed', 'paid']
    );
    const orderId = orderResult.lastID;

    // 3. Create Order Items & Decrement Stock
    for (const item of items) {
      // Insert Order Item
      await dbRun(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, item.price]
      );
      // Update Product Stock
      await dbRun(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }

    res.status(201).json({
      message: 'Order placed successfully!',
      orderId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error processing order' });
  }
});

// Get Order History (Users get their own; Admins get all)
app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    let orders;
    if (req.user.role === 'admin') {
      // Admin reads all orders with User Name details
      orders = await dbAll(`
        SELECT o.*, u.name as user_name, u.email as user_email
        FROM orders o
        JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
      `);
    } else {
      // Regular user gets their own
      orders = await dbAll('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    }

    // Fetch items for each order
    for (let order of orders) {
      order.items = await dbAll(`
        SELECT oi.*, p.name as product_name, p.image_url
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [order.id]);
    }

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching order history' });
  }
});

// Admin: Update Order Status
app.put('/api/orders/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, payment_status } = req.body;
    const order = await dbGet('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await dbRun(
      'UPDATE orders SET status = ?, payment_status = ? WHERE id = ?',
      [status || order.status, payment_status || order.payment_status, req.params.id]
    );

    res.json({ message: 'Order updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating order status' });
  }
});

// ==========================================
// Admin Dashboard Analytics
// ==========================================
app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalSales = await dbGet("SELECT SUM(total_amount) as total FROM orders WHERE payment_status = 'paid'");
    const totalOrders = await dbGet("SELECT COUNT(*) as total FROM orders");
    const totalUsers = await dbGet("SELECT COUNT(*) as total FROM users WHERE role = 'user'");
    const totalProducts = await dbGet("SELECT COUNT(*) as total FROM products");

    const categorySales = await dbAll(`
      SELECT p.category, SUM(oi.quantity * oi.price) as sales
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.payment_status = 'paid'
      GROUP BY p.category
    `);

    const lowStock = await dbAll('SELECT id, name, stock, price FROM products WHERE stock < 10 ORDER BY stock ASC');

    const recentOrders = await dbAll(`
      SELECT o.id, o.total_amount, o.status, o.created_at, u.name as user_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 5
    `);

    res.json({
      overview: {
        totalSales: totalSales.total || 0,
        totalOrders: totalOrders.total || 0,
        totalUsers: totalUsers.total || 0,
        totalProducts: totalProducts.total || 0
      },
      categorySales,
      lowStock,
      recentOrders
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error compiling analytics stats' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
