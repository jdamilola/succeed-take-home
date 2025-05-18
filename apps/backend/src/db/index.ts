import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import logger from '@succeed/logger';
import * as schema from './schema';

console.log('DATABASE_URL 1', process.env.DATABASE_URL);

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Recommended settings for Postgres
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait for a connection
});

// Create Drizzle ORM instance with the schema
export const db = drizzle(pool, { schema });

// Initialize database connection
export const initDatabase = async (): Promise<void> => {
  try {
    // Test database connection by executing a simple query
    const result = await pool.query('SELECT NOW()');
    logger.info(`Database connection successful: ${result.rows[0].now}`);
  } catch (error) {
    logger.error(`Database initialization error: ${error}`);
    throw error;
  }
};
