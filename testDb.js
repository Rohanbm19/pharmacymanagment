const pool = require("./src/config/db");

async function testConnection() {
    try {
        const result = await pool.query("SELECT NOW()");
        console.log("Database Connected!");
        console.log(result.rows[0]);
    } catch (err) {
        console.error("Database Connection Error:", err.message);
    }
}

testConnection();