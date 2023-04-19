const http = require('http');
const { Server } = require('socket.io');

let io;

const socketSetup = (app) => {
  const server = http.createServer(app);
  io = new Server(server);

  io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
      console.log('a user disconnected');
    });

    socket.on('room join', (room) => {
      // https://stackoverflow.com/questions/31468473/how-to-get-socket-io-number-of-clients-in-room
      // const roomSize = io.sockets.adapter.rooms.get(roomName).size;
      // roomSize === 3 ? io.emit('room full', { msg: `${roomName} is full!` })
      // : socket.join(roomName);
      socket.join(room);
    });

    socket.on('draw', (p) => {
      io.to(p.room).emit('draw', { num: p.num, src: p.src });
    });
  });

  io.of('/').adapter.on('create-room', (room) => {
    console.log(`room ${room} was created`);
    io.emit('room create', room);
  });

  io.of('/').adapter.on('join-room', (room, id) => {
    console.log(`socket ${id} has joined room ${room}`);
  });

  return server;
};

module.exports = socketSetup;
