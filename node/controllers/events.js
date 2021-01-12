const { promisify } = require('util');
const passport = require('passport');
const _ = require('lodash');;
const Event = require('../models/Event.js');
const User = require('../models/User.js');
const { strict } = require('assert');



/**
 * GET /events
 * Events page.
 */
exports.getEvents = (req, res) => {
  Event.find({'is_live': true}, (err, events)=>{
    if(err){
      console.log(err);
      res.redirect('/')
    } else {
      res.render('events/list', {
        title: 'Events',
        events: events
      });
    }
  })
};

/**
 * GET /events/{Event_ID}/enter
 * Enter an event with the logged in user
 */
exports.getEnterEvent = (req, res) => {
  // 1. Add user to the Event model
  // 2. Add event the User model

  console.log(req.user);

  User.findById(req.user._id, (err, user) =>{
    if(err){
      console.log(err);
      return res.redirect('/events');
    }

    Event.findById(req.params.eventId, (err, event) => {
      if(err){
        console.log(err);
        return res.redirect('/events');
      }

      event.entrants.push(user);
      event.save((err) => {
        if(err){
          console.log(err)
          return res.redirect('/events')
        }
        res.redirect('/events')
      })
    })
  })
}

/**
 * GET /events/admin
 * Create a new event
 */
exports.getEventsAdmin = (req, res) => {
  res.render('events/admin', {
    title: 'Admin'
  });
};

/**
 * POST /events/new
 * Create a new event
 */
exports.postEvents = (req, res, next) => {

  console.log(req.body)

  const event = new Event({
    name: req.body.inputName,
    description: req.body.inputDescription,
    is_live: true,
  });

  event.save((err) => {
    res.redirect('/events/admin')
  })
};
