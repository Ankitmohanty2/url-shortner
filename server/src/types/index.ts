export interface UrlDocument {
  _id: string;
  originalUrl: string;
  shortCode: string;
  createdAt: Date;
  expiresAt?: Date;
  clickCount: number;
  isActive: boolean;
  lastAccessedAt?: Date;
}

export interface CreateUrlInput {
  originalUrl: string;
  expiresAt?: Date;
}

export interface UrlResponse {
  shortCode: string;
  shortUrl: string;
  originalUrl: string;
  expiresAt?: Date;
  createdAt: Date;
  clickCount: number;
  isActive: boolean;
}

export interface UrlListQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'createdAt' | 'clickCount' | 'expiresAt';
  sortOrder?: 'asc' | 'desc';
  isActive?: boolean;
}

export interface UrlListResponseInternal {
  urls: UrlDocument[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UrlListResponse {
  urls: UrlResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AnalyticsResponse {
  clickCount: number;
  createdAt: Date;
  lastAccessedAt?: Date;
  expiresAt?: Date;
  isActive: boolean;
}

export interface HealthCheckResponse {
  status: 'ok' | 'degraded' | 'down';
  services: {
    mongodb: 'up' | 'down';
    redis: 'up' | 'down';
    zookeeper: 'up' | 'down';
  };
  timestamp: string;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;