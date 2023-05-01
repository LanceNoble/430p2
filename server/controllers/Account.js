const bcrypt = require('bcrypt');
const { Account } = require('../models/Account.js');

// Helper function for updating the session whenever an account updates
function updateSession(sess, doc) {
  const acc = {};
  acc.user = doc.user;
  acc.wins = doc.wins;
  acc.premium = doc.premium;
  Object.assign(sess.acc, acc);
}

// Retrieves a list of accounts from MongoDB based on query params
const getAccount = async (req, res) => {
  const results = await Account.find(req.query).lean();
  if (results.length > 0) return res.status(200).json(results);
  return res.status(404).json('Account Not Found');
};

// Creates a new account when a user signs up
const postAccount = async (req, res) => {
  try {
    req.body.pass = await bcrypt.hash(req.body.pass, 10);
    const doc = await Account.create(req.body);
    updateSession(req.session, doc);
    res.status(201).json(req.session.acc);
  } catch (err) {
    res.status(400).json(err);
  }
};

// Updates an existing account whenever a user wins, purchases premium, or changes password
const putAccount = async (req, res) => {
  if (req.body.pass) req.body.pass = await bcrypt.hash(req.body.pass, 10);
  const doc = await Account.updateOne({ user: req.session.acc.user }, req.body);
  updateSession(req.session, doc);
  res.status(200).json(req.session.acc);
};

// Creates a new session when a user logs out
const postSession = async (req, res) => {
  const doc = await Account.findOne({ user: req.body.user }).lean();
  if (!doc) return res.status(401).json('Wrong Username');
  const match = await bcrypt.compare(req.body.pass, doc.pass);
  if (match) {
    updateSession(req.session, doc);
    return res.status(201).json(req.session.acc);
  }
  return res.status(401).json('Wrong Password');
};

// Deletes the current session when the user logs out
const deleteSession = (req, res) => {
  req.session.destroy();
  res.status(204).end();
};

module.exports = {
  getAccount,
  postAccount,
  putAccount,

  postSession,
  deleteSession,
};
