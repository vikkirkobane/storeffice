
import { db } from "./src/lib/db";
import { sql } from "drizzle-orm";

async function inspect() {
  try {
    const columns = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'office_spaces'
    `);
    console.log("Columns in office_spaces:", JSON.stringify(columns.rows, null, 2));
    
    const tables = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log("Tables in public schema:", JSON.stringify(tables.rows, null, 2));
  } catch (err) {
    console.error("Inspection failed:", err);
  } finally {
    process.exit();
  }
}

inspect();
