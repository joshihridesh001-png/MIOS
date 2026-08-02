import postgres from 'postgres';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PASSWORD = 'SaSokKWqkpobCPAE';
const PROJECT_REF = 'uoqhjgbkojtimdtcqinm';

// Try direct db domain first
const connectionString = `postgresql://postgres:${PASSWORD}@db.${PROJECT_REF}.supabase.co:5432/postgres`;

console.log(`[Migration] Connecting to Supabase database for project: ${PROJECT_REF}...`);

const sql = postgres(connectionString, {
  ssl: 'require',
  max: 1,
  idle_timeout: 10,
  connect_timeout: 15,
});

async function run() {
  try {
    const migrationPath = path.resolve(__dirname, '../../supabase/migrations/000_full_setup.sql');
    console.log(`[Migration] Reading migration file: ${migrationPath}`);
    const sqlContent = fs.readFileSync(migrationPath, 'utf8');

    console.log(`[Migration] Executing migration...`);
    await sql.unsafe(sqlContent);
    console.log(`[Migration] ✅ Successfully executed 000_full_setup.sql!`);

    // Verify campaigns table columns
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'campaigns' AND table_schema = 'public'
      ORDER BY column_name;
    `;
    console.log(`[Migration] Existing columns in public.campaigns:`, columns.map(c => c.column_name).join(', '));

    // Verify campaigns_with_metrics view
    const testView = await sql`SELECT count(*) as count FROM campaigns_with_metrics`;
    console.log(`[Migration] ✅ Verified campaigns_with_metrics view works! Row count: ${testView[0].count}`);

  } catch (err) {
    console.error(`[Migration] ❌ Error executing migration:`, err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

run();
