const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    match: /^[A-Za-z0-9_\-.]{1,16}$/,
  },
  pass: {
    type: String,
    required: true,
  },
  wins: {
    type: Number,
    default: 0,
  },
  premium: {
    type: Boolean,
    default: false,
  },
});
const Account = mongoose.model('Account', AccountSchema);
module.exports = { Account };
