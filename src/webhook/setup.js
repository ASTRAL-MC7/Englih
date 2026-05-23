import express from 'express';
import 'dotenv/config';

const app = express();

/**
 * Initialize bot (webhook if possible, otherwise polling)
 */
export async function initializeBot(bot) {
  try {
    const PORT = process.env.PORT || 3000;
    const BOT_TOKEN = process.env.BOT_TOKEN;
    const WEBHOOK_URL = process.env.WEBHOOK_URL;
    const BOT_USERNAME = process.env.BOT_USERNAME;

    // Middleware
    app.use(express.json());

    // Health check
    app.get('/health', (req, res) => {
      res.json({ status: 'ok', bot: BOT_USERNAME });
    });

    // If webhook is NOT provided → fallback to polling
    if (!WEBHOOK_URL) {
      console.log('⚠️ WEBHOOK_URL not found. Starting in polling mode...');

      bot.launch();

      console.log('✅ Bot running in polling mode');
      return;
    }

    // Webhook endpoint
    app.post(`/bot/${BOT_TOKEN}`, (req, res) => {
      bot.handleUpdate(req.body, res);
    });

    // Set webhook
    const fullWebhookUrl = `${WEBHOOK_URL}/bot/${BOT_TOKEN}`;

    await bot.telegram.setWebhook(fullWebhookUrl);

    console.log(`✅ Webhook set to: ${fullWebhookUrl}`);

    // Start server
    app.listen(PORT, () => {
      console.log(`✅ Webhook server running on port ${PORT}`);
    });

  } catch (error) {
    console.error('❌ Bot initialization error:', error);
    throw error;
  }
}

/**
 * Remove webhook (cleanup)
 */
export async function removeWebhook(bot) {
  try {
    await bot.telegram.deleteWebhook();
    console.log('✅ Webhook removed');
  } catch (error) {
    console.error('❌ Webhook removal error:', error);
    throw error;
  }
}
