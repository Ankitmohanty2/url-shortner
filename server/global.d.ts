import { FastifyPluginAsync } from 'fastify';

interface CorsOptions {
  origin?: string | string[] | ((origin: string, callback: (err: Error | null, allow?: boolean) => void) => void);
  credentials?: boolean;
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  maxAge?: number;
  preflightContinue?: boolean;
  optionsSuccessStatus?: number;
}

declare module 'fastify-cors' {
  const fastifyCors: FastifyPluginAsync<CorsOptions>;
  export default fastifyCors;
}

interface HelmetOptions {
  contentSecurityPolicy?: boolean | object;
  crossOriginEmbedderPolicy?: boolean | object;
  crossOriginOpenerPolicy?: boolean | object;
  crossOriginResourcePolicy?: boolean | object;
  dnsPrefetchControl?: boolean | object;
  expectCt?: boolean | object;
  frameguard?: boolean | object;
  hidePoweredBy?: boolean | object;
  hsts?: boolean | object;
  ieNoOpen?: boolean | object;
  noSniff?: boolean | object;
  permittedCrossDomainPolicies?: boolean | object;
  referrerPolicy?: boolean | object;
  xssFilter?: boolean | object;
}

declare module 'fastify-helmet' {
  const fastifyHelmet: FastifyPluginAsync<HelmetOptions>;
  export default fastifyHelmet;
}

interface RateLimitOptions {
  max?: number;
  timeWindow?: number | string;
  keyGenerator?: (request: any) => string;
  allowList?: string[];
  skipOnError?: boolean;
  addHeaders?: boolean | { 'x-ratelimit-limit': boolean; 'x-ratelimit-remaining': boolean; 'x-ratelimit-reset': boolean };
  errorMessage?: string;
  disableCache?: boolean;
  redis?: any;
}

declare module 'fastify-rate-limit' {
  const fastifyRateLimit: FastifyPluginAsync<RateLimitOptions>;
  export default fastifyRateLimit;
}

interface SwaggerOptions {
  openapi?: any;
  routePrefix?: string;
  exposeRoute?: boolean;
  swagger?: any;
}

declare module 'fastify-swagger' {
  const fastifySwagger: FastifyPluginAsync<SwaggerOptions>;
  export default fastifySwagger;
}

interface SwaggerUIOptions {
  routePrefix?: string;
  uiConfig?: any;
  uiHooks?: any;
  staticCSP?: boolean;
  transformStaticCSP?: (csp: string) => string;
}

declare module 'fastify-swagger-ui' {
  const fastifySwaggerUI: FastifyPluginAsync<SwaggerUIOptions>;
  export default fastifySwaggerUI;
}