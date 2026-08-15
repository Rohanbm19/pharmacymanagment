require("dotenv").config();

const pool = require("./config/db");
const app = require("./app");

const http = require("http");

const { Server } = require("socket.io");

async function ensureOrderSchema() {
    try {
        await pool.query(`
            ALTER TABLE orders
            ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255);
        `);

        await pool.query(`
            ALTER TABLE orders
            ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Processing';
        `);

        await pool.query(`
            ALTER TABLE orders
            ALTER COLUMN user_id DROP NOT NULL;
        `);

        console.log('Database schema check complete for orders table');
    } catch (error) {
        console.error('Order schema migration failed:', error.message);
    }
}

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

global.io = io;

io.on("connection", (socket) => {
    console.log("A client connected.");

    socket.on("disconnect", () => {
        console.log("Client disconnected.");
    });
});

const PORT = process.env.PORT || 5000;

ensureOrderSchema();

server.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});

server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Stop the other process or set PORT in .env and restart.`);
        process.exit(1);
    }
    console.error('Server error:', err);
    process.exit(1);
});