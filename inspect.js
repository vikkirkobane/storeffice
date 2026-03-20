
const { Client } = require('pg');

const DATABASE_URL = 'postgresql://postgres:storeffice123@127.0.0.1:5432/storeffice';

async function inspect() {
  const client = new Client({
    connectionString: DATABASE_URL,
  });

  try {
    await client.connect();
    console.log("Connected to database.");

    const columnsRes = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'office_spaces'
      OR table_name = 'profiles'
    `);
    console.log("Columns found:", JSON.stringify(columnsRes.rows, null, 2));

    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log("Tables found:", JSON.stringify(tablesRes.rows, null, 2));

  } catch (err) {
    console.error("Inspection failed:", err);
  } finally {
    await client.end();
  }
}

inspect();
