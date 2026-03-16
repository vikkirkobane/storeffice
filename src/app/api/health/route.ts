import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    // Quick DB check
    await db.execute(sql`SELECT 1+1 AS result`);
    return NextResponse.json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json({ status: 'error', db: 'disconnected', error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
