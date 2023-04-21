const { AccountModel } = require('../models/Account.js');

const getSession = (req, res) => (req.session.account ? res.status(200).json(req.session.account) : res.status(404).json({ error: 'session cookie not found' }));

const headSession = (req, res) => (req.session.account ? res.status(204).end()
  : res.status(404).end());

const postSession = (req, res) => {
  const user = `${req.body.user}`;
  const pass = `${req.body.pass}`;

  return AccountModel.authenticate(user, pass, (err, account) => {
    if (err || !account) return res.status(401).json({ error: 'Wrong credentials' });
    req.session.account = AccountModel.toAPI(account);
    return res.status(204).end();
  });
};

const deleteSession = (req, res) => {
  req.session.destroy();
  res.status(204).end();
};

const patchSession = (req, res) => {
  const room  = req.body.room;
  const player = req.body.player;
  req.session.account.room = room;
  req.session.account.player = player;
  res.status(204).end();
};

const postAccount = async (req, res) => {
  const user = `${req.body.user}`;
  const pass = `${req.body.pass}`;

  try {
    const hash = await AccountModel.generateHash(pass);
    const newAccount = new AccountModel({ username: user, password: hash, wins: 0 });
    await newAccount.save();
    req.session.account = AccountModel.toAPI(newAccount);
    return res.status(201).end();
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Username already in use!' });
    }
    return res.status(500).json({ error: 'An error occurred!' });
  }
};

module.exports = {
  postAccount,

  getSession,
  headSession,
  postSession,
  deleteSession,
  patchSession,
};
