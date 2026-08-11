import postgres from 'postgres';

const PASSWORD = 'SaSokKWqkpobCPAE';
const PROJECT_REF = 'uoqhjgbkojtimdtcqinm';
const connectionString = `postgresql://postgres:${PASSWORD}@db.${PROJECT_REF}.supabase.co:5432/postgres`;

const sql = postgres(connectionString, {
  ssl: 'require',
  max: 1,
});

async function seed() {
  try {
    console.log('[Seed-Customers] Checking existing customers count...');
    const count = await sql`SELECT count(*) as count FROM public.customers`;
    if (Number(count[0].count) > 0) {
      console.log('[Seed-Customers] Customers already seeded. Skipping.');
      return;
    }

    console.log('[Seed-Customers] Inserting seed customers...');
    await sql`
      INSERT INTO public.customers (
        name, phone, location, property_type, lead_source,
        revenue, profit, ltv,
        why_contacted, biggest_fear, biggest_objection, why_chose_us, what_built_trust, questions_asked,
        cx_rating, job_quality_feedback, improvement_opportunities, has_review, has_referral, amc_opportunity, status
      ) VALUES (
        'Vikramaditya Mehta (Residential Bedbug Case)', '+91 98200 45123', 'Bandra West, Mumbai', 'residential', 'Meta Ads — Botanical Video Ad',
        14500.00, 9200.00, 14500.00,
        'Found bedbugs in kids bedroom after Goa vacation',
        'Chemical toxicity for children and pet retriever dog',
        'High pricing compared to local roadside spray vendors',
        '180-Day Re-Infestation Guarantee and 100% Botanical Non-Toxic Certification',
        'Certified non-toxic botanicals and overnight treatment availability',
        'Will the smell linger for more than 2 hours after treatment?',
        5,
        'Technician Rajesh arrived 10 minutes early. Thorough mattress seam inspection. Zero chemical smell afterwards.',
        ARRAY['Ensure technicians explain post-job ventilation timing clearly'],
        true, true, false, 'won'
      ), (
        'Apex Logistics & Cold Storage (Sunil Sharma)', '+91 98112 33490', 'Bhiwandi Warehouse Zone, Maharashtra', 'commercial', 'LinkedIn Outreach — Audit Compliance',
        85000.00, 58000.00, 255000.00,
        'Upcoming HACCP food safety audit in 3 weeks',
        'Health inspection failure & warehouse closure fine',
        'Can your team work overnight without disrupting forklift traffic?',
        'Digital audit compliance reports and overnight Sunday service teams',
        'ISO/HACCP Digital Compliance Reports & Dedicated Account Manager',
        'Can we get monthly automated PDF certificates for our compliance binder?',
        5,
        'Outstanding Sunday overnight execution. Loading dock operations were completely uninterrupted.',
        ARRAY['Automate monthly digital audit PDF emails to warehouse managers'],
        true, false, true, 'won'
      );
    `;

    console.log('[Seed-Customers] ✅ Successfully inserted 2 seed customer records with rich psychology telemetry!');
  } catch (err) {
    console.error('[Seed-Customers] Error seeding customers:', err);
  } finally {
    await sql.end();
  }
}

seed();
