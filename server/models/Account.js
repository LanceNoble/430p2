const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const saltRounds = 10;

const AccountSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    match: /^[A-Za-z0-9_\-.]{1,16}$/,
  },
  password: {
    type: String,
    required: true,
  },
  wins: {
    type: Number,
    required: true,
  },
});

const AccountModel = mongoose.model('Account', AccountSchema);

AccountSchema.statics.toAPI = (doc) => ({
  username: doc.username,
  _id: doc._id,
  player: -1,
  room: '',
});

AccountSchema.statics.generateHash = (password) => bcrypt.hash(password, saltRounds);

AccountSchema.statics.authenticate = async (username, password, callback) => {
  try {
    const doc = await AccountModel.findOne({ username }).exec();
    if (!doc) {
      return callback();
    }

    const match = await bcrypt.compare(password, doc.password);
    if (match) {
      return callback(null, doc);
    }
    return callback();
  } catch (err) {
    return callback(err);
  }
};

module.exports = { AccountModel };
