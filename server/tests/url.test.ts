import { describe, it, expect } from 'vitest';
import { validateUrl, normalizeUrl } from '../src/utils/url-validator.js';
import { generateShortCode, isValidShortCode } from '../src/utils/generate-code.js';
import { AppError, NotFoundError, ValidationError, ConflictError, GoneError, RateLimitError } from '../src/middleware/error-handler.js';

describe('URL Validator', () => {
  describe('validateUrl', () => {
    it('should validate correct HTTPS URLs', () => {
      const result = validateUrl('https://example.com/path');
      expect(result.valid).toBe(true);
    });

    it('should validate correct HTTP URLs', () => {
      const result = validateUrl('http://example.com/path');
      expect(result.valid).toBe(true);
    });

    it('should reject invalid URLs', () => {
      const result = validateUrl('not-a-url');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid URL format');
    });

    it('should reject non-HTTP protocols', () => {
      const result = validateUrl('ftp://example.com');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Only HTTP and HTTPS protocols are allowed');
    });

    it('should reject localhost', () => {
      const result = validateUrl('http://localhost:3000');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('This host is not allowed');
    });

    it('should reject private IPs', () => {
      const result = validateUrl('http://192.168.1.1');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Private IP addresses are not allowed');
    });

    it('should reject empty URLs', () => {
      const result = validateUrl('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('URL is required');
    });

    it('should reject URLs exceeding max length', () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(2050);
      const result = validateUrl(longUrl);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds maximum length');
    });
  });

  describe('normalizeUrl', () => {
    it('should remove hash fragments', () => {
      const result = normalizeUrl('https://example.com/path#section');
      expect(result).toBe('https://example.com/path');
    });

    it('should preserve query parameters', () => {
      const result = normalizeUrl('https://example.com/path?query=value');
      expect(result).toBe('https://example.com/path?query=value');
    });
  });
});

describe('Short Code Generator', () => {
  describe('generateShortCode', () => {
    it('should generate codes of default length', () => {
      const code = generateShortCode();
      expect(code.length).toBe(7);
    });

    it('should generate codes of custom length', () => {
      const code = generateShortCode(10);
      expect(code.length).toBe(10);
    });

    it('should only use alphanumeric characters', () => {
      const code = generateShortCode(20);
      expect(code).toMatch(/^[A-Za-z0-9]+$/);
    });

    it('should generate different codes on each call', () => {
      const codes = new Set();
      for (let i = 0; i < 100; i++) {
        codes.add(generateShortCode());
      }
      expect(codes.size).toBe(100);
    });
  });

  describe('isValidShortCode', () => {
    it('should validate correct format codes', () => {
      expect(isValidShortCode('aB72xK9')).toBe(true);
      expect(isValidShortCode('abc123')).toBe(true);
      expect(isValidShortCode('ABC123xyz')).toBe(true);
    });

    it('should reject codes with special characters', () => {
      expect(isValidShortCode('ab-cd')).toBe(false);
      expect(isValidShortCode('ab_cd')).toBe(false);
      expect(isValidShortCode('ab.cd')).toBe(false);
    });

    it('should reject empty strings', () => {
      expect(isValidShortCode('')).toBe(false);
    });
  });
});

describe('Error Handler', () => {
  it('should export error classes', () => {
    expect(AppError).toBeDefined();
    expect(NotFoundError).toBeDefined();
    expect(ValidationError).toBeDefined();
    expect(ConflictError).toBeDefined();
    expect(GoneError).toBeDefined();
    expect(RateLimitError).toBeDefined();
  });

  it('should create errors with correct status codes', () => {
    expect(new NotFoundError().statusCode).toBe(404);
    expect(new ValidationError('test').statusCode).toBe(400);
    expect(new ConflictError('test').statusCode).toBe(409);
    expect(new GoneError('test').statusCode).toBe(410);
    expect(new RateLimitError().statusCode).toBe(429);
  });
});