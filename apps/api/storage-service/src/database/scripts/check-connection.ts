import { join } from 'path';
import * as dotenv from 'dotenv';
import mongoose from 'mongoose';

import { Config } from '@/enums';

// Load environment variables
dotenv.config({
  path: join(__dirname, `../../.env.${process.env[Config.NODE_ENV]}`),
});

async function checkDatabaseConnection() {
  console.log('🔍 Checking database connection...');

  try {
    const mongoUri = process.env[Config.DATABASE_URL];
    if (!mongoUri) {
      throw new Error('DATABASE_URL is not set');
    }

    // Attempt to connect to the database
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // Give up after 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });

    console.log('✅ Successfully connected to database');

    // Get connection state as readable string
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    const stateStr = states[mongoose.connection.readyState];
    console.log(`Connection state: ${stateStr}`);

    // Run admin command to get server status and version info
    const db = mongoose.connection.db;
    const admin = db?.admin();

    // Get server info
    const serverStatus = await admin?.serverStatus();
    console.log(`📊 Database server status check successful`);
    console.log(
      `Server uptime: ${Math.floor(serverStatus?.uptime / 86400)} days, ${Math.floor((serverStatus?.uptime % 86400) / 3600)} hours`
    );
    console.log(`Database version: ${serverStatus?.version}`);

    // Get current date and time from server
    const serverTime = await db?.command({ serverStatus: 1, time: true });
    console.log(
      `Current server timestamp: ${new Date(serverTime?.localTime).toISOString()}`
    );

    // Check database responsiveness with ping
    const start = Date.now();
    await admin?.ping();
    const pingTime = Date.now() - start;
    console.log(`Database ping response time: ${pingTime}ms`);

    // List available databases (requires admin privileges)
    try {
      const dbs = await admin?.listDatabases();
      console.log(
        `Available databases: ${dbs?.databases.map((db) => db.name).join(', ')}`
      );
    } catch (error) {
      console.log('Could not list databases (may require admin privileges)');
    }
  } catch (error) {
    console.error('❌ Database connection failed');
    console.error('Error details:');
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    // Close the connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('Database connection closed');
    }
  }
}

// Execute the check
checkDatabaseConnection().catch((error) => {
  console.error('❌ Unexpected error:');
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
