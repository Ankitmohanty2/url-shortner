import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

export async function requestLoggerPlugin(fastify: FastifyInstance): Promise<void> {
  fastify.addHook('onRequest', async (request: FastifyRequest) => {
    request.startTime = Date.now();
  });

  fastify.addHook('onResponse', async (request: FastifyRequest, reply: FastifyReply) => {
    const responseTime = Date.now() - (request.startTime || Date.now());
    const { method, url, ip } = request;
    const { statusCode } = reply;

    fastify.log.info({
      method,
      url,
      statusCode,
      responseTime: `${responseTime}ms`,
      ip,
      userAgent: request.headers['user-agent'],
    }, 'HTTP Request');
  });

  fastify.addHook('onError', async (request: FastifyRequest, reply: FastifyReply, error: Error) => {
    const responseTime = Date.now() - (request.startTime || Date.now());
    fastify.log.error({
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      responseTime: `${responseTime}ms`,
      ip: request.ip,
      error: error.message,
      stack: error.stack,
    }, 'HTTP Error');
  });
}

declare module 'fastify' {
  interface FastifyRequest {
    startTime?: number;
  }
}