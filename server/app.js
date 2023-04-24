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
const generalController = require('./controllers/General.js');

mongoose.connect(process.env.MONGODB_URI).catch((err) => { if (err) throw err; });
const redisClient = redis.createClient({ url: process.env.REDISCLOUD_URL });
redisClient.connect().then(() => {
  const app = express();

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

  app.engine('handlebars', expressHandlebars.engine({ defaultLayout: '' }));
  app.set('view engine', 'handlebars');
  app.set('views', `${__dirname}/../views`);

  app.get('/session', accountController.getSession);
  app.post('/session', accountController.postSession);
  app.delete('/session', accountController.deleteSession);

  app.post('/account', accountController.postAccount);

  app.get('/', generalController.getIndex);
  app.get('/*', generalController.getNotFound);

  const server = http.createServer(app);
  const io = new Server(server);

  io.on('connection', (socket) => {
    socket.on('room join', async (roomName, playerType) => {
      socket.join(roomName);
      if (roomName === 'hub') return;
      const sockets = await io.in(roomName).fetchSockets();
      for (let i = 0; i < sockets.length; i++) {
        if (playerType === sockets[i].data.playerType) {
          socket.leave(roomName);
          io.to(socket.id).emit('room join error', `The "${playerType}" role has already been taken in room "${roomName}"!`);
          return;
        }
      }
      // Object.assign prevents airbnb eslint no-param-reassign
      const shallowSocketData = socket.data;
      shallowSocketData.playerType = playerType;
      Object.assign(socket.data, shallowSocketData);
      io.to(socket.id).emit('room join success');
    });

    socket.on('room leave', (roomName) => socket.leave(roomName));

    socket.on('rooms request', () => {
      const rooms = [];
      io.of('/').adapter.rooms.forEach((sids, roomName) => {
        if (roomName !== 'hub' && !sids.has(roomName)) {
          let drawerCount = 0;
          let judgeCount = 0;
          sids.forEach((sid) => (io.sockets.sockets.get(sid).data.playerType === 'Judge' ? judgeCount++ : drawerCount++));
          rooms.push({
            roomName, drawerCount, judgeCount,
          });
        }
      });
      io.to(socket.id).emit('rooms sent', rooms);
    });

    socket.on('draw start', (roomName, playerType, cvsMousePos) => io.to(roomName).emit('draw start', playerType, cvsMousePos));

    socket.on('draw', (roomName, cvsMousePos) => io.to(roomName).emit('draw', cvsMousePos));
  });

  server.listen(process.env.PORT || 3000, (err) => {
    if (err) throw err;
  });
});
