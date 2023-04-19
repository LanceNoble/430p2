const controllers = require('./controllers');

// const mid = require('./middleware');

const router = (app) => {
  app.head('/session', controllers.Account.headSession);
  app.get('/session', controllers.Account.getSession);
  app.post('/session', controllers.Account.postSession);
  app.delete('/session', controllers.Account.deleteSession);
  app.patch('/session', controllers.Account.patchSession);

  app.post('/account', controllers.Account.postAccount);
  app.get('/', controllers.Account.getPage);
};

module.exports = router;
