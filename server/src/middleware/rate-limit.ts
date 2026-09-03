import { FastifyInstance, FastifyRequest } from 'fastify';
import { getEnv } from '../config/env.js';

export async function rateLimitPlugin(fastify: FastifyInstance): Promise<void> {
  const { RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS } = getEnv();

  // @ts-expect-error - fastify-rate-limit types not available
  await fastify.register(import('fastify-rate-limit'), {
    max: RATE_LIMIT_MAX,
    timeWindow: RATE_LIMIT_WINDOW_MS,
    keyGenerator: (request: FastifyRequest) => request.ip,
    errorMessage: 'Too many requests, please try again later',
    addHeaders: {
      'x-ratelimit-limit': true,
      'x-ratelimit-remaining': true,
      'x-ratelimit-reset': true,
    },
    allowList: ['127.0.0.1', '::1'],
    skipOnError: true,
  });
}