export const ADMIN_ID = process.env.ADMIN_ID || '5523761749';

export const CHANNELS = {
  // Public channel - direct subscription check
  VAELUX_ID: '@vaelux',
  
  // Private channels with request to join links
  MATH_MATERIALS: {
    ID: -1003975469421,
    LINK: 'https://t.me/+U3Re7CPYy7U2NmRi',
    NAME: '📖 Matematika material'
  },
  
  ENGLISH_MULTILEVEL: {
    ID: -1003947616006,
    LINK: 'https://t.me/+WuxE-3AVX_VmOGY6',
    NAME: '🌍 English Multilevel'
  },
};

export const REWARD_THRESHOLDS = {
  FIRST: 5,  // First reward at 5 referrals
  SECOND: 10, // Reset and next reward at 10 referrals total
};

export const MESSAGES = {
  WELCOME: '🎉 Salom, {name}!\n\n👋 Konkursimizga xush kelibsiz!',
  NOT_SUBSCRIBED: '⚠️ Siz hali barcha kanalga qo\'shmadingiz!',
  ALREADY_SUBSCRIBED: '✅ Rahmat! Barcha kanalga qo\'shildingiz!',
  NOT_ENOUGH_REFERRALS: '⏳ Yana {remaining} ta do\'st taklif qiling!',
  ALREADY_REWARDED: '🎁 Siz allaqachon reward olgansiz. Yana 5 referral kerak!',
};

// Channel join request status (check if user sent request)
export const JOIN_REQUEST_CHECK = {
  MATH: 'math_request',
  ENGLISH: 'english_request',
};
