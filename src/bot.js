import { Telegraf, Markup } from 'telegraf';
import { User } from './db/models/User.js';
import { ADMIN_ID, CHANNELS, REWARD_THRESHOLDS } from './config/constants.js';
import { checkSubscription } from './services/subscriptionService.js';
import { generateReferralLink } from './services/referralService.js';
import { broadcastMessage } from './services/broadcastService.js';
import 'dotenv/config';

const bot = new Telegraf(process.env.BOT_TOKEN);

// ==================== START COMMAND ====================
bot.command('start', async (ctx) => {
  try {
    const telegramUser = ctx.from;
    const args = ctx.match?.[1] || ctx.payload || '';
    
    // Parse referral link if exists
    let referrerId = null;
    if (args.startsWith('ref_')) {
      referrerId = parseInt(args.replace('ref_', ''));
    }

    // Get or create user
    let user = await User.findOne({ userId: telegramUser.id });
    
    if (!user) {
      user = new User({
        userId: telegramUser.id,
        firstName: telegramUser.first_name || 'User',
        referredBy: referrerId,
      });
      
      // Increment referrer's count if exists
      if (referrerId && referrerId !== telegramUser.id) {
        await User.findOneAndUpdate(
          { userId: referrerId },
          { $inc: { referrals: 1 } },
          { new: true }
        );
      }
    }

    // Send welcome message
    const welcomeText = `🎉 Salom, ${telegramUser.first_name || 'Dostum'}!

👋 Konkursimizga xush kelibsiz!

Pul yoki xarch qimasdan, shu 3 ta kanalga qo'shil va pul tekin olish imkoni haqida bilib ol:

🏆 Bugun 5 do'stingni taklif qil va REWARD TANLASH IMKONI HAQIDA MALUMOT OL!

Endi boshlaylik! 👇`;

    await ctx.reply(welcomeText, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '📱 @vaelux kanalini ko\'rsatish',
              url: 'https://t.me/vaelux',
            },
          ],
          [
            {
              text: `${CHANNELS.MATH_MATERIALS.NAME} qo'shilish`,
              url: CHANNELS.MATH_MATERIALS.LINK,
            },
          ],
          [
            {
              text: `${CHANNELS.ENGLISH_MULTILEVEL.NAME} qo'shilish`,
              url: CHANNELS.ENGLISH_MULTILEVEL.LINK,
            },
          ],
          [
            {
              text: '✅ Obunani tekshirish',
              callback_data: 'check_subscription',
            },
          ],
        ],
      },
    });
  } catch (error) {
    console.error('❌ Start command error:', error);
    await ctx.reply('❌ Xatolik yuz berdi. Qayta urinib ko\'ring.');
  }
});

