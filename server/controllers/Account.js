const bcrypt = require('bcrypt');
const { Account } = require('../models/Account.js');

const postAccount = async (req, res) => {
  try {
    req.body.pass = await bcrypt.hash(req.body.pass, 10);
    const doc = await Account.create(req.body);
    req.session.acc = req.body.user;
    return res.status(201).json(doc);
  } catch (err) {
    return res.status(400).json(err);
  }
};

const patchAccount = async (req, res) => {
  try {
    if (req.body.pass) req.body.pass = await bcrypt.hash(req.body.pass, 10);
    const doc = await Account.updateOne({ user: req.session.acc.user }, req.body);
    return res.status(200).json(doc);
  } catch (err) {
    return res.status(500).json(err);
  }
};

const getSession = (req, res) => (req.session.acc ? res.status(200).json(req.session.acc) : res.status(404).json('Session expired'));

const postSession = async (req, res) => {
  const { user } = req.body;
  try {
    const doc = await Account.findOne({ user }).lean();
    const match = await bcrypt.compare(req.body.pass, doc.pass);
    if (match) {
      req.session.acc = { user, premium: doc.premium };
      return res.status(201).json(req.session.acc);
    }
    throw new Error('Wrong password!');
  } catch (err) {
    return res.status(401).json(err.message);
  }
};

const deleteSession = (req, res) => {
  req.session.destroy();
  res.status(204).end();
};

module.exports = {
  postAccount,
  patchAccount,

  getSession,
  postSession,
  deleteSession,
};
