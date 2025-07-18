require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

// Import routes
const { router: authRoutes } = require('./routes/auth');
const userRoutes = require('./routes/user');
const webhookRoutes = require('./routes/webhook');

const app = express();
const http = require("http").createServer(app);
const PORT = process.env.PORT || 4000;

// Connect to MongoDB
connectDB();

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://ucanapp.vercel.app',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check route
app.get('/', (req, res) => {
  res.json({
    message: 'MercadoLibre OAuth API Server',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/auth/meli',
      callback: '/auth/callback',
      user: '/me/:user_id',
      webhook: '/webhook/meli',
      events: '/webhook/events/:user_id'
    }
  });
});

// Routes
app.use('/auth', authRoutes);
app.use('/', userRoutes);
app.use('/webhook', webhookRoutes);

app.get("/", (req, res) => {
  res.send("¡Hola, soy el app de Mercado LIBRE!");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

http.listen(PORT, () => { 
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`MongoDB URI: ${process.env.MONGO_URI ? 'Connected' : 'Not configured'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

module.exports = app;