// ==================== CHECK SUBSCRIPTION ====================
bot.action('check_subscription', async (ctx) => {
  try {
    await ctx.answerCbQuery();
    const userId = ctx.from.id;
    const firstName = ctx.from.first_name;

    // Check if user is subscribed to all channels
    const isSubscribed = await checkSubscription(userId, bot);

    if (isSubscribed) {
      // Generate referral link
      const referralLink = `https://t.me/${process.env.BOT_USERNAME}?start=ref_${userId}`;

      // Update user in DB
      let user = await User.findOne({ userId });
      if (!user) {
        user = new User({
          userId,
          firstName,
          subscribed: true,
        });
      } else {
        user.subscribed = true;
      }
      await user.save();

      // Success message
      const successText = `✅ Rahmat! Barcha kanalga qo'shildingiz!

👇 Bu link orqali do'stlaringizni taklif qiling:

<code>${referralLink}</code>

🎯 5 ta do'st taklif qiling → Reward oling!
💰 10 ta do'st taklif qiling → Yangi reward!`;

      await ctx.editMessageText(successText, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '📋 Mening statistikam',
                callback_data: 'my_stats',
              },
            ],
            [
              {
                text: '🎁 Reward olish',
                callback_data: 'claim_reward',
              },
            ],
            [
              {
                text: '🔄 Tekshirish',
                callback_data: 'check_subscription',
              },
            ],
          ],
        },
      });
    } else {
      // Not subscribed warning - with detailed messages
      const warningText = `⚠️ Siz hali barcha kanalga qo'shmadingiz!

Iltimos, quyidagi 3 ta kanalga qo'shiling:

1️⃣ <b>@vaelux</b> - Asosiy kanal
   → "Join" tugmasini bosing

2️⃣ <b>${CHANNELS.MATH_MATERIALS.NAME}</b>
   → "Request to join" tugmasini bosing va kutib turing

3️⃣ <b>${CHANNELS.ENGLISH_MULTILEVEL.NAME}</b>
   → "Request to join" tugmasini bosing va kutib turing

Barcha kanalga qo'shilganidan keyin "🔄 Qayta tekshirish" tugmasini bosing.`;

      await ctx.editMessageText(warningText, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '📱 @vaelux',
                url: 'https://t.me/vaelux',
              },
            ],
            [
              {
                text: `${CHANNELS.MATH_MATERIALS.NAME}`,
                url: CHANNELS.MATH_MATERIALS.LINK,
              },
            ],
            [
              {
                text: `${CHANNELS.ENGLISH_MULTILEVEL.NAME}`,
                url: CHANNELS.ENGLISH_MULTILEVEL.LINK,
              },
            ],
            [
              {
                text: '🔄 Qayta tekshirish',
                callback_data: 'check_subscription',
              },
            ],
          ],
        },
      });
    }
  } catch (error) {
    console.error('❌ Subscription check error:', error);
    await ctx.answerCbQuery('❌ Xatolik yuz berdi', true);
  }
});

// ==================== MY STATS ====================
bot.action('my_stats', async (ctx) => {
  try {
    await ctx.answerCbQuery();
    const userId = ctx.from.id;

    const user = await User.findOne({ userId });
    if (!user) {
      await ctx.answerCbQuery('❌ Foydalanuvchi topilmadi', true);
      return;
    }

    const remaining = Math.max(0, REWARD_THRESHOLDS.FIRST - user.referrals);
    const statsText = `📊 <b>Sizning statistikangiz:</b>

👥 Taklif qilingan do'stlar: <b>${user.referrals}</b>
✅ Olingan reward: <b>${user.rewarded ? 'Ha ✓' : 'Yo\'q'}</b>
🎯 Keyingi reward uchun: <b>${remaining} ta do'st qoldi</b>

${
  user.referrals >= REWARD_THRESHOLDS.FIRST
    ? '🎉 Siz reward olish imkoniyatiga ega!'
    : `⏳ Yana ${remaining} ta do'st taklif qiling!`
}`;

    await ctx.editMessageText(statsText, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🎁 Reward olish',
              callback_data: 'claim_reward',
            },
          ],
          [
            {
              text: '🔙 Orqaga',
              callback_data: 'back_to_menu',
            },
          ],
        ],
      },
    });
  } catch (error) {
    console.error('❌ Stats error:', error);
    await ctx.answerCbQuery('❌ Xatolik yuz berdi', true);
  }
});

// ==================== CLAIM REWARD ====================
bot.action('claim_reward', async (ctx) => {
  try {
    await ctx.answerCbQuery();
    const userId = ctx.from.id;

    const user = await User.findOne({ userId });
    if (!user) {
      await ctx.answerCbQuery('❌ Foydalanuvchi topilmadi', true);
      return;
    }

    // Check if user has enough referrals
    if (user.referrals < REWARD_THRESHOLDS.FIRST) {
      const remaining = REWARD_THRESHOLDS.FIRST - user.referrals;
      await ctx.answerCbQuery(
        `⏳ Yana ${remaining} ta do'st taklif qiling!`,
        true
      );
      return;
    }

    // Check if already rewarded
    if (user.rewarded && user.referrals < REWARD_THRESHOLDS.SECOND) {
      await ctx.answerCbQuery(
        '🎁 Siz allaqachon reward olgansiz. Yana 5 referral kerak!',
        true
      );
      return;
    }

    // Show reward options
    const rewardText = `🎁 <b>Reward tanlang:</b>

Quyidagilardan birini tanlang:`;

    await ctx.editMessageText(rewardText, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '📐 Matematika MILLIY',
              callback_data: 'reward_math',
            },
          ],
          [
            {
              text: '🌍 English Multilevel',
              callback_data: 'reward_english',
            },
          ],
          [
            {
              text: '🔙 Orqaga',
              callback_data: 'back_to_menu',
            },
          ],
        ],
      },
    });
  } catch (error) {
    console.error('❌ Claim reward error:', error);
    await ctx.answerCbQuery('❌ Xatolik yuz berdi', true);
  }
});

