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
    const r = await client.query("SELECT id, customer_name, total_price, status FROM orders ORDER BY id DESC LIMIT 5");
    console.log(JSON.stringify(r.rows));
    await client.end();
  } catch (e) {
    console.error('ERR:', e.message);
    process.exit(1);
  }
})();
