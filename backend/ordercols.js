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
    const q = "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'orders' ORDER BY ordinal_position";
    const r = await client.query(q);
    console.log(JSON.stringify(r.rows));
    await client.end();
  } catch (e) {
    console.error('ERR:', e.message);
    process.exit(1);
  }
})();
