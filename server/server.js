const dns = require('dns');
// Force IPv4 DNS resolution — fixes "connect ENETUNREACH" on Render/cloud hosts
// Node 18+ changed default from 'ipv4first' to 'verbatim', which breaks Gmail SMTP on IPv6-limited networks
dns.setDefaultResultOrder('ipv4first');

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { Server } = require('socket.io');
const http = require('http');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Robust CORS Configuration for Socket.IO & Express
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map(url => url.trim().replace(/\/+$/, ''))
  : ['*'];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);

    // If wildcard is allowed
    if (allowedOrigins.includes('*')) {
      return callback(null, true);
    }

    const cleanOrigin = origin.replace(/\/+$/, '');
    const isAllowed = allowedOrigins.some(allowed => {
      const cleanAllowed = allowed.replace(/\/+$/, '');
      return cleanAllowed === cleanOrigin || cleanAllowed === '*';
    });

    if (isAllowed) {
      return callback(null, true);
    } else {
      // Allow Vercel preview/production deployments and localhost automatically
      if (
        cleanOrigin.endsWith('.vercel.app') ||
        cleanOrigin.includes('localhost') ||
        cleanOrigin.includes('127.0.0.1')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

// Enable CORS for Express
app.use(cors(corsOptions));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));

// Basic Route
app.get('/', (req, res) => {
  res.send('LocalHire API is running');
});

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: corsOptions
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_room', (room) => {
    socket.join(room);
  });

  socket.on('send_message', (data) => {
    const rooms = [data.room];
    if (data.message && data.message.receiverId) {
      rooms.push(data.message.receiverId);
    }
    socket.to(rooms).emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
