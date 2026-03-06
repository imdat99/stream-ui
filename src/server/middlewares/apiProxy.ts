import { customFetch } from '@httpClientAdapter';
import type { Context, Next } from 'hono';

export async function apiProxyMiddleware(c: Context, next: Next) {
  const path = c.req.path;

  if (path !== '/r' && !path.startsWith('/r/')) {
    return await next();
  }
  return customFetch(c.req.url, c.req)
}
