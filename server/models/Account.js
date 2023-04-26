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
    required: true,
  },
  premium: {
    type: Boolean,
    required: true,
  },
});
const Account = mongoose.model('Account', AccountSchema);
module.exports = { Account };
