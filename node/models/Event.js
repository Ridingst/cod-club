const mongoose = require('mongoose');

const User = require('../models/User.js');

function getRandomImage() {
  return '/images/operators/03D-OPERATORS-' + (Math.floor(Math.random() * Math.floor(23))+1).toString().padStart(3, '0') + '.jpg'
}

const eventSchema = new mongoose.Schema({
  name: { type: String, unique: true, require: true},
  description:  { type: String, require: true},
  entrants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  playerCount: Number,
  is_live: Boolean,
  image: String
}, { timestamps: true });

eventSchema.pre('save', function(next) {
  if(!this.image){
    this.image = getRandomImage();
  }
  next();
});

eventSchema.pre('validate', function (next) {
  this.playerCount = this.entrants.length
  next();
});


const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
