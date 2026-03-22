const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const { connectDB } = require('./config/db');
const { createUsersTable } = require('./models/User');
const { createMessagesTable } = require('./models/Message');
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const messagesRoutes = require('./routes/messages');
const uploadRoutes = require('./routes/upload');
const initSocket = require('./socket/socket');
require('dotenv').config();
const storiesRoutes = require('./routes/stories');
const { createStoriesTable } = require('./models/Story');
const premiumRoutes = require('./routes/premium');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Connect to database
connectDB();

// Create tables
createUsersTable();
createMessagesTable();
createStoriesTable()

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET','POST','PUT','DELETE'],
  allowedHeaders: ['Content-Type','Authorization']
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/stories', storiesRoutes);
app.use('/api/premium', premiumRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Velo server is running 🔥' });
});

// Init Socket.io
initSocket(io);

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Velo server running on port ${PORT}`);
});
