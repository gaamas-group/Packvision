import 'dotenv/config';
import express from 'express';
import authRouter from './app/api/v1/auth.js';
import videosRouter from './app/api/v1/videos.js';
import ordersRouter from './app/api/v1/orders.js';
import recordingsRouter from './app/api/v1/recordings.js';
import adminRouter from './app/api/v1/admin.js';
import videoMultipartRoutes from './app/api/v1/videos.multipart.js';

const app = express();
const PORT = process.env.PORT || 8000;
const allowedOrigins = [
  'http://localhost:5173',
  'https://packvision.vercel.app'
];

// CORS middleware - allow frontend to make requests
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Packvision Backend API is running',
    health: '/health',
    api: '/api/v1',
  });
});

// API routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1', videosRouter);
app.use('/api/v1', recordingsRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1', ordersRouter);
app.use('/api/v1', videoMultipartRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
