import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './auth/auth.routes.js';
import chatRoutes from './chat/chat.routes.js';
import { socketHandler, ensureBotOnline } from './chat/socket.manager.js';
import { setIo } from './chat/socket.server.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST','PUT','DELETE','PATCH'],
  },
});

app.use(cors());
app.use(express.json());

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
