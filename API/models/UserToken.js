const mongoose = require('mongoose');

const userTokenSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    unique: true
  },
  access_token: {
    type: String,
    required: true
  },
  refresh_token: {
    type: String,
    required: true
  },
  scope: {
    type: String,
    required: true
  },
  expires_in: {
    type: Number,
    required: true
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update the updated_at field before saving
userTokenSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

module.exports = mongoose.model('UserToken', userTokenSchema);