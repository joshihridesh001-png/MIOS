import postgres from 'postgres';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PASSWORD = 'SaSokKWqkpobCPAE';
const PROJECT_REF = 'uoqhjgbkojtimdtcqinm';

const connectionString = `postgresql://postgres:${PASSWORD}@db.${PROJECT_REF}.supabase.co:5432/postgres`;

console.log(`[Migration-004] Connecting to Supabase database for project: ${PROJECT_REF}...`);

const sql = postgres(connectionString, {
  ssl: 'require',
  max: 1,
  idle_timeout: 10,
  connect_timeout: 15,
});

async function run() {
  try {
    const migrationPath = path.resolve(__dirname, '../../supabase/migrations/004_customers_and_personas.sql');
    console.log(`[Migration-004] Reading migration file: ${migrationPath}`);
    const sqlContent = fs.readFileSync(migrationPath, 'utf8');

    console.log(`[Migration-004] Executing migration 004_customers_and_personas.sql...`);
    await sql.unsafe(sqlContent);
    console.log(`[Migration-004] ✅ Successfully executed 004_customers_and_personas.sql!`);

    // Verify customers table
    const customersCount = await sql`SELECT count(*) as count FROM public.customers`;
    console.log(`[Migration-004] ✅ Verified public.customers table! Row count: ${customersCount[0].count}`);

    // Verify buyer_personas table
    const personasCount = await sql`SELECT count(*) as count FROM public.buyer_personas`;
    console.log(`[Migration-004] ✅ Verified public.buyer_personas table! Row count: ${personasCount[0].count}`);

  } catch (err) {
    console.error(`[Migration-004] ❌ Error executing migration:`, err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

run();
