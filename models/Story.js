const { pool } = require('../config/db');

const createStoriesTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS stories (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      content TEXT,
      media_url VARCHAR(255),
      media_type VARCHAR(20) DEFAULT 'text',
      views INTEGER DEFAULT 0,
      expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '24 hours',
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;
  try {
    await pool.query(query);
    console.log('Stories table ready ✅');
  } catch (error) {
    console.error('Error creating stories table:', error.message);
  }
};

const Story = {
  // Create a story
  create: async (user_id, content, media_url, media_type) => {
    const query = `
      INSERT INTO stories (user_id, content, media_url, media_type)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await pool.query(query, [user_id, content, media_url, media_type]);
    return result.rows[0];
  },

  // Get all active stories from contacts
  getAll: async (user_id) => {
    const query = `
      SELECT s.*, 
        u.full_name, 
        u.username, 
        u.avatar
      FROM stories s
      JOIN users u ON s.user_id = u.id
      WHERE s.expires_at > NOW()
      ORDER BY s.created_at DESC
    `;
    const result = await pool.query(query, []);
    return result.rows;
  },

  // Get stories by a specific user
  getByUser: async (user_id) => {
    const query = `
      SELECT * FROM stories
      WHERE user_id = $1 AND expires_at > NOW()
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [user_id]);
    return result.rows;
  },

  // Add a view to a story
  addView: async (story_id) => {
    const query = `
      UPDATE stories SET views = views + 1
      WHERE id = $1 RETURNING *
    `;
    const result = await pool.query(query, [story_id]);
    return result.rows[0];
  },

  // Delete a story
  delete: async (story_id, user_id) => {
    const query = `
      DELETE FROM stories
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [story_id, user_id]);
    return result.rows[0];
  },

  // Delete expired stories
  deleteExpired: async () => {
    await pool.query('DELETE FROM stories WHERE expires_at < NOW()');
  }
};

module.exports = { Story, createStoriesTable };
