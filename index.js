import { bot } from './src/bot.js';
import { connectDB } from './src/db/connection.js';
import { initializeWebhook } from './src/webhook/setup.js';
import 'dotenv/config';

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

async function startBot() {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('✅ Database connected');

    if (NODE_ENV === 'production') {
      // Use webhook for production (Render)
      await initializeWebhook(bot);
      console.log('✅ Bot running with webhook on port', PORT);
    } else {
      // Use polling for development
      await bot.launch();
      console.log('✅ Bot running with polling');
    }

    // Graceful shutdown
    process.once('SIGINT', () => {
      console.log('⚠️  Shutting down...');
      bot.stop('SIGINT');
      process.exit();
    });

    process.once('SIGTERM', () => {
      console.log('⚠️  Shutting down...');
      bot.stop('SIGTERM');
      process.exit();
    });
  } catch (error) {
    console.error('❌ Startup error:', error);
    process.exit(1);
  }
}

startBot();
