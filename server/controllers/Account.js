const bcrypt = require('bcrypt');
const { Account } = require('../models/Account.js');

const getAccount = async (req, res) => {
  const doc = await Account.findOne(req.query).lean();
  if (doc) res.status(200).json(doc);
  res.status(404).json({ error: 'Account Not Found' });
};

const postAccount = async (req, res) => {
  try {
    req.body.pass = await bcrypt.hash(req.body.pass, 10);
    const doc = await Account.create(req.body);
    req.session.acc = {
      user: req.body.user,
      wins: 0,
      premium: false,
    };
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json(err);
  }
};

const putAccount = async (req, res) => {
  const newInfo = {};
  Object.keys(Account.schema.paths).forEach((key) => {
    if (req.body[key]) newInfo[key] = req.body[key];
  });
  await Account.updateOne({ user: req.session.acc.user }, newInfo);
  const accountKeys = Object.keys(req.session.acc);
  for (let i = 0; i < accountKeys.length; i++) {
    if (req.body[accountKeys[i]]) req.session.acc[accountKeys[i]] = req.body[accountKeys[i]];
  }
  res.status(204).end();
};

const deleteAccount = async (req, res) => {
  await Account.deleteOne({ user: req.session.acc.user });
  req.session.destroy();
  res.status(204).end();
};

const getSession = (req, res) => (req.session.acc ? res.status(200).json(req.session.acc) : res.status(404).json({ error: 'Session Expired' }));

const postSession = async (req, res) => {
  const doc = await Account.findOne({ user: req.body.user }).lean();
  if (!doc) return res.status(401).json({ error: 'Wrong Credentials' });
  const match = await bcrypt.compare(req.body.pass, doc.pass);
  if (match) {
    req.session.acc = {
      user: doc.user,
      wins: doc.wins,
      premium: doc.premium,
    };
    return res.status(201).json(req.session.acc);
  }
  return res.status(401).json({ error: 'Wrong Credentials' });
};

const deleteSession = (req, res) => {
  req.session.destroy();
  res.status(204).end();
};

module.exports = {
  getAccount,
  postAccount,
  putAccount,
  deleteAccount,

  getSession,
  postSession,
  deleteSession,
};