// ==================== REWARD MATH ====================
bot.action('reward_math', async (ctx) => {
  try {
    await ctx.answerCbQuery();
    const userId = ctx.from.id;

    const user = await User.findOne({ userId });
    if (!user) {
      await ctx.answerCbQuery('❌ Foydalanuvchi topilmadi', true);
      return;
    }

    // Create invite link for math channel
    try {
      const inviteLink = await bot.telegram.createChatInviteLink(
        CHANNELS.MATH_MATERIALS.ID,
        {
          expire_date: Math.floor(Date.now() / 1000) + 86400, // 24 hours
          member_limit: 1,
        }
      );

      user.rewarded = true;
      user.lastRewardType = 'math';
      if (user.referrals >= REWARD_THRESHOLDS.SECOND) {
        user.referrals -= REWARD_THRESHOLDS.FIRST; // Reset count
      }
      await user.save();

      const rewardText = `✅ <b>Muvaffaqiyatli!</b>

🎁 Siz Matematika material kursiga kirish huquqini oldingiz!

👇 Bu linkni bosing va kursga qo'shiling:

${inviteLink.invite_link}

⏱️ Link 24 soat davomida faol`;

      await ctx.editMessageText(rewardText, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '➡️ Kursga o\'tish',
                url: inviteLink.invite_link,
              },
            ],
            [
              {
                text: '🔙 Orqaga',
                callback_data: 'back_to_menu',
              },
            ],
          ],
        },
      });
    } catch (error) {
      console.error('❌ Invite link creation error:', error);
      await ctx.answerCbQuery('❌ Invite link yaratishda xatolik', true);
    }
  } catch (error) {
    console.error('❌ Reward math error:', error);
    await ctx.answerCbQuery('❌ Xatolik yuz berdi', true);
  }
});

// ==================== REWARD ENGLISH ====================
bot.action('reward_english', async (ctx) => {
  try {
    await ctx.answerCbQuery();
    const userId = ctx.from.id;

    const user = await User.findOne({ userId });
    if (!user) {
      await ctx.answerCbQuery('❌ Foydalanuvchi topilmadi', true);
      return;
    }

    // Create invite link for english channel
    try {
      const inviteLink = await bot.telegram.createChatInviteLink(
        CHANNELS.ENGLISH_MULTILEVEL.ID,
        {
          expire_date: Math.floor(Date.now() / 1000) + 86400, // 24 hours
          member_limit: 1,
        }
      );

      user.rewarded = true;
      user.lastRewardType = 'english';
      if (user.referrals >= REWARD_THRESHOLDS.SECOND) {
        user.referrals -= REWARD_THRESHOLDS.FIRST; // Reset count
      }
      await user.save();

      const rewardText = `✅ <b>Muvaffaqiyatli!</b>

🎁 Siz English Multilevel kursiga kirish huquqini oldingiz!

👇 Bu linkni bosing va kursga qo'shiling:

${inviteLink.invite_link}

⏱️ Link 24 soat davomida faol`;

      await ctx.editMessageText(rewardText, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '➡️ Kursga o\'tish',
                url: inviteLink.invite_link,
              },
            ],
            [
              {
                text: '🔙 Orqaga',
                callback_data: 'back_to_menu',
              },
            ],
          ],
        },
      });
    } catch (error) {
      console.error('❌ Invite link creation error:', error);
      await ctx.answerCbQuery('❌ Invite link yaratishda xatolik', true);
    }
  } catch (error) {
    console.error('❌ Reward english error:', error);
    await ctx.answerCbQuery('❌ Xatolik yuz berdi', true);
  }
});

