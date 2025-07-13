import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan'; // Optional: for request logging
import { initSocket } from './config/socket.js';
import authRoutes from './routes/authRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import { notFound, errorHandler } from './middlewares/error.js';

dotenv.config(); // Load env variables

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev')); // Logs incoming requests

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', messageRoutes);

// Global Middleware for 404 & Errors
app.use(notFound);
app.use(errorHandler);

// Initialize Socket.IO
initSocket(server);

// Port
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
