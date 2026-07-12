const { pool } = require('../index');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const client = await pool.connect();

  try {
    console.log('Resetting database schema...');
    // Drop and recreate public schema to drop all tables, views, functions, triggers
    await client.query('DROP SCHEMA public CASCADE');
    await client.query('CREATE SCHEMA public');
    await client.query('GRANT ALL ON SCHEMA public TO public');
    console.log('Public schema reset completed.\n');

    // Run core files
    const coreFiles = [
      { name: 'schema.sql', path: path.join(__dirname, '..', 'schema.sql') },
      { name: 'triggers_business_rules.sql', path: path.join(__dirname, '..', 'triggers_business_rules.sql') },
      { name: '01_create_vehicle_documents.sql', path: path.join(__dirname, '..', 'migrations', '01_create_vehicle_documents.sql') },
      { name: 'real_seed_data.sql', path: path.join(__dirname, '..', 'real_seed_data.sql') }
    ];

    for (const file of coreFiles) {
      if (!fs.existsSync(file.path)) {
        throw new Error(`Migration file not found: ${file.path}`);
      }
      
      console.log(`Running ${file.name}...`);
      const sql = fs.readFileSync(file.path, 'utf8');
      await client.query(sql);
      console.log(`${file.name} — done`);
    }

    // Quick verification
    console.log('\n── Verification ──');

    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    console.log(`\nTables (${tables.rows.length}):`);
    tables.rows.forEach((r) => console.log(`  • ${r.table_name}`));

    const counts = await client.query(`
      SELECT 'roles' AS tbl, COUNT(*) AS n FROM roles
      UNION ALL SELECT 'users', COUNT(*) FROM users
      UNION ALL SELECT 'vehicles', COUNT(*) FROM vehicles
      UNION ALL SELECT 'drivers', COUNT(*) FROM drivers
      UNION ALL SELECT 'trips', COUNT(*) FROM trips
      UNION ALL SELECT 'fuel_logs', COUNT(*) FROM fuel_logs
      UNION ALL SELECT 'maintenance_logs', COUNT(*) FROM maintenance_logs
      UNION ALL SELECT 'expenses', COUNT(*) FROM expenses
      UNION ALL SELECT 'vehicle_documents', COUNT(*) FROM vehicle_documents
      ORDER BY tbl;
    `);
    console.log('\nRow counts:');
    counts.rows.forEach((r) => console.log(`  • ${r.tbl}: ${r.n}`));

    console.log('\nDatabase setup with real-world seed data complete!');
  } catch (err) {
    console.error(`\nMigration failed:`, err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
