require('dotenv').config();

const mongoose = require('mongoose');
const RedisStore = require('connect-redis').default;
const redis = require('redis');

const express = require('express');
const expressHandlebars = require('express-handlebars');

const path = require('path');
const compression = require('compression');
const favicon = require('serve-favicon');
const helmet = require('helmet');
const session = require('express-session');

const http = require('http');
const { Server } = require('socket.io');

const accountController = require('./controllers/Account.js');

mongoose.connect(process.env.MONGODB_URI).catch((err) => { if (err) throw err; });
const redisClient = redis.createClient({ url: process.env.REDISCLOUD_URL });
redisClient.connect().then(() => {
  const app = express();

  app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') res.redirect(`https://${req.hostname}${req.url}`);
    next();
  });
  app.use(helmet());
  app.use('/assets', express.static(path.resolve(`${__dirname}/../hosted/`)));
  app.use(favicon(`${__dirname}/../hosted/img/favicon.png`));
  app.use(compression());
  app.use(express.json());
  app.use(session({
    key: 'sessionid',
    store: new RedisStore({
      client: redisClient,
    }),
    secret: 'DrawDuels',
    resave: false,
    saveUninitialized: false,
  }));

  app.engine('handlebars', expressHandlebars.engine({ defaultLayout: '' }));
  app.set('view engine', 'handlebars');
  app.set('views', `${__dirname}/views`);

  app.post('/session', accountController.postSession);
  app.delete('/session', accountController.deleteSession);

  app.get('/account', accountController.getAccount);
  app.post('/account', accountController.postAccount);
  app.put('/account', accountController.putAccount);

  // pass session as handlebars expression
  // to access its properties in react components without HTTP request
  // middleware ensures that req.session.acc equals to an empty object instead of undefined
  // or else JSON.stringify will return undefined
  // passing undefined values to html data attributes is bad
  // also we JSON.stringify the session object because html data attributes only accept strings
  app.get('/', (req, res, next) => {
    if (!req.session.acc) req.session.acc = {};
    next();
  }, (req, res) => res.status(200).render('index', { acc: JSON.stringify(req.session.acc) }));

  app.get('/*', (req, res) => res.status(404).render('notFound'));

  const server = http.createServer(app);
  const io = new Server(server);

  io.on('connection', (socket) => {
    // Avoids airbnb eslint no-param-reassign
    // Creates a temporary object that can be operated on
    // And assigns the object to the socket's data property
    const editSocketRole = (role) => {
      const shallowSocketData = socket.data;
      shallowSocketData.role = role;
      Object.assign(socket.data, shallowSocketData);
    };

    socket.on('room join', (room, role) => {
      const roomRef = io.of('/').adapter.rooms.get(room);
      // If room doesn't exist, join right away
      if (!roomRef) {
        editSocketRole(role);
        socket.join(room);
        io.to(socket.id).emit('wait');
        return;
      }

      let taken = false;
      // If room exists, check to see if the role (Judge, Drawer 1, Drawer 2) was taken
      roomRef.forEach((sid) => {
        if (role === io.sockets.sockets.get(sid).data.role) taken = true;
      });
      if (taken) {
        io.to(socket.id).emit('spot taken');
        return;
      }
      editSocketRole(role);
      socket.join(room);

      // If room is full (has a Judge, Drawer 1, and Drawer 2) start game
      // Otherwise, have the users wait
      if (roomRef.size === 3) io.to(room).emit('start');
      else io.to(socket.id).emit('wait');
    });

    socket.on('room leave', (room) => {
      editSocketRole(null);
      socket.leave(room);
    });

    socket.on('end', (room, winner) => {
      io.to(room).emit('end', winner);
    });

    socket.on('rooms request', () => {
      const rooms = [];
      io.of('/').adapter.rooms.forEach((sids, room) => {
        // Upon connection, all sockets automatically join a room associated with their socket id
        // If current room matches a socket id, don't include it in the room list
        if (!sids.has(room)) {
          let drawer1Count = 0;
          let drawer2Count = 0;
          let judgeCount = 0;
          sids.forEach((sid) => {
            switch (io.sockets.sockets.get(sid).data.role) {
              case 'Drawer 1':
                drawer1Count++;
                break;
              case 'Drawer 2':
                drawer2Count++;
                break;
              default:
                judgeCount++;
                break;
            }
          });
          rooms.push({
            room, drawer1Count, drawer2Count, judgeCount,
          });
        }
      });

      // Only send the rooms to the socket that requested it
      // Otherwise, room list renderings on the hub page will be duplicated across all clients
      io.to(socket.id).emit('rooms sent', rooms);
    });

    socket.on('draw', (roomName, x, y, lastX, lastY, playerType, strokeStyle) => io.to(roomName).emit('draw', x, y, lastX, lastY, playerType, strokeStyle));
  });

  // Handles users that leave in the middle of a match
  io.of('/').adapter.on('leave-room', (room, id) => {
    if (io.sockets.sockets.get(id).data.role) io.to(room).emit('end', 'No one');
  });

  server.listen(process.env.PORT || 3000, (err) => {
    if (err) throw err;
  });
});
