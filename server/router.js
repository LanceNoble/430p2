const generalController = require('./controllers/General.js');
const accountController = require('./controllers/Account.js');

// const mid = require('./middleware');

const router = (app) => {
  app.head('/session', generalController.headSession);
  app.get('/session', generalController.getSession);
  app.post('/session', generalController.postSession);
  app.delete('/session', generalController.deleteSession);
  app.patch('/session', generalController.patchSession);

  app.post('/account', accountController.postAccount);

  app.get('/', generalController.getIndex);
  app.get('/*', generalController.getNotFound);
};

module.exports = router;
