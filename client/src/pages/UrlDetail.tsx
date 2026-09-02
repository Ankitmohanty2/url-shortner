import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useUrl, useDeleteUrl, useUpdateExpiration } from '../hooks/useUrls.js';
import { formatDate, getExpirationLabel, copyToClipboard, cn } from '../lib/utils.js';
import { ExternalLink, Copy, Trash2, ArrowLeft, Check, Loader2, Calendar, AlertCircle } from 'lucide-react';

export function UrlDetail() {
  const { shortCode } = useParams<{ shortCode: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: url, isLoading, error } = useUrl(shortCode || '');
  const deleteMutation = useDeleteUrl();
  const updateExpirationMutation = useUpdateExpiration();

  const handleCopy = async () => {
    if (!url) return;
    try {
      await copyToClipboard(url.shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleDelete = async () => {
    if (!url) return;
    try {
      await deleteMutation.mutateAsync(url.shortCode);
      navigate('/urls');
    } catch {
      // Error handled by mutation
    }
  };

  const handleExpireNow = async () => {
    if (!url) return;
    try {
      await updateExpirationMutation.mutateAsync({
        shortCode: url.shortCode,
        expiresAt: new Date().toISOString(),
      });
    } catch {
      // Error handled by mutation
    }
  };

  const handleRemoveExpiration = async () => {
    if (!url) return;
    try {
      await updateExpirationMutation.mutateAsync({
        shortCode: url.shortCode,
        expiresAt: null,
      });
    } catch {
      // Error handled by mutation
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="card p-8 animate-pulse space-y-4">
          <div className="h-6 w-1/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !url) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">URL Not Found</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">The short URL you're looking for doesn't exist or has been removed.</p>
        <Link to="/urls" className="btn-primary">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const isExpired = url.expiresAt && new Date(url.expiresAt) < new Date();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/urls" className="btn-ghost p-2" aria-label="Back to dashboard">
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">URL Details</h1>
          <p className="text-gray-500 dark:text-gray-400">Short code: {url.shortCode}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="card p-6" aria-labelledby="urls-heading">
            <h2 id="urls-heading" className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <ExternalLink className="h-5 w-5 text-gray-400" aria-hidden="true" />
              URLs
            </h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Short URL</dt>
                <dd className="mt-1 flex items-center gap-2">
                  <a
                    href={url.shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-blue-600 dark:text-blue-400 hover:underline break-all flex-1"
                  >
                    {url.shortUrl}
                  </a>
                  <button
                    onClick={handleCopy}
                    className="btn-secondary p-2"
                    aria-label={copied ? 'Copied' : 'Copy to clipboard'}
                  >
                    {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Original URL</dt>
                <dd className="mt-1">
                  <a
                    href={url.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 break-all block"
                  >
                    {url.originalUrl}
                  </a>
                </dd>
              </div>
            </dl>
          </section>

          <section className="card p-6" aria-labelledby="status-heading">
            <h2 id="status-heading" className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-400" aria-hidden="true" />
              Status & Expiration
            </h2>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
                <dd className="mt-1">
                  <span className={cn('badge', isExpired ? 'badge-error' : !url.isActive ? 'badge-neutral' : 'badge-success')}>
                    {isExpired ? 'Expired' : !url.isActive ? 'Inactive' : 'Active'}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Expires</dt>
                <dd className="mt-1">
                  {url.expiresAt ? (
                    <>
                      <time dateTime={url.expiresAt}>{formatDate(url.expiresAt)}</time>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {isExpired ? 'Expired' : `Expires in ${getExpirationLabel(url.expiresAt)}`}
                      </p>
                    </>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">Never</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</dt>
                <dd className="mt-1">{formatDate(url.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Accessed</dt>
                <dd className="mt-1">{url.lastAccessedAt ? formatDate(url.lastAccessedAt) : 'Never'}</dd>
              </div>
            </dl>

            {(!isExpired && url.isActive) && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-2">
                <button
                  onClick={handleExpireNow}
                  disabled={updateExpirationMutation.isPending}
                  className="btn-secondary"
                >
                  Expire Now
                </button>
              </div>
            )}

            {(isExpired || !url.isActive) && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-2">
                <button
                  onClick={handleRemoveExpiration}
                  disabled={updateExpirationMutation.isPending}
                  className="btn-primary"
                >
                  Reactivate
                </button>
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="card p-6" aria-labelledby="stats-heading">
            <h2 id="stats-heading" className="text-lg font-medium text-gray-900 dark:text-white mb-4">Statistics</h2>
            <dl className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                <dt className="text-gray-500 dark:text-gray-400">Total Clicks</dt>
                <dd className="text-2xl font-bold text-gray-900 dark:text-white">{url.clickCount.toLocaleString()}</dd>
              </div>
              <div className="flex justify-between items-center py-3">
                <dt className="text-gray-500 dark:text-gray-400">Short Code</dt>
                <dd className="font-mono text-gray-900 dark:text-white">{url.shortCode}</dd>
              </div>
            </dl>
          </section>

          <section className="card p-6" aria-labelledby="actions-heading">
            <h2 id="actions-heading" className="text-lg font-medium text-gray-900 dark:text-white mb-4">Actions</h2>
            <div className="space-y-2">
              <a
                href={url.shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full justify-center"
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                Open Short URL
              </a>
              <Link to={`/analytics/${url.shortCode}`} className="btn-secondary w-full justify-center">
                View Analytics
              </Link>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="btn-danger w-full justify-center"
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Delete URL
              </button>
            </div>
          </section>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete URL?</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              This action cannot be undone. The short URL <code className="font-mono">{url.shortCode}</code> will be permanently removed.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowDeleteConfirm(false)} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="btn-danger"
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}