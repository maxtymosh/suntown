let mongoose = require('mongoose');

let UnverifiedSchema = new mongoose.Schema({
  subscriberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscriber'
  },
  verificationToken: {
    type: String,
    required: true
  },
  createdAt: { 
    type: Date, 
    expires: 604800, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Unverified', UnverifiedSchema);
