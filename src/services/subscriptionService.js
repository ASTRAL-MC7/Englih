import { CHANNELS } from '../config/constants.js';

export async function checkSubscription(userId, bot) {
  try {
    // Check if user is member of @vaelux (public channel)
    const vaeluxCheck = await checkChannelMembership(bot, userId, CHANNELS.VAELUX_ID);
    
    // Check request to join for Math materials
    const mathRequestCheck = await checkRequestToJoin(bot, userId, CHANNELS.MATH_MATERIALS.ID);
    
    // Check request to join for English multilevel
    const englishRequestCheck = await checkRequestToJoin(bot, userId, CHANNELS.ENGLISH_MULTILEVEL.ID);
    
    // All checks should pass
    return vaeluxCheck && mathRequestCheck && englishRequestCheck;
  } catch (error) {
    console.error('❌ Subscription check error:', error);
    return false;
  }
}

async function checkChannelMembership(bot, userId, channelUsername) {
  try {
    // Try to get user's status in the channel
    const member = await bot.telegram.getChatMember(`${channelUsername}`, userId);
    
    // User is a member if status is not 'left' or 'kicked'
    const validStatuses = ['member', 'administrator', 'creator', 'restricted'];
    return validStatuses.includes(member.status);
  } catch (error) {
    console.error(
      `❌ Error checking membership for ${channelUsername}:`,
      error.message
    );
    return false;
  }
}

/**
 * Check if user has sent a request to join a private channel
 */
async function checkRequestToJoin(bot, userId, channelId) {
  try {
    // Get chat member status - this will return 'restricted' for pending requests
    const member = await bot.telegram.getChatMember(channelId, userId);
    
    // Check if user is already a member
    if (member.status === 'member' || member.status === 'administrator') {
      return true;
    }
    
    // Check if user has sent a join request (status would be 'restricted' with is_member: false)
    // For now, we'll check if they're in any valid status
    if (member.status === 'restricted') {
      return true; // User has pending request or is restricted but in the list
    }
    
    return false;
  } catch (error) {
    // 'user is not a member' error means no request sent yet
    console.error(
      `❌ Error checking join request for ${channelId}:`,
      error.message
    );
    return false;
  }
}

/**
 * Verify subscription status with details
 * Returns object with each channel status
 */
export async function checkSubscriptionDetailed(userId, bot) {
  try {
    const vaeluxStatus = await checkChannelMembership(bot, userId, CHANNELS.VAELUX_ID);
    const mathStatus = await checkRequestToJoin(bot, userId, CHANNELS.MATH_MATERIALS.ID);
    const englishStatus = await checkRequestToJoin(bot, userId, CHANNELS.ENGLISH_MULTILEVEL.ID);

    return {
      vaelux: vaeluxStatus,
      mathMaterials: mathStatus,
      englishMultilevel: englishStatus,
      allSubscribed: vaeluxStatus && mathStatus && englishStatus,
    };
  } catch (error) {
    console.error('❌ Detailed subscription check error:', error);
    return {
      vaelux: false,
      mathMaterials: false,
      englishMultilevel: false,
      allSubscribed: false,
    };
  }
}
