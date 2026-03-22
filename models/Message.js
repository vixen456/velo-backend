const { pool } = require('../config/db');

const createMessagesTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      content TEXT,
      message_type VARCHAR(20) DEFAULT 'text',
      file_url VARCHAR(255),
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;
  try {
    await pool.query(query);
    console.log('Messages table ready ✅');
  } catch (error) {
    console.error('Error creating messages table:', error.message);
  }
};

const Message = {
  // Send a message
  create: async (sender_id, receiver_id, content, message_type = 'text', file_url = null) => {
    const query = `
      INSERT INTO messages (sender_id, receiver_id, content, message_type, file_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await pool.query(query, [sender_id, receiver_id, content, message_type, file_url]);
    return result.rows[0];
  },

  // Get conversation between two users
  getConversation: async (user1_id, user2_id) => {
    const query = `
      SELECT m.*, 
        u.full_name as sender_name, 
        u.username as sender_username,
        u.avatar as sender_avatar
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE (m.sender_id = $1 AND m.receiver_id = $2)
        OR (m.sender_id = $2 AND m.receiver_id = $1)
      ORDER BY m.created_at ASC
    `;
    const result = await pool.query(query, [user1_id, user2_id]);
    return result.rows;
  },

  // Get all conversations for a user
  getChats: async (user_id) => {
    const query = `
      SELECT DISTINCT ON (other_user)
        CASE 
          WHEN sender_id = $1 THEN receiver_id 
          ELSE sender_id 
        END as other_user,
        m.*,
        u.full_name,
        u.username,
        u.avatar,
        u.is_online,
        u.last_seen
      FROM messages m
      JOIN users u ON u.id = CASE 
        WHEN sender_id = $1 THEN receiver_id 
        ELSE sender_id 
      END
      WHERE sender_id = $1 OR receiver_id = $1
      ORDER BY other_user, m.created_at DESC
    `;
    const result = await pool.query(query, [user_id]);
    return result.rows;
  },

  // Mark messages as read
  markAsRead: async (sender_id, receiver_id) => {
    const query = `
      UPDATE messages SET is_read = TRUE
      WHERE sender_id = $1 AND receiver_id = $2 AND is_read = FALSE
    `;
    await pool.query(query, [sender_id, receiver_id]);
  }
};

module.exports = { Message, createMessagesTable };
