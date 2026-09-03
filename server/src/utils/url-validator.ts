const ALLOWED_PROTOCOLS = ['http:', 'https:'];
const MAX_URL_LENGTH = 2048;

const BLOCKED_HOSTS = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  '169.254.169.254',
];

const PRIVATE_IP_RANGES = [
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  /^192\.168\./,
  /^127\./,
  /^169\.254\./,
  /^::1$/,
  /^fe80::/i,
];

export function validateUrl(url: string): { valid: boolean; error?: string } {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL is required' };
  }

  if (url.length > MAX_URL_LENGTH) {
    return { valid: false, error: `URL exceeds maximum length of ${MAX_URL_LENGTH} characters` };
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }

  if (!ALLOWED_PROTOCOLS.includes(parsedUrl.protocol)) {
    return { valid: false, error: 'Only HTTP and HTTPS protocols are allowed' };
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  if (BLOCKED_HOSTS.includes(hostname)) {
    return { valid: false, error: 'This host is not allowed' };
  }

  if (isPrivateIp(hostname)) {
    return { valid: false, error: 'Private IP addresses are not allowed' };
  }

  return { valid: true };
}

function isPrivateIp(hostname: string): boolean {
  return PRIVATE_IP_RANGES.some((regex) => regex.test(hostname));
}

export function normalizeUrl(url: string): string {
  const parsed = new URL(url);
  parsed.hash = '';
  return parsed.toString();
}