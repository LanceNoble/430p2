const models = require('../models');

const { Account } = models;

const getSession = (req, res) => res.status(200).json(req.session.account);

const headSession = (req, res) => req.session.account ? res.status(204).end()
  : res.status(404).end()

const postSession = (req, res) => {
  const user = `${req.body.user}`;
  const pass = `${req.body.pass}`;

  return Account.authenticate(user, pass, (err, account) => {
    if (err || !account) return res.status(401).json({ error: 'Wrong credentials' });
    req.session.account = Account.toAPI(account);
    return res.status(204).end();
  });
};

const deleteSession = (req, res) => {
  req.session.destroy();
  res.status(204).end();
};

const patchSession = (req, res) => {
  const { player } = req.body;
  const { room } = req.body;
  if (player) req.session.account.player = player;
  if (room) req.session.account.room = room;
  res.status(204).end();
};

const postAccount = async (req, res) => {
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

const getPage = (req, res) => res.render('index');

module.exports = {
  getSession,
  headSession,
  postSession,
  deleteSession,
  patchSession,

  postAccount,

  getPage,
};
