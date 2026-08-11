import postgres from 'postgres';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PASSWORD = 'SaSokKWqkpobCPAE';
const PROJECT_REF = 'uoqhjgbkojtimdtcqinm';
const connectionString = `postgresql://postgres:${PASSWORD}@db.${PROJECT_REF}.supabase.co:5432/postgres`;

console.log(`[Creatives Migration] Connecting to Supabase database...`);
const sql = postgres(connectionString, {
  ssl: 'require',
  max: 1,
  idle_timeout: 10,
  connect_timeout: 15,
});

async function run() {
  try {
    const migrationPath = path.resolve(__dirname, '../../supabase/migrations/002_creatives_schema.sql');
    console.log(`[Creatives Migration] Reading migration file: ${migrationPath}`);
    const sqlContent = fs.readFileSync(migrationPath, 'utf8');

    console.log(`[Creatives Migration] Executing 002_creatives_schema.sql...`);
    await sql.unsafe(sqlContent);
    console.log(`[Creatives Migration] ✅ Successfully executed 002_creatives_schema.sql!`);

    // Verify creatives table columns
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'creatives' AND table_schema = 'public'
      ORDER BY column_name;
    `;
    console.log(`[Creatives Migration] Columns in public.creatives:`, columns.map(c => c.column_name).join(', '));

    // Verify creatives_with_metrics view
    const testView = await sql`SELECT count(*) as count FROM creatives_with_metrics`;
    console.log(`[Creatives Migration] ✅ Verified creatives_with_metrics view works! Row count: ${testView[0].count}`);

  } catch (err) {
    console.error(`[Creatives Migration] ❌ Error executing migration:`, err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

run();
