import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './auth/auth.routes.js';
import chatRoutes from './chat/chat.routes.js';
import cookieParser from 'cookie-parser';
import { socketHandler, ensureBotOnline } from './chat/socket.manager.js';
import { setIo } from './chat/socket.server.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Allowed origins (comma-separated). Defaults to CLIENT_URL or localhost.
const allowedOrigins = (process.env.ALLOWED_ORIGINS || process.env.CLIENT_URL || 'http://localhost:3000, https://shipper-chat-eight.vercel.app')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);
console.log("allowed origins", allowedOrigins )

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  },
});

const corsOptions = {
  origin: function (origin: any, callback: any) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/auth', authRoutes);
app.use('/chat', chatRoutes);

// Socket.io handler
io.on('connection', (socket) => {
  socketHandler(io, socket);
});

// Ensure bot user is present and marked online
ensureBotOnline(io).catch((err: any) => console.error('Failed to ensure bot online:', err));
// Make io available to other modules
setIo(io);

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`[ShipperChat] Server is running on port ${PORT}`);
});
