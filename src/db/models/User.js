import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    referrals: {
      type: Number,
      default: 0,
      min: 0,
    },
    referredBy: {
      type: Number,
      default: null,
    },
    rewarded: {
      type: Boolean,
      default: false,
    },
    lastRewardType: {
      type: String,
      enum: ['math', 'english', null],
      default: null,
    },
    subscribed: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for finding users by referral
userSchema.index({ referredBy: 1 });

export const User = mongoose.model('User', userSchema);
