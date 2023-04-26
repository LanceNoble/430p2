const bcrypt = require('bcrypt');
const { Account } = require('../models/Account.js');

const postAccount = async (req, res) => {
  await bcrypt.hash(req.body.pass, 10, (hashErr, hash) => {
    if (hashErr) return res.status(500).json(hashErr);
    const accProps = {
      user: req.body.user, pass: hash, wins: 0, premium: false,
    };
    Account.create(accProps, (createErr, acc) => {
      if (createErr) return res.status(500).json(createErr);
      return res.status(201).json(acc);
    });
    // avoids eslint consistent-return
    return res.status(202).json('Accepted');
  });
};

const patchAccount = async (req, res) => {
  await bcrypt.hash(req.body.newPass, 10, (hashErr, hash) => {
    if (hashErr) return res.status(500).json(hashErr);
    Account.updateOne({ user: req.session.acc.user }, { pass: hash }, (updateErr, result) => {
      if (updateErr) return res.status(500).json(updateErr);
      return res.status(200).json(result);
    });
    return res.status(202).end();
  });
};

const headSession = (req, res) => (req.session.acc ? res.status(204).end() : res.status(404).end());

const postSession = async (req, res) => {
  const { user } = req.body;
  try {
    const doc = await Account.findOne({ user }).lean();
    const match = await bcrypt.compare(req.body.pass, doc.password);
    if (match) {
      req.session.acc = { user };
      return res.status(201).json(req.session.acc);
    }
    throw new Error('Wrong password!');
  } catch (err) {
    return res.status(401).json(err);
  }
};

const deleteSession = (req, res) => {
  req.session.destroy();
  res.status(204).end();
};

module.exports = {
  postAccount,
  patchAccount,

  headSession,
  postSession,
  deleteSession,
};
