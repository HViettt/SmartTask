
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: { type: String, unique: true, sparse: true }, // sparse allows multiple null values
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String }, // Hashed password
  avatar: { type: String },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  preferences: {
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    language: { type: String, enum: ['vi', 'en'], default: 'vi' }
  }
}, {
  timestamps: true 
});

module.exports = mongoose.model('User', userSchema);
