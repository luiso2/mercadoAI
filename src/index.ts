import { env } from './env.js';
import { connectDB } from './db/mongoose.js';
import { app } from './server.js';

async function bootstrap() {
  try {
    await connectDB();

    const port = parseInt(env.PORT, 10);
    app.listen(port, '0.0.0.0', () => {
      console.log(`Server running on port ${port} in ${env.NODE_ENV} mode`);
      console.log(`Health check: ${env.BASE_URL}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
