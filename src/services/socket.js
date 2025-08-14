const { Server } = require('socket.io');
let io;

const initSocket = (httpServer) => {
  // Changed parameter name to clarify it's the HTTP server
  io = new Server(httpServer, {
    // Initialize Socket.io Server with the HTTP server
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    socket.on('join', (userId) => {
      socket.join(`user-${userId}`); // Standardized room name
    });

    socket.on('disconnect', () => {});
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

const emitToUser = (userId, event, data) => {
  if (!io) {
    console.error('Socket.io not initialized');
    return;
  }
  io.to(`user-${userId}`).emit(event, data); // Standardized room name
};

module.exports = {
  initSocket,
  getIO,
  emitToUser,
};