// ==================== BACK TO MENU ====================
bot.action('back_to_menu', async (ctx) => {
  try {
    await ctx.answerCbQuery();
    const userId = ctx.from.id;

    const user = await User.findOne({ userId });
    if (!user) {
      await ctx.answerCbQuery('❌ Foydalanuvchi topilmadi', true);
      return;
    }

    const remaining = Math.max(0, REWARD_THRESHOLDS.FIRST - user.referrals);

    const menuText = `📋 <b>Asosiy menyu</b>

👥 Taklif qilingan do'stlar: <b>${user.referrals}</b>
🎯 Keyingi reward uchun: <b>${remaining} ta do'st</b>

Quyidagi tugmalardan birini tanlang:`;

    await ctx.editMessageText(menuText, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '📊 Mening statistikam',
              callback_data: 'my_stats',
            },
          ],
          [
            {
              text: '🎁 Reward olish',
              callback_data: 'claim_reward',
            },
          ],
          [
            {
              text: '🔄 Obunani tekshirish',
              callback_data: 'check_subscription',
            },
          ],
        ],
      },
    });
  } catch (error) {
    console.error('❌ Back to menu error:', error);
    await ctx.answerCbQuery('❌ Xatolik yuz berdi', true);
  }
});

// ==================== ADMIN COMMANDS ====================
bot.command('panel', async (ctx) => {
  try {
    if (ctx.from.id !== parseInt(ADMIN_ID)) {
      await ctx.reply('❌ Ruxsat yo\'q');
      return;
    }

    const adminText = `⚙️ <b>Admin Panel</b>

Quyidagi buyriqlardan foydalaning:

/user - Jami foydalanuvchi soni
/xabar &lt;text&gt; - Barcha foydalanuvchilarga xabar yuborish

Misol: /xabar 🎉 Yangi reward qo'shildi!`;

    await ctx.reply(adminText, {
      parse_mode: 'HTML',
    });
  } catch (error) {
    console.error('❌ Panel error:', error);
    await ctx.reply('❌ Xatolik yuz berdi');
  }
});

// ==================== USER COUNT ====================
bot.command('user', async (ctx) => {
  try {
    if (ctx.from.id !== parseInt(ADMIN_ID)) {
      await ctx.reply('❌ Ruxsat yo\'q');
      return;
    }

    const userCount = await User.countDocuments();
    const referrals = await User.aggregate([
      {
        $group: {
          _id: null,
          totalReferrals: { $sum: '$referrals' },
        },
      },
    ]);

    const totalReferrals = referrals[0]?.totalReferrals || 0;

    const statsText = `📊 <b>Bot Statistikasi</b>

👥 Jami foydalanuvchi: <b>${userCount}</b>
🔗 Jami referral: <b>${totalReferrals}</b>`;

    await ctx.reply(statsText, {
      parse_mode: 'HTML',
    });
  } catch (error) {
    console.error('❌ User count error:', error);
    await ctx.reply('❌ Xatolik yuz berdi');
  }
});

// ==================== BROADCAST MESSAGE ====================
bot.command('xabar', async (ctx) => {
  try {
    if (ctx.from.id !== parseInt(ADMIN_ID)) {
      await ctx.reply('❌ Ruxsat yo\'q');
      return;
    }

    const message = ctx.message.text.replace('/xabar', '').trim();
    if (!message) {
      await ctx.reply('❌ Xabar matni kiriting\n\nMisol: /xabar 🎉 Salom!');
      return;
    }

    await broadcastMessage(bot, message);
    await ctx.reply('✅ Xabar yuborish jarayoni boshlandi');
  } catch (error) {
    console.error('❌ Broadcast error:', error);
    await ctx.reply('❌ Xatolik yuz berdi');
  }
});

export { bot };
