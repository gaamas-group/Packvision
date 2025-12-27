import 'dotenv/config';
import express from 'express';
// import authRouter from './app/api/v1/auth.js';
import videosRouter from './app/api/v1/videos.js';
import ordersRouter from './app/api/v1/orders.js';

const app = express();
const PORT = process.env.PORT || 8000;

// CORS middleware - allow frontend to make requests
app.use((req, res, next) => {
  res.header(
    'Access-Control-Allow-Origin',
    process.env.FRONTEND_URL || 'http://localhost:5173'
  );
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

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
app.use('/api/v1', videosRouter);
app.use('/api/v1', ordersRouter);

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
