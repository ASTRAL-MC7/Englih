import express from 'express';
import 'dotenv/config';

const app = express();

/**
 * Initialize webhook for production use
 * This is required for Render deployment
 */
export async function initializeWebhook(bot) {
  try {
    const PORT = process.env.PORT || 3000;
    const BOT_TOKEN = process.env.BOT_TOKEN;
    const WEBHOOK_URL = process.env.WEBHOOK_URL;
    const BOT_USERNAME = process.env.BOT_USERNAME;

    if (!WEBHOOK_URL) {
      throw new Error('WEBHOOK_URL environment variable is required');
    }

    // Middleware
    app.use(express.json());

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({ status: 'ok', bot: BOT_USERNAME });
    });

    // Webhook endpoint
    app.post(`/bot/${BOT_TOKEN}`, (req, res) => {
      bot.handleUpdate(req.body, res);
    });

    // Set webhook
    await bot.telegram.setWebhook(`${WEBHOOK_URL}/bot/${BOT_TOKEN}`);

    console.log(`✅ Webhook set to: ${WEBHOOK_URL}/bot/${BOT_TOKEN}`);

    // Start server
    app.listen(PORT, () => {
      console.log(`✅ Webhook server running on port ${PORT}`);
    });

    return app;
  } catch (error) {
    console.error('❌ Webhook initialization error:', error);
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
