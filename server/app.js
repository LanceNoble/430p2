require('dotenv').config();

const mongoose = require('mongoose');

const RedisStore = require('connect-redis').default;
const redis = require('redis');

const express = require('express');
const session = require('express-session');
const expressHandlebars = require('express-handlebars');

const path = require('path');
const compression = require('compression');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const helmet = require('helmet');

const router = require('./router.js');

const socketSetup = require('./io.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;
const dbURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1/DrawDuels';

mongoose.connect(dbURI).catch((err) => { if (err) throw err; });

const redisClient = redis.createClient({ url: process.env.REDISCLOUD_URL });

redisClient.connect().then(() => {
  const app = express();

  app.use(helmet());
  app.use('/assets', express.static(path.resolve(`${__dirname}/../hosted/`)));
  app.use(favicon(`${__dirname}/../hosted/img/favicon.png`));
  app.use(compression());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  app.use(session({
    key: 'sessionid',
    store: new RedisStore({
      client: redisClient,
    }),
    secret: 'Draw Duels',
    resave: false,
    saveUninitialized: false,
  }));

  app.engine('handlebars', expressHandlebars.engine({ defaultLayout: '' }));
  app.set('view engine', 'handlebars');
  app.set('views', `${__dirname}/../views`);

  router(app);

  const server = socketSetup(app);

  server.listen(port, (err) => {
    if (err) { throw err; }
  });
});
