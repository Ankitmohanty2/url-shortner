import { useParams, Link } from 'react-router-dom';
import { useUrl, useAnalytics } from '../hooks/useUrls.js';
import { formatDate, cn } from '../lib/utils.js';
import { ArrowLeft, ExternalLink, BarChart2, TrendingUp, Clock, MousePointer2, Calendar } from 'lucide-react';

export function Analytics() {
  const { shortCode } = useParams<{ shortCode: string }>();

  const { data: url, isLoading: urlLoading, error: urlError } = useUrl(shortCode || '');
  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useAnalytics(shortCode || '');

  if (urlLoading || analyticsLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/urls" className="btn-ghost p-2">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        </div>
        <div className="card p-8 animate-pulse space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (urlError || analyticsError || !url || !analytics) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <BarChart2 className="mx-auto h-12 w-12 text-gray-400 mb-4" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Analytics Unavailable</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          The analytics data for this URL could not be loaded.
        </p>
        <Link to="/urls" className="btn-primary">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const isExpired = url.expiresAt && new Date(url.expiresAt) < new Date();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/urls" className="btn-ghost p-2">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-gray-500 dark:text-gray-400">Short code: {url.shortCode}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <article className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Clicks</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{analytics.clickCount.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <MousePointer2 className="h-6 w-6" />
            </div>
          </div>
        </article>

        <article className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1 text-base">
                {formatDate(analytics.createdAt).split(',')[0]}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
              <Calendar className="h-6 w-6" />
            </div>
          </div>
        </article>

        <article className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Accessed</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1 text-base">
                {analytics.lastAccessedAt ? formatDate(analytics.lastAccessedAt).split(',')[0] : 'Never'}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400">
              <Clock className="h-6 w-6" />
            </div>
          </div>
        </article>

        <article className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1 text-base">
                <span className={cn('badge', isExpired || !analytics.isActive ? 'badge-error' : 'badge-success')}>
                  {isExpired ? 'Expired' : !analytics.isActive ? 'Inactive' : 'Active'}
                </span>
              </p>
            </div>
            <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </article>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 card p-6" aria-labelledby="overview-heading">
          <h2 id="overview-heading" className="text-lg font-medium text-gray-900 dark:text-white mb-6">Overview</h2>
          <dl className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
              <dt className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                Short URL
              </dt>
              <dd className="font-mono text-blue-600 dark:text-blue-400">
                <a href={url.shortUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {url.shortUrl}
                </a>
              </dd>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
              <dt className="text-gray-500 dark:text-gray-400">Original URL</dt>
              <dd className="text-gray-900 dark:text-white truncate max-w-xs text-right">
                {url.originalUrl}
              </dd>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
              <dt className="text-gray-500 dark:text-gray-400">Expires</dt>
              <dd className="text-gray-900 dark:text-white">
                {url.expiresAt ? formatDate(url.expiresAt) : 'Never'}
              </dd>
            </div>
            <div className="flex justify-between items-center py-3">
              <dt className="text-gray-500 dark:text-gray-400">Total Clicks</dt>
              <dd className="font-bold text-gray-900 dark:text-white">{analytics.clickCount.toLocaleString()}</dd>
            </div>
          </dl>
        </section>

        <section className="card p-6" aria-labelledby="chart-heading">
          <h2 id="chart-heading" className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart2 className="h-5 w-5" aria-hidden="true" />
            Click Timeline
          </h2>
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400 text-center px-4">
              Detailed click timeline charts would be displayed here.
              <br />
              <span className="text-sm">Integrate with a chart library like Recharts or Chart.js for visualization.</span>
            </p>
          </div>
        </section>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Raw Data</h2>
        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm">
          {JSON.stringify({ url, analytics }, null, 2)}
        </pre>
      </div>
    </div>
  );
}