const { Client } = require('pg');
const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'Rohan19BM',
  database: 'pharmacy_db'
});
(async () => {
  try {
    await client.connect();
    const q = "ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255); ALTER TABLE orders ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Processing'; ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;";
    await client.query(q);
    console.log('MIGRATION_OK');
    const cols = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'orders' ORDER BY ordinal_position");
    console.log(JSON.stringify(cols.rows));
    await client.end();
  } catch (e) {
    console.error('ERR:', e.message);
    process.exit(1);
  }
})();
