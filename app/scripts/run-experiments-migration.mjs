import postgres from 'postgres';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PASSWORD = 'SaSokKWqkpobCPAE';
const PROJECT_REF = 'uoqhjgbkojtimdtcqinm';
const connectionString = `postgresql://postgres:${PASSWORD}@db.${PROJECT_REF}.supabase.co:5432/postgres`;

console.log(`[Experiments Migration] Connecting to Supabase database...`);
const sql = postgres(connectionString, {
  ssl: 'require',
  max: 1,
  idle_timeout: 10,
  connect_timeout: 15,
});

async function run() {
  try {
    const migrationPath = path.resolve(__dirname, '../../supabase/migrations/003_experiments_schema.sql');
    console.log(`[Experiments Migration] Reading migration file: ${migrationPath}`);
    const sqlContent = fs.readFileSync(migrationPath, 'utf8');

    console.log(`[Experiments Migration] Executing 003_experiments_schema.sql...`);
    await sql.unsafe(sqlContent);
    console.log(`[Experiments Migration] ✅ Successfully executed 003_experiments_schema.sql!`);

    // Verify experiments table columns
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'experiments' AND table_schema = 'public'
      ORDER BY column_name;
    `;
    console.log(`[Experiments Migration] Columns in public.experiments:`, columns.map(c => c.column_name).join(', '));

    // Check seed data
    const seedCheck = await sql`SELECT count(*) as count, array_agg(name) as names FROM experiments`;
    console.log(`[Experiments Migration] ✅ Seed experiments row count: ${seedCheck[0].count} (${seedCheck[0].names.join(', ')})`);

  } catch (err) {
    console.error(`[Experiments Migration] ❌ Error executing migration:`, err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

run();
