require('dotenv').config();

// Library for easily interacting with MongoDB via Node.js
const mongoose = require('mongoose');

// Session cookie database
const RedisStore = require('connect-redis').default;
const redis = require('redis');

// Web framework
const express = require('express');

// Web framework template engine
const expressHandlebars = require('express-handlebars');

// Web framework middleware
const path = require('path');
const compression = require('compression');
const favicon = require('serve-favicon');
const helmet = require('helmet');
const session = require('express-session');

// Socket
const http = require('http');
const { Server } = require('socket.io');

// Controllers
const accountController = require('./controllers/Account.js');
const generalController = require('./controllers/General.js');

// Connect to databases
mongoose.connect(process.env.MONGODB_URI).catch((err) => { if (err) throw err; });
const redisClient = redis.createClient({ url: process.env.REDISCLOUD_URL });
redisClient.connect().then(() => {
  // Create express app
  const app = express();

  // Setup global middleware
  app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
      res.redirect(`https://${req.hostname}${req.url}`);
    }
    next();
  });
  app.use(helmet());
  app.use('/assets', express.static(path.resolve(`${__dirname}/../hosted/`)));
  // https://favicon.io
  app.use(favicon(`${__dirname}/../hosted/img/favicon.png`));
  app.use(compression());
  app.use(express.urlencoded({ extended: true }));
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

  // Setup template engine
  app.engine('handlebars', expressHandlebars.engine({ defaultLayout: '' }));
  app.set('view engine', 'handlebars');
  app.set('views', `${__dirname}/../views`);

  // Setup routes
  app.get('/session', accountController.getSession);
  app.post('/session', accountController.postSession);
  app.delete('/session', accountController.deleteSession);

  app.post('/account', accountController.postAccount);

  app.get('/', generalController.getIndex);
  app.get('/*', generalController.getNotFound);

  // Setup socket io
  const server = http.createServer(app);
  const io = new Server(server);

  io.on('connection', (socket) => {
    console.log(`user ${socket.id} connected`);
    socket.on('disconnect', () => {
      console.log(`user ${socket.id} disconnected`);
    });

    socket.on('room join', (room) => {
      // https://stackoverflow.com/questions/31468473/how-to-get-socket-io-number-of-clients-in-room
      // const roomSize = io.sockets.adapter.rooms.get(roomName).size;
      // roomSize === 3 ? io.emit('room full', { msg: `${roomName} is full!` })
      // : socket.join(roomName);
      socket.join(room);
    });

    socket.on('room leave', (room) => {
      socket.leave(room);
    });

    socket.on('draw start', (room, player, cvsMousePos) => {
      io.to(room).emit('draw start', player, cvsMousePos);
    });

    socket.on('draw', (room, cvsMousePos) => {
      io.to(room).emit('draw', cvsMousePos);
    });
  });

  /* io.of('/').adapter.on('create-room', (room) => {
    console.log(`room ${room} was created`);
    io.emit('room create', room);
  });

  io.of('/').adapter.on('join-room', (room, id) => {
    console.log(`socket ${id} has joined room ${room}`);
  }); */

  // Start server
  server.listen(process.env.PORT || 3000, (err) => {
    if (err) throw err;
  });
});
