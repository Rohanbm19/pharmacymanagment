require("dotenv").config();

const app = require("./app");

const http = require("http");

const { Server } = require("socket.io");

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

server.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});