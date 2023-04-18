const models = require('../models');

const { Account } = models;

const app = (req, res) => res.render('index');

const session = (req, res) => (req.session.account ? res.status(204).end() : res.status(404).end());

const logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};

const login = (req, res) => {
  const user = `${req.body.user}`;
  const pass = `${req.body.pass}`;

  return Account.authenticate(user, pass, (err, account) => {
    if (err || !account) return res.status(401).json({ error: 'Wrong credentials' });
    req.session.account = Account.toAPI(account);
    return res.status(204).end();
  });
};

const signup = async (req, res) => {
  const user = `${req.body.user}`;
  const pass = `${req.body.pass}`;

  try {
    const hash = await Account.generateHash(pass);
    const newAccount = new Account({ username: user, password: hash, wins: 0 });
    await newAccount.save();
    req.session.account = Account.toAPI(newAccount);
    return res.status(201).end();
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Username already in use!' });
    }
    return res.status(500).json({ error: 'An error occurred!' });
  }
};

module.exports = {
  app,
  session,
  logout,
  login,
  signup,
};
