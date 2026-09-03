import { urlRepository } from '../repositories/url.repository.js';
import { cacheService } from './cache.service.js';
import { AnalyticsResponse } from '../types/index.js';

export class AnalyticsService {
  async getAnalytics(shortCode: string): Promise<AnalyticsResponse | null> {
    const url = await urlRepository.findByShortCode(shortCode);
    if (!url) return null;

    return {
      clickCount: url.clickCount,
      createdAt: url.createdAt,
      lastAccessedAt: url.lastAccessedAt,
      expiresAt: url.expiresAt,
      isActive: url.isActive,
    };
  }

  async recordClick(shortCode: string): Promise<void> {
    await Promise.all([
      urlRepository.incrementClickCount(shortCode),
      cacheService.incrementClickCount(shortCode),
    ]);
  }
}

export const analyticsService = new AnalyticsService();