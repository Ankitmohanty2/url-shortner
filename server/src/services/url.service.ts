import { urlRepository } from '../repositories/url.repository.js';
import { cacheService } from './cache.service.js';
import { generateShortCode, isValidShortCode } from '../utils/generate-code.js';
import { validateUrl, normalizeUrl } from '../utils/url-validator.js';
import { getEnv } from '../config/env.js';
import { UrlDocument, CreateUrlInput, UrlResponse } from '../types/index.js';

const MONGO_DUPLICATE_KEY_CODE = 11000;

export class UrlService {
  private maxRetries: number;

  constructor() {
    this.maxRetries = getEnv().SHORT_CODE_MAX_RETRIES;
  }

  async createShortUrl(input: CreateUrlInput, baseUrl: string): Promise<UrlResponse> {
    const validation = validateUrl(input.originalUrl);
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid URL');
    }

    const normalizedUrl = normalizeUrl(input.originalUrl);

    const existing = await urlRepository.findByOriginalUrl(normalizedUrl);
    if (existing) {
      return this.mapToResponse(existing, baseUrl);
    }

    let shortCode: string;
    let attempts = 0;

    while (attempts < this.maxRetries) {
      shortCode = generateShortCode();
      attempts++;

      try {
        const urlData: Partial<UrlDocument> = {
          originalUrl: normalizedUrl,
          shortCode,
          expiresAt: input.expiresAt,
          clickCount: 0,
          isActive: true,
        };

        const created = await urlRepository.create(urlData);
        await cacheService.set(created);
        return this.mapToResponse(created, baseUrl);
      } catch (error) {
        if (this.isDuplicateKeyError(error)) {
          if (attempts >= this.maxRetries) {
            throw new Error('Failed to generate unique short code after maximum retries');
          }
          continue;
        }
        throw error;
      }
    }

    throw new Error('Failed to generate unique short code');
  }

  private isDuplicateKeyError(error: unknown): boolean {
    if (error && typeof error === 'object' && 'code' in error) {
      return (error as { code: number }).code === MONGO_DUPLICATE_KEY_CODE;
    }
    return false;
  }

  async getUrl(shortCode: string): Promise<UrlDocument | null> {
    if (!isValidShortCode(shortCode)) return null;

    const cached = await cacheService.get(shortCode);
    if (cached) return cached;

    const url = await urlRepository.findByShortCode(shortCode);
    if (url) {
      await cacheService.set(url);
    }
    return url;
  }

  async getUrlDetails(shortCode: string): Promise<UrlResponse | null> {
    const url = await this.getUrl(shortCode);
    if (!url) return null;

    const baseUrl = getEnv().CLIENT_URL;
    return this.mapToResponse(url, baseUrl);
  }

  async getUrls(query: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: 'createdAt' | 'clickCount' | 'expiresAt';
    sortOrder?: 'asc' | 'desc';
    isActive?: boolean;
  }): Promise<{ urls: UrlResponse[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
    const result = await urlRepository.findAll(query);
    const baseUrl = getEnv().CLIENT_URL;
    return {
      urls: result.urls.map((url) => this.mapToResponse(url, baseUrl)),
      pagination: result.pagination,
    };
  }

  async deleteUrl(shortCode: string): Promise<boolean> {
    await cacheService.delete(shortCode);
    return urlRepository.softDelete(shortCode);
  }

  async updateExpiration(shortCode: string, expiresAt: Date | null): Promise<boolean> {
    const result = await urlRepository.updateExpiration(shortCode, expiresAt);
    if (result) {
      await cacheService.delete(shortCode);
    }
    return result;
  }

  async recordClick(shortCode: string): Promise<void> {
    const { analyticsService } = await import('./analytics.service.js');
    await analyticsService.recordClick(shortCode);
  }

  private mapToResponse(url: UrlDocument, baseUrl: string): UrlResponse {
    return {
      shortCode: url.shortCode,
      shortUrl: `${baseUrl}/${url.shortCode}`,
      originalUrl: url.originalUrl,
      expiresAt: url.expiresAt,
      createdAt: url.createdAt,
      clickCount: url.clickCount,
      isActive: url.isActive,
    };
  }
}

export const urlService = new UrlService();