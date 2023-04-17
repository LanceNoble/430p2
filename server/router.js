const controllers = require('./controllers');

// const mid = require('./middleware');

const router = (app) => {
  app.get('/session', controllers.Account.session);
  app.get('/logout', controllers.Account.logout);
  app.get('/', controllers.Account.app);
  app.post('/login', controllers.Account.login);
  app.post('/signup', controllers.Account.signup);
};

module.exports = router;
