import { FastifyInstance } from 'fastify';
import { urlController } from '../controllers/url.controller.js';
import {
  createUrlSchema,
  shortCodeParamsSchema,
  getUrlsQuerySchemaWrapper,
  updateExpirationSchema,
} from '../validators/url.validator.js';

export async function urlRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post(
    '/api/v1/urls',
    { schema: createUrlSchema },
    urlController.createUrl.bind(urlController)
  );

  fastify.get(
    '/api/v1/urls',
    { schema: getUrlsQuerySchemaWrapper },
    urlController.getUrls.bind(urlController)
  );

  fastify.get(
    '/api/v1/urls/:shortCode',
    { schema: shortCodeParamsSchema },
    urlController.getUrlDetails.bind(urlController)
  );

  fastify.delete(
    '/api/v1/urls/:shortCode',
    { schema: shortCodeParamsSchema },
    urlController.deleteUrl.bind(urlController)
  );

  fastify.patch(
    '/api/v1/urls/:shortCode/expiration',
    { schema: updateExpirationSchema },
    urlController.updateExpiration.bind(urlController)
  );

  fastify.get(
    '/api/v1/urls/:shortCode/analytics',
    { schema: shortCodeParamsSchema },
    urlController.getAnalytics.bind(urlController)
  );

  fastify.get(
    '/:shortCode',
    { schema: shortCodeParamsSchema },
    urlController.redirect.bind(urlController)
  );
}