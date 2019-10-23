let mongoose = require('mongoose');

let SubscriberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  unsubscribeKey: {
    type: String
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  deletionDate: { 
    type: Date, 
    expires: 604800, 
    default: null 
  }
});

module.exports = mongoose.model('Subscriber', SubscriberSchema);
