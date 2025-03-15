/* eslint-disable turbo/no-undeclared-env-vars */
import { join, resolve } from 'path';
import { Environment, WinstonLogger } from '@ecohatch/utils-api';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

import { APP_NAME } from '../../constants';
import { seedPermissions } from './permission.seed';
import { seedUsers } from './user.seed';

// Load environment variables
dotenv.config({
  path: join(__dirname, `../../.env.${process.env.NODE_ENV}`),
});

export const logger = WinstonLogger.getInstance({
  environment: process.env.NODE_ENV as Environment,
  logsDirPath: resolve(process.cwd(), 'logs'),
  debugMode: process.env.DEBUG_MODE == 'true',
  appName: APP_NAME,
});

const seedInit = async (): Promise<void> => {
  const prisma = new PrismaClient();
  logger.info('🔍 Checking database connection...');
  try {
    // Attempt to connect to the database
    await prisma.$connect();
    logger.info('✅ Successfully connected to the database');

    // Seed users
    await seedUsers(prisma);
    // Seed permissions
    await seedPermissions(prisma);
  } catch (error) {
    logger.error('❌ Database connection failed');
    logger.error('Error details:');
    logger.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

// Execute the seed
seedInit().catch((error) => {
  logger.error('❌ Unexpected error:');
  logger.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
