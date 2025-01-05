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

    // Check connection pool status
    const poolStatus = (await prisma.$queryRaw`SELECT
      sum(numbackends) as active_connections,
      max_conn as max_connections
    FROM pg_stat_database, pg_settings
    WHERE name = 'max_connections'
    GROUP BY max_conn`) as any;

    console.log(`Active connections: ${poolStatus[0]?.active_connections}`);
    console.log(`Maximum connections: ${poolStatus[0]?.max_connections}`);
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
