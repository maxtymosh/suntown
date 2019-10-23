'use strict';

const express = require('express');
const router = express.Router();
const SubscriberModel = require('../models/subscriber.model');

// Utils
const subHandler = require('../utils/subscriptionUtils/subscriptionHandler');

router.post('/subscribeMail', (req, res) => {
  const { subName, subEmail } = req.body;
  const newSubscriber = new SubscriberModel({
    name: subName,
    email: subEmail,
    isVerified: true
  });
  newSubscriber.save()
    .then(() => res.json({'status':'ok'}))
  
})

router.get('/verify', (req, res) => {
  subHandler.verifySubscriber(req.query.verificationToken)
    .then(result => {
      if (result.status)
        res.status(result.status);
      res.send(result)
    });
});

router.get('/unsubscribe', (req, res) => {
  subHandler.unsubscribe(req.query.unsubscriptionKey)
    .then(result => {
      if (result.status)
        res.status(result.status);
      res.send(result.message)
    });
});

module.exports = router;
