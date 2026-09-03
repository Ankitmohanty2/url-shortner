import Fastify, { FastifyInstance } from 'fastify';

import { loadEnv, getEnv } from './config/env.js';
import { connectDatabase, disconnectDatabase, getConnectionStatus } from './config/database.js';
import { connectRedis, disconnectRedis, getRedisStatus } from './config/redis.js';
import { errorHandler, AppError } from './middleware/error-handler.js';
import { rateLimitPlugin } from './middleware/rate-limit.js';
import { requestLoggerPlugin } from './middleware/request-logger.js';
import { urlRoutes } from './routes/url.routes.js';

loadEnv();

const env = getEnv();

async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,
      transport: env.NODE_ENV === 'development' ? { target: 'pino-pretty' } : undefined,
    },
    trustProxy: true,
  });

  app.setErrorHandler(errorHandler);

  // @ts-expect-error - fastify-helmet types not available
  const helmet = (await import('fastify-helmet')).default;
  await app.register(helmet, {
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  });

  // @ts-expect-error - fastify-cors types not available
  const cors = (await import('fastify-cors')).default;
  await app.register(cors, {
    origin: env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  await app.register(requestLoggerPlugin);
  await app.register(rateLimitPlugin);

  // @ts-expect-error - fastify-swagger types not available
  const swagger = (await import('fastify-swagger')).default;
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'URL Shortener API',
        description: 'Production-grade URL Shortener API',
        version: '1.0.0',
      },
      servers: [{ url: `http://localhost:${env.SERVER_PORT}`, description: 'Development server' }],
      components: {
        securitySchemes: {
          bearerAuth: { type: 'http', scheme: 'bearer' },
        },
      },
    },
  });

  // @ts-expect-error - fastify-swagger-ui types not available
  const swaggerUi = (await import('fastify-swagger-ui')).default;
  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: { docExpansion: 'list', deepLinking: true },
  });

  await app.register(urlRoutes);

  app.get('/health', async () => {
    const [mongoStatus, redisStatus] = await Promise.all([
      checkMongoHealth(),
      checkRedisHealth(),
    ]);

    const allHealthy = mongoStatus && redisStatus;

    return {
      status: allHealthy ? 'ok' : 'degraded',
      services: {
        mongodb: mongoStatus ? 'up' : 'down',
        redis: redisStatus ? 'up' : 'down',
      },
      timestamp: new Date().toISOString(),
    };
  });

  return app;
}

async function checkMongoHealth(): Promise<boolean> {
  return getConnectionStatus();
}

async function checkRedisHealth(): Promise<boolean> {
  return getRedisStatus();
}

async function start(): Promise<void> {
  try {
    await connectDatabase();
    await connectRedis();

    const app = await buildApp();

    const signals = ['SIGTERM', 'SIGINT'];
    for (const signal of signals) {
      process.on(signal, async () => {
        app.log.info(`Received ${signal}, shutting down gracefully`);
        await shutdown(app);
      });
    }

    await app.listen({ port: env.SERVER_PORT, host: env.SERVER_HOST });
    app.log.info(`Server listening on ${env.SERVER_HOST}:${env.SERVER_PORT}`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

async function shutdown(app: FastifyInstance): Promise<void> {
  try {
    await app.close();
    await disconnectDatabase();
    await disconnectRedis();
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
}

start();