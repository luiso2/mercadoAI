import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('production'),
  PORT: z.string().default('8080'),
  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  SESSION_SECRET: z.string().min(1, 'SESSION_SECRET is required'),
  BASE_URL: z.string().url('BASE_URL must be a valid URL'),
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required'),
  GOOGLE_REDIRECT_URI: z.string().url('GOOGLE_REDIRECT_URI must be a valid URL'),
  PROVIDERS: z.string().default('mock'),
  DEFAULT_CHAIN: z.string().default('Ralphs'),
});

function loadEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('Environment validation failed:');
    result.error.errors.forEach((err) => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
    process.exit(1);
  }

  return result.data;
}

export const env = loadEnv();
