const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Helper functions to wrap sqlite3 in Promises
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this); // 'this' contains changes and lastID
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Initialize database schema
const initDB = async () => {
  try {
    // Create Users table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Products table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        price REAL NOT NULL,
        stock INTEGER NOT NULL,
        category TEXT NOT NULL,
        image_url TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Orders table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        total_amount REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        payment_status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `);

    // Create Order Items table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER,
        product_id INTEGER,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY(product_id) REFERENCES products(id)
      )
    `);

    console.log('Database tables initialized successfully.');

    // Seed data if products table is empty
    const productsCount = await dbGet('SELECT COUNT(*) AS count FROM products');
    if (productsCount.count === 0) {
      console.log('Seeding initial products data...');
      const seedProducts = [
        {
          name: 'AetherBook Pro',
          description: 'Next-generation laptop with 16-core neural processor, 32GB unified memory, and liquid retina glass display. Built for creators and developers.',
          price: 1899.99,
          stock: 15,
          category: 'Laptops',
          image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=60'
        },
        {
          name: 'Nova Sound ANC',
          description: 'Immersive sound with industry-leading hybrid active noise cancelling, spatial audio tracking, and 40-hour battery life.',
          price: 349.99,
          stock: 30,
          category: 'Audio',
          image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60'
        },
        {
          name: 'Chronos Smartwatch',
          description: 'Titanium chassis featuring continuous biometric tracking, multi-band GPS, and solar charging capability.',
          price: 299.99,
          stock: 25,
          category: 'Wearables',
          image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60'
        },
        {
          name: 'Zenith OLED 34"',
          description: 'Ultra-wide curved OLED gaming monitor, 240Hz refresh rate, 0.03ms response time. Unrivaled color accuracy and response.',
          price: 799.99,
          stock: 8,
          category: 'Displays',
          image_url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=60'
        },
        {
          name: 'Nebula Pro Phone',
          description: 'Featuring a revolutionary triple lens under-display camera system, custom AI chip, and ceramic shield drop protection.',
          price: 1099.99,
          stock: 20,
          category: 'Phones',
          image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=60'
        },
        {
          name: 'Apex Wireless Mouse',
          description: 'Ultra-lightweight gaming mouse (49g) with zero-latency optical switches, and 26,000 DPI precision sensor.',
          price: 89.99,
          stock: 50,
          category: 'Accessories',
          image_url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&auto=format&fit=crop&q=60'
        }
      ];

      for (const p of seedProducts) {
        await dbRun(
          'INSERT INTO products (name, description, price, stock, category, image_url) VALUES (?, ?, ?, ?, ?, ?)',
          [p.name, p.description, p.price, p.stock, p.category, p.image_url]
        );
      }
      console.log('Mock products seeded successfully.');
    }
  } catch (err) {
    console.error('Database initialization error:', err.message);
  }
};

module.exports = {
  db,
  dbRun,
  dbGet,
  dbAll,
  initDB
};
