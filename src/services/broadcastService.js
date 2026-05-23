import { User } from '../db/models/User.js';

/**
 * Send a message to all users
 */
export async function broadcastMessage(bot, message) {
  try {
    const users = await User.find({});
    let successCount = 0;
    let failureCount = 0;

    console.log(`📤 Starting broadcast to ${users.length} users...`);

    // Send message with rate limiting (1 message per 100ms to avoid hitting API limits)
    for (const user of users) {
      try {
        await bot.telegram.sendMessage(user.userId, message, {
          parse_mode: 'HTML',
        });
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to send to ${user.userId}:`, error.message);
        failureCount++;
      }

      // Rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(
      `✅ Broadcast complete: ${successCount} success, ${failureCount} failed`
    );
    return {
      success: successCount,
      failed: failureCount,
    };
  } catch (error) {
    console.error('❌ Broadcast message error:', error);
    throw error;
  }
}

/**
 * Send a message to users with specific referral count
 */
export async function broadcastToReferralThreshold(bot, minReferrals, message) {
  try {
    const users = await User.find({ referrals: { $gte: minReferrals } });

    let successCount = 0;

    for (const user of users) {
      try {
        await bot.telegram.sendMessage(user.userId, message, {
          parse_mode: 'HTML',
        });
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to send to ${user.userId}:`, error.message);
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return successCount;
  } catch (error) {
    console.error('❌ Targeted broadcast error:', error);
    throw error;
  }
}
