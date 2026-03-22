const { pool } = require('../config/db');

const createUsersTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      full_name VARCHAR(100) NOT NULL,
      username VARCHAR(50) UNIQUE NOT NULL,
      phone VARCHAR(20) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      bio TEXT DEFAULT 'Hey there, I am using Velo ✨',
      avatar VARCHAR(255),
      is_premium BOOLEAN DEFAULT FALSE,
      premium_expires TIMESTAMP,
      is_online BOOLEAN DEFAULT FALSE,
      last_seen TIMESTAMP DEFAULT NOW(),
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;
  try {
    await pool.query(query);
    console.log('Users table ready ✅');
  } catch (error) {
    console.error('Error creating users table:', error.message);
  }
};

const User = {
  // Create new user
  create: async (full_name, username, phone, password) => {
    const query = `
      INSERT INTO users (full_name, username, phone, password)
      VALUES ($1, $2, $3, $4)
      RETURNING id, full_name, username, phone, bio, avatar, is_premium, created_at
    `;
    const result = await pool.query(query, [full_name, username, phone, password]);
    return result.rows[0];
  },

  // Find user by phone
  findByPhone: async (phone) => {
    const result = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
    return result.rows[0];
  },

  // Find user by username
  findByUsername: async (username) => {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0];
  },

  // Find user by id
  findById: async (id) => {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  },

  // Update user
  update: async (id, fields) => {
    const keys = Object.keys(fields);
    const values = Object.values(fields);
    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const query = `UPDATE users SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`;
    const result = await pool.query(query, [...values, id]);
    return result.rows[0];
  }
};

module.exports = { User, createUsersTable };
