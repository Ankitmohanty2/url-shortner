import { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import { useUrls } from '../hooks/useUrls.js';
import { UrlTable } from '../components/UrlTable.js';
import { StatsCards } from '../components/StatsCards.js';

export function Dashboard() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy] = useState<'createdAt' | 'clickCount' | 'expiresAt'>('createdAt');
  const [sortOrder] = useState<'asc' | 'desc'>('desc');
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);

  const { data, isLoading, error, refetch } = useUrls({
    page,
    limit: 20,
    search: search || undefined,
    sortBy,
    sortOrder,
    isActive,
  });

  const urls = data?.urls || [];
  const pagination = data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 };

  const stats = {
    totalUrls: pagination.total,
    totalClicks: urls.reduce((sum, u) => sum + u.clickCount, 0),
    activeUrls: urls.filter((u) => u.isActive && (!u.expiresAt || new Date(u.expiresAt) > new Date())).length,
    expiredUrls: urls.filter((u) => u.expiresAt && new Date(u.expiresAt) <= new Date()).length,
  };

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  useEffect(() => {
    refetch();
  }, [page, search, sortBy, sortOrder, isActive, refetch]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and monitor your short URLs</p>
        </div>
      </div>

      <StatsCards stats={stats} />

      <div className="card p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" aria-hidden="true" />
            <input
              type="search"
              placeholder="Search URLs..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="input pl-10"
              aria-label="Search URLs"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={isActive === undefined ? 'all' : isActive.toString()}
              onChange={(e) => setIsActive(e.target.value === 'all' ? undefined : e.target.value === 'true')}
              className="input w-auto"
              aria-label="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      <UrlTable
        urls={urls}
        isLoading={isLoading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSearchChange={handleSearch}
        searchValue={search}
      />

      {error && (
        <div className="card p-6 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400" role="alert">
            Failed to load URLs. Please try again.
          </p>
        </div>
      )}
    </div>
  );
}