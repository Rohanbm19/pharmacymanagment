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
    const tables = [
      ['medicines', 'SELECT * FROM medicines LIMIT 5'],
      ['orders', 'SELECT * FROM orders ORDER BY id DESC LIMIT 5'],
      ['order_items', 'SELECT * FROM order_items ORDER BY id DESC LIMIT 5']
    ];
    for (const [name, sql] of tables) {
      const r = await client.query(sql);
      console.log('TABLE', name);
      console.log(JSON.stringify(r.rows));
    }
    await client.end();
  } catch (e) {
    console.error('ERR:', e.message);
    process.exit(1);
  }
})();
