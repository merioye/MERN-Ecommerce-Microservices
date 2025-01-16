import { PrismaClient } from '@prisma/client';

async function checkDatabaseConnection() {
  const prisma = new PrismaClient();
  console.log('🔍 Checking database connection...');

  try {
    // Attempt to connect to the database
    await prisma.$connect();
    console.log('✅ Successfully connected to the database');

    // Run a simple query to verify full functionality
    const currentTime = (await prisma.$queryRaw`SELECT NOW()`) as any;
    console.log('📊 Database query test successful');
    console.log(`Current database timestamp: ${currentTime[0]?.now}`);

    // Get database version
    const version = (await prisma.$queryRaw`SELECT version()`) as any;
    console.log(`Database version: ${version[0]?.version}`);
  } catch (error) {
    console.error('❌ Database connection failed');
    console.error('Error details:');
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the check
checkDatabaseConnection().catch((error) => {
  console.error('❌ Unexpected error:');
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
