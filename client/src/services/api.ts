import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import type {
  UrlResponse,
  CreateUrlRequest,
  CreateUrlResponse,
  UrlListResponse,
  AnalyticsResponse,
  ErrorResponse,
} from '../types/index.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => config,
      (error: AxiosError) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ErrorResponse>) => {
        if (error.response?.data?.error?.message) {
          return Promise.reject(new Error(error.response.data.error.message));
        }
        return Promise.reject(error);
      }
    );
  }

  async createUrl(data: CreateUrlRequest): Promise<CreateUrlResponse> {
    const response = await this.client.post<CreateUrlResponse>('/v1/urls', data);
    return response.data;
  }

  async getUrls(params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: 'createdAt' | 'clickCount' | 'expiresAt';
    sortOrder?: 'asc' | 'desc';
    isActive?: boolean;
  }): Promise<UrlListResponse> {
    const response = await this.client.get<UrlListResponse>('/v1/urls', { params });
    return response.data;
  }

  async getUrl(shortCode: string): Promise<{ success: boolean; data: UrlResponse }> {
    const response = await this.client.get<{ success: boolean; data: UrlResponse }>(
      `/v1/urls/${shortCode}`
    );
    return response.data;
  }

  async deleteUrl(shortCode: string): Promise<{ success: boolean; data: { message: string } }> {
    const response = await this.client.delete<{ success: boolean; data: { message: string } }>(
      `/v1/urls/${shortCode}`
    );
    return response.data;
  }

  async updateExpiration(
    shortCode: string,
    expiresAt: string | null
  ): Promise<{ success: boolean; data: { message: string } }> {
    const response = await this.client.patch<{ success: boolean; data: { message: string } }>(
      `/v1/urls/${shortCode}/expiration`,
      { expiresAt }
    );
    return response.data;
  }

  async getAnalytics(shortCode: string): Promise<AnalyticsResponse> {
    const response = await this.client.get<AnalyticsResponse>(`/v1/urls/${shortCode}/analytics`);
    return response.data;
  }

  async healthCheck(): Promise<{ status: string; services: Record<string, string> }> {
    const response = await this.client.get('/health');
    return response.data;
  }
}

export const api = new ApiService();