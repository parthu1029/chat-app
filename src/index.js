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

app.get("/", (req, res) => {
    const collect = (basePath, router) => {
        const routes = [];
        const stack = router && router.stack ? router.stack : [];
        stack.forEach((layer) => {
            if (layer && layer.route && layer.route.path != null) {
                const routePath = layer.route.path;
                const methods = Object.keys(layer.route.methods || {}).map((m) => m.toUpperCase());
                const middlewares = (layer.route.stack || [])
                    .map((s) => s.name)
                    .filter((n) => n && n !== 'bound dispatch');
                const normalizedPath = routePath === '/' ? '' : routePath;
                routes.push({ path: `${basePath}${normalizedPath}`, methods, middlewares });
            }
        });
        return routes;
    };

    const routes = [
        ...collect('/api/auth', authRoutes),
        ...collect('/api', messageRoutes),
    ];
    res.send(`
        <h1>Available Routes</h1>
        <pre>${JSON.stringify(routes, null, 2)}</pre>
    `);
});

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
