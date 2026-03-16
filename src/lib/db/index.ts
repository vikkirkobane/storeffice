import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Configure connection pool
const client = postgres(connectionString, {
  max: 10, // maximum number of connections in pool
  idle_timeout: 20, // close idle connections after 20 seconds
});

export const db = drizzle(client, { schema });

// Test connection
export async function testConnection() {
  try {
    const result = await client`SELECT 1+1 AS result`;
    console.log("Database connection successful:", result[0].result);
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    throw error;
  }
}

export { schema };
