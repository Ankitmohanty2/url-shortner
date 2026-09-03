import Redis from 'ioredis';
import { getEnv } from './env.js';

let redisClient: Redis | null = null;
let isConnected = false;

export function createRedisClient(): Redis {
  const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, REDIS_DB } = getEnv();

  const client = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD,
    db: REDIS_DB,
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      if (times > 3) return null;
      return Math.min(times * 200, 2000);
    },
    enableReadyCheck: true,
    lazyConnect: true,
  });

  client.on('connect', () => {
    isConnected = true;
    console.log('Redis connected');
  });

  client.on('error', (err) => {
    console.error('Redis error:', err.message);
  });

  client.on('close', () => {
    isConnected = false;
    console.log('Redis connection closed');
  });

  return client;
}

export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = createRedisClient();
  }
  return redisClient;
}

export async function connectRedis(): Promise<void> {
  const client = getRedisClient();
  if (!isConnected) {
    await client.connect();
  }
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient && isConnected) {
    await redisClient.quit();
    redisClient = null;
    isConnected = false;
  }
}

export function getRedisStatus(): boolean {
  return isConnected;
}