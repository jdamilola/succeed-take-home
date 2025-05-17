import express from 'express';
import cors from 'cors';

import logger from '@succeed/logger';

import routes from './src/routes';
import { initDatabase } from './src/db';
import { applyMigrations } from './src/db/migrate';

// Create Express app
const app = express();

// Configure CORS
const corsOptions = {
  origin: true, // Allow any origin in development
  credentials: true, // Allow credentials (cookies, authorization headers)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// API routes
app.use('/api', routes);

// Default route
app.get('/', (req, res) => {
  res.send('Succeed Competition API is running');
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(`Error: ${err.message}`);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start server
const PORT = process.env.PORT || 9999;
const startServer = async () => {
  try {
    // Initialize database connection
    await initDatabase();
    
    // Apply database migrations (if in development environment)
    if (process.env.NODE_ENV === 'development') {
      try {
        await applyMigrations();
        logger.info('Database migrations applied');
      } catch (error) {
        logger.warn(`Migration error: ${error}`);
        logger.warn('Continuing with server startup...');
      }
    }
    
    // Start listening
    app.listen(PORT, () => {
      logger.info(`Server listening on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error(`Server startup error: ${error}`);
    process.exit(1);
  }
};

// Run the server
startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Promise Rejection: ${reason}`);
  // Don't exit in production, just log the error
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error}`);
  // Don't exit in production, just log the error
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});
