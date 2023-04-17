const models = require('../models');

const { Account } = models;

const app = (req, res) => res.render('app');

const session = (req, res) => {
  if (req.session.account) res.status(200).end();
  res.status(404).end();
};

const logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};

const login = (req, res) => {
  const username = `${req.body.user}`;
  const pass = `${req.body.pass}`;

  if (!username || !pass) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  return Account.authenticate(username, pass, (err, account) => {
    if (err || !account) {
      return res.status(401).json({ error: 'Wrong username or password!' });
    }

    req.session.account = Account.toAPI(account);

    return res.status(200).end();
  });
};

const signup = async (req, res) => {
  const username = `${req.body.user}`;
  const pass = `${req.body.pass}`;

  try {
    const hash = await Account.generateHash(pass);
    const newAccount = new Account({ username, password: hash, wins: 0 });
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
