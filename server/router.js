const generalController = require('./controllers/General.js');
const accountController = require('./controllers/Account.js');

// const mid = require('./middleware');

const router = (app) => {
  app.head('/session', accountController.headSession);
  app.get('/session', accountController.getSession);
  app.post('/session', accountController.postSession);
  app.delete('/session', accountController.deleteSession);
  app.patch('/session', accountController.patchSession);

  app.post('/account', accountController.postAccount);

  app.get('/', generalController.getIndex);
  app.get('/*', generalController.getNotFound);
};

module.exports = router;
