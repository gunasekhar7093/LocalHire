const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  type: {
    type: String,
    required: true,
    enum: ['Skill', 'Vacancy'],
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', ''],
  },
  skill: {
    type: String,
  },
  role: {
    type: String,
  },
  experience: {
    type: String,
  },
  salary: {
    type: String,
  },
  phone: {
    type: String,
  },
  phoneVisibility: {
    type: String,
    enum: ['Public', 'Private'],
    default: 'Private',
  },
  state: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  area: {
    type: String,
  },
  description: {
    type: String,
    required: true,
  },
  availability: {
    type: String,
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, {
  timestamps: true
});

// Indexes for text search
postSchema.index({ skill: 'text', role: 'text', description: 'text' });

module.exports = mongoose.model('Post', postSchema);
