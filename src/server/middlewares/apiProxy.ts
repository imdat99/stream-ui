import { baseAPIURL } from '@/api/httpClientAdapter.server';
import type { Context, Next } from 'hono';

export async function apiProxyMiddleware(c: Context, next: Next) {
  const path = c.req.path;

  if (path !== '/r' && !path.startsWith('/r/')) {
    return await next();
  }

  const url = new URL(c.req.url);
  url.host = baseAPIURL.replace(/^https?:\/\//, '');
  url.protocol = 'https:';
  url.pathname = path.replace(/^\/r/, '') || '/';
  url.port = '';

  const headers = new Headers(c.req.header());
  headers.delete("host");
  headers.delete("connection");

  return fetch(url.toString(), {
    method: c.req.method,
    headers: headers,
    body: c.req.raw.body,
    // @ts-ignore
    duplex: 'half',
    credentials: 'include'
  });
}
