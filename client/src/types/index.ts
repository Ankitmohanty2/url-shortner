export interface UrlResponse {
  shortCode: string;
  shortUrl: string;
  originalUrl: string;
  expiresAt?: string;
  createdAt: string;
  clickCount: number;
  isActive: boolean;
  lastAccessedAt?: string;
}

export interface CreateUrlRequest {
  originalUrl: string;
  expiresAt?: string;
}

export interface CreateUrlResponse {
  success: boolean;
  data: UrlResponse;
}

export interface UrlListResponse {
  success: boolean;
  data: {
    urls: UrlResponse[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface AnalyticsResponse {
  success: boolean;
  data: {
    clickCount: number;
    createdAt: string;
    lastAccessedAt?: string;
    expiresAt?: string;
    isActive: boolean;
  };
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'down';
  services: {
    mongodb: 'up' | 'down';
    redis: 'up' | 'down';
    zookeeper: 'up' | 'down';
  };
  timestamp: string;
}

export type ExpirationOption = 'never' | '1h' | '1d' | '7d' | '30d' | 'custom';