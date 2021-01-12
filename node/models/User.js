const bcrypt = require('bcrypt');
const crypto = require('crypto');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  battletag: { type: String, unique: true },
  tokens: Array,
  battlenet: String,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
