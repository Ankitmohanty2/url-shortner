import { z } from 'zod';

export const createUrlBodySchema = z.object({
  originalUrl: z.string().url('Invalid URL format').max(2048, 'URL too long'),
  expiresAt: z.string().datetime().optional().transform((val) => val ? new Date(val) : undefined),
});

export const shortCodeParamSchema = z.object({
  shortCode: z.string().min(3).max(20).regex(/^[A-Za-z0-9]+$/),
});

export const getUrlsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().max(100).optional(),
  sortBy: z.enum(['createdAt', 'clickCount', 'expiresAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  isActive: z.coerce.boolean().optional(),
});

export const updateExpirationBodySchema = z.object({
  expiresAt: z.string().datetime().nullable().transform((val) => val ? new Date(val) : null),
});

export const createUrlSchema = {
  body: createUrlBodySchema,
};

export const shortCodeParamsSchema = {
  params: shortCodeParamSchema,
};

export const getUrlsQuerySchemaWrapper = {
  querystring: getUrlsQuerySchema,
};

export const updateExpirationSchema = {
  params: shortCodeParamSchema,
  body: updateExpirationBodySchema,
};

export type CreateUrlInput = z.infer<typeof createUrlBodySchema>;
export type ShortCodeParams = z.infer<typeof shortCodeParamSchema>;
export type GetUrlsQuery = z.infer<typeof getUrlsQuerySchema>;
export type UpdateExpirationInput = z.infer<typeof updateExpirationBodySchema>;