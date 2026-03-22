const { Message } = require('../models/Message');
const { User } = require('../models/User');

const connectedUsers = {};

const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // User comes online
    socket.on('user_online', async (userId) => {
      connectedUsers[userId] = socket.id;
      await User.update(userId, { is_online: true });
      io.emit('user_status', { userId, is_online: true });
      console.log(`User ${userId} is online`);
    });

    // Send message in real time
    socket.on('send_message', async (data) => {
      try {
        const { sender_id, receiver_id, content, message_type } = data;

        // Save to database
        const message = await Message.create(
          sender_id,
          receiver_id,
          content,
          message_type || 'text'
        );

        // Send to receiver if online
        const receiverSocketId = connectedUsers[receiver_id];
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receive_message', message);
        }

        // Send back to sender as confirmation
        socket.emit('message_sent', message);

      } catch (error) {
        console.error('Socket message error:', error.message);
        socket.emit('message_error', { error: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing', (data) => {
      const receiverSocketId = connectedUsers[data.receiver_id];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user_typing', {
          sender_id: data.sender_id
        });
      }
    });

    // Stop typing
    socket.on('stop_typing', (data) => {
      const receiverSocketId = connectedUsers[data.receiver_id];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user_stop_typing', {
          sender_id: data.sender_id
        });
      }
    });

    // User disconnects
    socket.on('disconnect', async () => {
      const userId = Object.keys(connectedUsers).find(
        key => connectedUsers[key] === socket.id
      );
      if (userId) {
        delete connectedUsers[userId];
        await User.update(userId, {
          is_online: false,
          last_seen: new Date()
        });
        io.emit('user_status', { userId, is_online: false });
        console.log(`User ${userId} went offline`);
      }
    });
  });
};

module.exports = initSocket;
