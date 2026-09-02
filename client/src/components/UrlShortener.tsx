import { useState } from 'react';
import { Copy, ExternalLink, QrCode, Check, Loader2, AlertCircle } from 'lucide-react';
import { useCreateUrl } from '../hooks/useUrls.js';
import { validateUrl, getExpirationDate, getExpirationLabel, copyToClipboard } from '../lib/utils.js';
import type { ExpirationOption } from '../types/index.js';

const EXPIRATION_OPTIONS: { value: ExpirationOption; label: string }[] = [
  { value: 'never', label: 'Never' },
  { value: '1h', label: '1 hour' },
  { value: '1d', label: '1 day' },
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: 'custom', label: 'Custom date' },
];

export function UrlShortener() {
  const [url, setUrl] = useState('');
  const [expiration, setExpiration] = useState<ExpirationOption>('never');
  const [customDate, setCustomDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const createUrlMutation = useCreateUrl();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCopied(false);

    const validation = validateUrl(url);
    if (!validation.valid) {
      setError(validation.error || 'Invalid URL');
      return;
    }

    const expiresAt = getExpirationDate(expiration, customDate);
    const expiresAtISO = expiresAt ? expiresAt.toISOString() : undefined;

    try {
      await createUrlMutation.mutateAsync({ originalUrl: url, expiresAt: expiresAtISO });
      setUrl('');
      setCustomDate('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create short URL');
    }
  };

  const handleCopy = async (shortUrl: string) => {
    try {
      await copyToClipboard(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const result = createUrlMutation.data?.data;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <section aria-labelledby="shorten-heading" className="card p-6 sm:p-8">
        <h2 id="shorten-heading" className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          Shorten a URL
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Long URL
            </label>
            <div className="relative">
              <input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/very/long/url/that/needs/shortening"
                className="input pr-12"
                disabled={createUrlMutation.isPending}
                aria-describedby={error ? 'url-error' : undefined}
                aria-invalid={!!error}
                autoComplete="url"
                autoFocus
              />
              {createUrlMutation.isPending && (
                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 animate-spin" aria-hidden="true" />
              )}
            </div>
            {error && (
              <p id="url-error" className="mt-1.5 text-sm text-red-600 dark:text-red-400" role="alert">
                <AlertCircle className="inline h-3.5 w-3.5 mr-1" aria-hidden="true" />
                {error}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="expiration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Expiration
            </label>
            <select
              id="expiration"
              value={expiration}
              onChange={(e) => setExpiration(e.target.value as ExpirationOption)}
              className="input"
              disabled={createUrlMutation.isPending}
            >
              {EXPIRATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {expiration === 'custom' && (
            <div>
              <label htmlFor="customDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Expiration Date & Time
              </label>
              <input
                id="customDate"
                type="datetime-local"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="input"
                disabled={createUrlMutation.isPending}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
          )}

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={createUrlMutation.isPending || !url.trim()}
          >
            {createUrlMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Creating...
              </>
            ) : (
              'Shorten URL'
            )}
          </button>
        </form>
      </section>

      {result && (
        <section aria-labelledby="result-heading" className="card p-6 sm:p-8 animate-fade-in">
          <h3 id="result-heading" className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Your Shortened URL
          </h3>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span className="font-mono text-lg text-gray-900 dark:text-white break-all flex-1">
                {result.shortUrl}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(result.shortUrl)}
                className="btn-secondary p-2"
                aria-label={copied ? 'Copied to clipboard' : 'Copy to clipboard'}
              >
                {copied ? (
                  <Check className="h-5 w-5 text-green-600" aria-hidden="true" />
                ) : (
                  <Copy className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <a
                href={result.shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                Open
              </a>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => window.open(`/qrcode?url=${encodeURIComponent(result.shortUrl)}`, '_blank')}
              >
                <QrCode className="h-4 w-4" aria-hidden="true" />
                QR Code
              </button>
            </div>

            <dl className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
              <div>
                <dt className="font-medium text-gray-900 dark:text-white">Original URL</dt>
                <dd className="truncate">{result.originalUrl}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-900 dark:text-white">Expires</dt>
                <dd>{result.expiresAt ? getExpirationLabel(result.expiresAt) : 'Never'}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-900 dark:text-white">Created</dt>
                <dd>{new Date(result.createdAt).toLocaleDateString()}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-900 dark:text-white">Clicks</dt>
                <dd>{result.clickCount}</dd>
              </div>
            </dl>
          </div>
        </section>
      )}
    </div>
  );
}