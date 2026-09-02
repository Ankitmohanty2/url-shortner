import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api.js';
import type { CreateUrlRequest } from '../types/index.js';

export function useUrls(params?: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'createdAt' | 'clickCount' | 'expiresAt';
  sortOrder?: 'asc' | 'desc';
  isActive?: boolean;
}) {
  return useQuery({
    queryKey: ['urls', params],
    queryFn: () => api.getUrls(params),
    select: (data) => data.data,
  });
}

export function useUrl(shortCode: string) {
  return useQuery({
    queryKey: ['url', shortCode],
    queryFn: () => api.getUrl(shortCode),
    select: (data) => data.data,
    enabled: !!shortCode,
  });
}

export function useCreateUrl() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUrlRequest) => api.createUrl(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['urls'] });
    },
  });
}

export function useDeleteUrl() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (shortCode: string) => api.deleteUrl(shortCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['urls'] });
    },
  });
}

export function useUpdateExpiration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ shortCode, expiresAt }: { shortCode: string; expiresAt: string | null }) =>
      api.updateExpiration(shortCode, expiresAt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['urls'] });
    },
  });
}

export function useAnalytics(shortCode: string) {
  return useQuery({
    queryKey: ['analytics', shortCode],
    queryFn: () => api.getAnalytics(shortCode),
    select: (data) => data.data,
    enabled: !!shortCode,
  });
}