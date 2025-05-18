import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db } from './index';
import logger from '@succeed/logger';

/**
 * Apply database migrations
 */
export const applyMigrations = async (): Promise<void> => {
  try {
    logger.info('Applying database migrations...');
    await migrate(db, { migrationsFolder: './src/db/migrations' });
    logger.info('Migrations applied successfully');
  } catch (error) {
    logger.error(`Migration error: ${error}`);
    throw error;
  }
};
