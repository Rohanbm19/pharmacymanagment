const socketIo = require('socket.io');

function initializeSocket(server) {
  const io = socketIo(server);

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}

module.exports = initializeSocket;
