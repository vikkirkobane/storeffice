#!/usr/bin/env ts-node

/**
 * Storeffice Database Bootstrap
 *
 * 1. Verifies DATABASE_URL is set
 * 2. Tests connection
 * 3. Optionally applies migrations (drizzle-kit push)
 */

import { testConnection } from '../src/lib/db';

async function bootstrap() {
  console.log('🔧 Storeffice DB Bootstrap');

  // Check env
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ DATABASE_URL is not set');
    process.exit(1);
  }
  console.log('✅ DATABASE_URL found');

  // Test connection
  try {
    await testConnection();
  } catch (err) {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  }

  console.log('✅ Database connection OK');
  console.log('💡 Run `npm run db:push` to apply schema migrations');
}

bootstrap().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
