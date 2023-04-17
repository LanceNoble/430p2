const http = require('http');
const { Server } = require('socket.io');

let io;

const handleResult = (result) => {
  io.emit(result.lobby, result.drawing);
};

const socketSetup = (app) => {
  const server = http.createServer(app);
  io = new Server(server);

  io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('disconnect', () => {
      console.log('a user disconnected');
    });

    socket.on('finished', handleResult);
  });

  return server;
};

module.exports = socketSetup;