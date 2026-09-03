import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ErrorResponse } from '../types/index.js';

export function errorHandler(error: FastifyError, _request: FastifyRequest, reply: FastifyReply): void {
  const statusCode = error.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  let code = 'INTERNAL_ERROR';
  let message = 'An unexpected error occurred';

  if (error.validation) {
    code = 'VALIDATION_ERROR';
    message = 'Invalid request data';
  } else if (error.name === 'ZodError') {
    code = 'VALIDATION_ERROR';
    message = 'Invalid request data';
  } else if (error.code === 'ENOENT') {
    code = 'NOT_FOUND';
    message = 'Resource not found';
    error.statusCode = 404;
  } else if (error.message.includes('duplicate') || error.message.includes('E11000')) {
    code = 'CONFLICT';
    message = 'Short code already exists';
    error.statusCode = 409;
  } else if (error.message.includes('Invalid URL')) {
    code = 'INVALID_URL';
    message = error.message;
    error.statusCode = 400;
  } else if (error.message.includes('not allowed')) {
    code = 'FORBIDDEN_URL';
    message = error.message;
    error.statusCode = 400;
  } else if (error.message.includes('expired') || error.message.includes('Expired')) {
    code = 'GONE';
    message = 'This URL has expired';
    error.statusCode = 410;
  } else if (error.message.includes('inactive') || error.message.includes('Inactive')) {
    code = 'GONE';
    message = 'This URL is no longer active';
    error.statusCode = 410;
  } else if (error.statusCode === 429) {
    code = 'RATE_LIMIT_EXCEEDED';
    message = 'Too many requests, please try again later';
  } else if (error.statusCode === 503) {
    code = 'SERVICE_UNAVAILABLE';
    message = 'Service temporarily unavailable';
  }

  const response: ErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(isProduction ? {} : { details: error.message }),
    },
  };

  reply.status(statusCode).send(response);
}

export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super('NOT_FOUND', message, 404);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super('VALIDATION_ERROR', message, 400);
    this.name = 'ValidationError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super('CONFLICT', message, 409);
    this.name = 'ConflictError';
  }
}

export class GoneError extends AppError {
  constructor(message: string) {
    super('GONE', message, 410);
    this.name = 'GoneError';
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super('RATE_LIMIT_EXCEEDED', message, 429);
    this.name = 'RateLimitError';
  }
}