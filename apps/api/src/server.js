import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import { initializeFirebase } from './config/firebase.js';
import publicRoutes from './routes/public.js';
import staffRoutes from './routes/staff.js';
import testDriveRoutes from './routes/testdrive.js';
import reservationRoutes from './routes/reservation.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Environment variables
const PORT = process.env.PORT || 3001;
const FIREBASE_DATABASE_URL = process.env.FIREBASE_DATABASE_URL;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
const NODE_ENV = process.env.NODE_ENV || 'development';
const TZ = process.env.TZ || 'Asia/Manila';

// Parse CORS origins (support comma-separated list)
const allowedOrigins = CORS_ORIGIN.split(',').map(origin => origin.trim());

// Set timezone
process.env.TZ = TZ;

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: NODE_ENV === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: false
}));

// CORS
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Compression
app.use(compression());

// Body parsing with size limits
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging
if (NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// Request logging middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Make io available in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api', publicRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/testdrive', testDriveRoutes);
app.use('/api/reservation', reservationRoutes);

// Health check
app.get('/health', (req, res) => {
  const healthcheck = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
    timezone: TZ,
    firebase: 'connected'
  };
  res.json(healthcheck);
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'BYD Queue Management API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    endpoints: {
      health: '/health',
      branches: '/api/branches',
      cars: '/api/cars?branch=MAIN',
      registrations: '/api/registrations?branch=MAIN',
      register: 'POST /api/register'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.method} ${req.url} not found`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: NODE_ENV === 'development' ? err.stack : undefined,
    timestamp: new Date().toISOString()
  });

  // Don't leak error details in production
  const message = NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;

  res.status(err.status || 500).json({
    success: false,
    error: 'Server Error',
    message
  });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join branch room
  socket.on('join-branch', (branch) => {
    socket.join(`branch:${branch}`);
    console.log(`Socket ${socket.id} joined branch:${branch}`);
  });

  // Leave branch room
  socket.on('leave-branch', (branch) => {
    socket.leave(`branch:${branch}`);
    console.log(`Socket ${socket.id} left branch:${branch}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// Firebase initialization
const initDB = async () => {
  try {
    if (!FIREBASE_DATABASE_URL) {
      throw new Error('FIREBASE_DATABASE_URL is not set in environment variables');
    }
    initializeFirebase();
    console.log('✓ Connected to Firebase Realtime Database');
  } catch (error) {
    console.error('Firebase initialization failed:', error.message);
    process.exit(1);
  }
};

// Start server
initDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log('═══════════════════════════════════════════════════');
    console.log('  Queue Management System API');
    console.log('═══════════════════════════════════════════════════');
    console.log(`✓ Server running on port ${PORT}`);
    console.log(`✓ Environment: ${NODE_ENV}`);
    console.log(`✓ Timezone: ${TZ}`);
    console.log(`✓ CORS Origin: ${CORS_ORIGIN}`);
    console.log('═══════════════════════════════════════════════════');
  });
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received, closing server gracefully...`);
  
  httpServer.close(() => {
    console.log('HTTP server closed');
    console.log('Firebase connection closed');
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
