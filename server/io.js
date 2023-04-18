const http = require('http');
const { Server } = require('socket.io');

let io;

const socketSetup = (app) => {
  const server = http.createServer(app);
  io = new Server(server);

  io.on('connection', (socket) => {
    console.log('a user connected');
    socket.join("room");
    socket.on('disconnect', () => {
      console.log('a user disconnected');
    });

    socket.on('create room', (roomName) => {
      socket.join(roomName);
    });

    socket.on('join room', (roomName) => {
      socket.join(roomName);
    });

    socket.on('drawing', (drawing) => {
      io.to("room").emit('drawing', drawing);
    });
  });

  return server;
};

module.exports = socketSetup;
