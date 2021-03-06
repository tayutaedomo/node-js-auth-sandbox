'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },

  gaTempSecret: { type: String },
  gaSecret: { type: String },
  gaOtpauthUrl: { type: String },
  gaEnabled: { type: Boolean, default: false },

}, {
    collection: 'User',
    timestamps: true
});

userSchema.pre('save', async function(next) {
  try {
    const salt = await bcrypt.genSalt(10);
    const passwordhash = await bcrypt.hash(this.password, salt);
    this.password = passwordhash;
    next();

  } catch (error) {
    next(error);
  }
});

userSchema.methods.isValidPassword = async function(newPassword) {
  try {
    return await bcrypt.compare(newPassword, this.password);
  } catch (error) {
    throw new Error(error);
  }
};

module.exports =  mongoose.model('User', userSchema);

