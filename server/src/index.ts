import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from '@/auth/auth.routes.js';
import chatRoutes from '@/chat/chat.routes';
import aiRoutes from '@/ai/ai.routes';
import { socketHandler } from '@/chat/socket.manager';

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
app.use('/ai', aiRoutes);

// Socket.io handler
io.on('connection', (socket) => {
  socketHandler(io, socket);
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`[ShipperChat] Server is running on port ${PORT}`);
});
