import { getRedisClient, getRedisStatus } from '../config/redis.js';
import { getEnv } from '../config/env.js';
import { UrlDocument } from '../types/index.js';

const URL_CACHE_PREFIX = 'url:';

export class CacheService {
  private get client() {
    return getRedisClient();
  }

  private get ttl(): number {
    return getEnv().REDIS_TTL_SECONDS;
  }

  private getKey(shortCode: string): string {
    return `${URL_CACHE_PREFIX}${shortCode}`;
  }

  async get(shortCode: string): Promise<UrlDocument | null> {
    if (!getRedisStatus()) return null;

    try {
      const data = await this.client.get(this.getKey(shortCode));
      if (!data) return null;

      const parsed = JSON.parse(data);
      return {
        ...parsed,
        createdAt: new Date(parsed.createdAt),
        expiresAt: parsed.expiresAt ? new Date(parsed.expiresAt) : undefined,
        lastAccessedAt: parsed.lastAccessedAt ? new Date(parsed.lastAccessedAt) : undefined,
      };
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(url: UrlDocument): Promise<void> {
    if (!getRedisStatus()) return;

    try {
      await this.client.setex(this.getKey(url.shortCode), this.ttl, JSON.stringify(url));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async delete(shortCode: string): Promise<void> {
    if (!getRedisStatus()) return;

    try {
      await this.client.del(this.getKey(shortCode));
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async incrementClickCount(shortCode: string): Promise<void> {
    if (!getRedisStatus()) return;

    try {
      const key = this.getKey(shortCode);
      const data = await this.client.get(key);
      if (data) {
        const parsed = JSON.parse(data);
        parsed.clickCount += 1;
        parsed.lastAccessedAt = new Date().toISOString();
        await this.client.setex(key, this.ttl, JSON.stringify(parsed));
      }
    } catch (error) {
      console.error('Cache increment error:', error);
    }
  }

  async healthCheck(): Promise<boolean> {
    if (!getRedisStatus()) return false;
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch {
      return false;
    }
  }
}

export const cacheService = new CacheService();