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
    const q = "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name LIMIT 20";
    const r = await client.query(q);
    console.log(JSON.stringify(r.rows));
    await client.end();
  } catch (e) {
    console.error('ERR:', e.message);
    process.exit(1);
  }
})();
