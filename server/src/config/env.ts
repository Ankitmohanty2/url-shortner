import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  SERVER_PORT: z.coerce.number().default(3000),
  SERVER_HOST: z.string().default('0.0.0.0'),

  MONGODB_URI: z.string().url().default('mongodb://mongo:27017/url-shortener'),

  REDIS_HOST: z.string().default('redis'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.coerce.number().default(0),
  REDIS_TTL_SECONDS: z.coerce.number().default(3600),

  CLIENT_URL: z.string().url().default('http://localhost:5173'),

  RATE_LIMIT_MAX: z.coerce.number().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),

  SHORT_CODE_LENGTH: z.coerce.number().default(7),
  SHORT_CODE_MAX_RETRIES: z.coerce.number().default(5),

  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
});

export type Env = z.infer<typeof envSchema>;

let env: Env;

export function loadEnv(): Env {
  if (env) return env;

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('Invalid environment variables:', result.error.flatten().fieldErrors);
    process.exit(1);
  }

  env = result.data;
  return env;
}

export function getEnv(): Env {
  if (!env) return loadEnv();
  return env;
}