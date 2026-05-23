import { User } from '../db/models/User.js';

/**
 * Generate referral link for a user
 */
export async function generateReferralLink(userId) {
  try {
    const botUsername = process.env.BOT_USERNAME;
    
    if (!botUsername) {
      throw new Error('BOT_USERNAME is not set');
    }

    const referralLink = `https://t.me/${botUsername}?start=ref_${userId}`;
    return referralLink;
  } catch (error) {
    console.error('❌ Generate referral link error:', error);
    throw error;
  }
}

/**
 * Get user referral stats
 */
export async function getReferralStats(userId) {
  try {
    const user = await User.findOne({ userId });
    
    if (!user) {
      return null;
    }

    // Get all users referred by this user
    const referredUsers = await User.find({ referredBy: userId });

    return {
      totalReferrals: user.referrals,
      referredUsers: referredUsers.length,
      rewarded: user.rewarded,
      lastRewardType: user.lastRewardType,
    };
  } catch (error) {
    console.error('❌ Get referral stats error:', error);
    throw error;
  }
}

/**
 * Handle referral - when someone joins via referral link
 */
export async function handleReferral(referrerId, newUserId) {
  try {
    // Prevent self-referral
    if (referrerId === newUserId) {
      return false;
    }

    // Check if referrer exists
    const referrer = await User.findOne({ userId: referrerId });
    if (!referrer) {
      return false;
    }

    // Increment referrer's count
    referrer.referrals += 1;
    await referrer.save();

    return true;
  } catch (error) {
    console.error('❌ Handle referral error:', error);
    return false;
  }
}
