import { FastifyRequest, FastifyReply } from 'fastify';
import { urlService } from '../services/url.service.js';
import { CreateUrlInput } from '../types/index.js';

export class UrlController {
  async createUrl(
    request: FastifyRequest<{ Body: CreateUrlInput }>,
    reply: FastifyReply
  ): Promise<void> {
    const { originalUrl, expiresAt } = request.body;
    const baseUrl = request.headers.origin || request.protocol + '://' + request.hostname;
    const result = await urlService.createShortUrl({ originalUrl, expiresAt }, baseUrl);
    reply.status(201).send({ success: true, data: result });
  }

  async redirect(
    request: FastifyRequest<{ Params: { shortCode: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const { shortCode } = request.params;
    const url = await urlService.getUrl(shortCode);

    if (!url) {
      reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Short URL not found' },
      });
      return;
    }

    if (url.expiresAt && new Date() > url.expiresAt) {
      reply.status(410).send({
        success: false,
        error: { code: 'GONE', message: 'This URL has expired' },
      });
      return;
    }

    if (!url.isActive) {
      reply.status(410).send({
        success: false,
        error: { code: 'GONE', message: 'This URL is no longer active' },
      });
      return;
    }

    await urlService.recordClick(shortCode);
    reply.redirect(302, url.originalUrl);
  }

  async getUrlDetails(
    request: FastifyRequest<{ Params: { shortCode: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const { shortCode } = request.params;
    const result = await urlService.getUrlDetails(shortCode);

    if (!result) {
      reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Short URL not found' },
      });
      return;
    }

    reply.send({ success: true, data: result });
  }

  async getUrls(
    request: FastifyRequest<{
      Querystring: {
        page?: number;
        limit?: number;
        search?: string;
        sortBy?: 'createdAt' | 'clickCount' | 'expiresAt';
        sortOrder?: 'asc' | 'desc';
        isActive?: boolean;
      };
    }>,
    reply: FastifyReply
  ): Promise<void> {
    const result = await urlService.getUrls(request.query);
    reply.send({ success: true, data: result });
  }

  async deleteUrl(
    request: FastifyRequest<{ Params: { shortCode: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const { shortCode } = request.params;
    const deleted = await urlService.deleteUrl(shortCode);

    if (!deleted) {
      reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Short URL not found' },
      });
      return;
    }

    reply.send({ success: true, data: { message: 'URL deleted successfully' } });
  }

  async updateExpiration(
    request: FastifyRequest<{
      Params: { shortCode: string };
      Body: { expiresAt: Date | null };
    }>,
    reply: FastifyReply
  ): Promise<void> {
    const { shortCode } = request.params;
    const { expiresAt } = request.body;
    const updated = await urlService.updateExpiration(shortCode, expiresAt);

    if (!updated) {
      reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Short URL not found' },
      });
      return;
    }

    reply.send({ success: true, data: { message: 'Expiration updated successfully' } });
  }

  async getAnalytics(
    request: FastifyRequest<{ Params: { shortCode: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const { shortCode } = request.params;
    const { analyticsService } = await import('../services/analytics.service.js');
    const analytics = await analyticsService.getAnalytics(shortCode);

    if (!analytics) {
      reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Short URL not found' },
      });
      return;
    }

    reply.send({ success: true, data: analytics });
  }
}

export const urlController = new UrlController();