class SocketService {
  constructor(io) {
    this.io = io;
  }

  emitStockUpdate(payload) {
    this.io.emit('stock:update', payload);
  }
}

module.exports = SocketService;
