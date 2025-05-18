import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db } from './index';
import logger from '@succeed/logger';

/**
 * Apply database migrations
 */
export const applyMigrations = async (): Promise<void> => {
  // Load environment variables
  require('dotenv').config();

  console.log('DATABASE_URL 2', process.env.DATABASE_URL);

  try {
    logger.info('Applying database migrations...');
    await migrate(db, { migrationsFolder: './src/db/migrations' });
    logger.info('Migrations applied successfully');
  } catch (error) {
    logger.error(`Migration error: ${error}`);
    throw error;
  }
};

/**
 * Execute this file directly to run migrations
 */
if (require.main === module) {
  // Load environment variables
  require('dotenv').config();
  
  applyMigrations()
    .then(() => {
      logger.info('Database migration completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error(`Database migration failed: ${error}`);
      process.exit(1);
    });
}
