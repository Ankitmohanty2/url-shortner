import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Copy, Trash2, BarChart2, MoreHorizontal, Check, Loader2 } from 'lucide-react';
import { useDeleteUrl, useUpdateExpiration } from '../hooks/useUrls.js';
import { formatRelativeTime, copyToClipboard, cn } from '../lib/utils.js';
import type { UrlResponse } from '../types/index.js';

interface UrlTableProps {
  urls: UrlResponse[];
  isLoading: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
  onSearchChange: (search: string) => void;
  searchValue: string;
}

export function UrlTable({
  urls,
  isLoading,
  pagination,
  onPageChange,
  onSearchChange,
  searchValue,
}: UrlTableProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [deletingCode, setDeletingCode] = useState<string | null>(null);

  const deleteMutation = useDeleteUrl();
  const updateExpirationMutation = useUpdateExpiration();

  const handleCopy = async (shortUrl: string, code: string) => {
    try {
      await copyToClipboard(shortUrl);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      setCopiedCode(null);
    }
  };

  const handleDelete = async (shortCode: string) => {
    if (!confirm('Are you sure you want to delete this URL? This action cannot be undone.')) return;
    setDeletingCode(shortCode);
    try {
      await deleteMutation.mutateAsync(shortCode);
    } finally {
      setDeletingCode(null);
    }
  };

  const handleToggleActive = async (url: UrlResponse) => {
    try {
      await updateExpirationMutation.mutateAsync({
        shortCode: url.shortCode,
        expiresAt: url.isActive ? new Date().toISOString() : null,
      });
    } catch {
      // Error handled by mutation
    }
  };

  if (isLoading && urls.length === 0) {
    return (
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" role="table">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Short URL</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Original URL</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Clicks</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-gray-200 dark:border-gray-700 animate-pulse">
                  <td className="px-4 py-4"><div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
                  <td className="px-4 py-4"><div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
                  <td className="px-4 py-4"><div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
                  <td className="px-4 py-4"><div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
                  <td className="px-4 py-4"><div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
                  <td className="px-4 py-4"><div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (urls.length === 0) {
    return (
      <div className="card p-12 text-center">
        <ExternalLink className="mx-auto h-12 w-12 text-gray-400 mb-4" aria-hidden="true" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No URLs found</h3>
        <p className="text-gray-500 dark:text-gray-400">
          {searchValue ? 'Try adjusting your search' : 'Create your first short URL to get started'}
        </p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <input
          type="search"
          placeholder="Search URLs..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="input max-w-xs"
          aria-label="Search URLs"
        />
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing {pagination.page * pagination.limit - pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full" role="table">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Short URL</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Original URL</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Clicks</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {urls.map((url) => (
              <tr key={url.shortCode} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/urls/${url.shortCode}`}
                      className="font-mono text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {url.shortUrl}
                    </Link>
                    <button
                      onClick={() => handleCopy(url.shortUrl, url.shortCode)}
                      className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      aria-label={copiedCode === url.shortCode ? 'Copied' : 'Copy short URL'}
                    >
                      {copiedCode === url.shortCode ? (
                        <Check className="h-4 w-4 text-green-600" aria-hidden="true" />
                      ) : (
                        <Copy className="h-4 w-4 text-gray-400" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <a
                    href={url.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-900 dark:text-white truncate block max-w-xs hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {url.originalUrl}
                  </a>
                </td>
                <td className="px-4 py-4 text-sm text-gray-900 dark:text-white font-medium">
                  {url.clickCount.toLocaleString()}
                </td>
                <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {formatRelativeTime(url.createdAt)}
                </td>
                <td className="px-4 py-4">
                  <span
                    className={cn(
                      'badge',
                      url.expiresAt && new Date(url.expiresAt) < new Date()
                        ? 'badge-error'
                        : !url.isActive
                        ? 'badge-neutral'
                        : 'badge-success'
                    )}
                  >
                    {url.expiresAt && new Date(url.expiresAt) < new Date()
                      ? 'Expired'
                      : !url.isActive
                      ? 'Inactive'
                      : 'Active'}
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <a
                      href={url.shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      aria-label="Open URL"
                    >
                      <ExternalLink className="h-4 w-4 text-gray-400" aria-hidden="true" />
                    </a>
                    <Link
                      to={`/urls/${url.shortCode}`}
                      className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      aria-label="View analytics"
                    >
                      <BarChart2 className="h-4 w-4 text-gray-400" aria-hidden="true" />
                    </Link>
                    <button
                      onClick={() => handleToggleActive(url)}
                      disabled={updateExpirationMutation.isPending}
                      className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                      aria-label={url.isActive ? 'Deactivate' : 'Activate'}
                    >
                      <MoreHorizontal className={cn('h-4 w-4 text-gray-400', !url.isActive && 'opacity-50')} aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => handleDelete(url.shortCode)}
                      disabled={deleteMutation.isPending || deletingCode === url.shortCode}
                      className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                      aria-label="Delete URL"
                    >
                      {deletingCode === url.shortCode ? (
                        <Loader2 className="h-4 w-4 text-red-600 animate-spin" aria-hidden="true" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-600" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Page {pagination.page} of {pagination.totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="btn-secondary px-3 py-1.5 text-sm"
              aria-label="Previous page"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="btn-secondary px-3 py-1.5 text-sm"
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}