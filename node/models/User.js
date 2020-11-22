const bcrypt = require('bcrypt');
const crypto = require('crypto');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  battletag: { type: String, unique: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
