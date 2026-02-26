import { baseAPIURL } from '@/api/httpClientAdapter.server';
import { 
  createManifest, 
  saveManifest, 
  validateChunkUrls 
} from '@/server/modules/merge';
import type { Hono, MiddlewareHandler } from 'hono';

const authMiddleware: MiddlewareHandler = async (c, next) => {
  const headers = new Headers(c.req.header());
  headers.delete("host");
  headers.delete("connection");

  try {
    const res = await fetch(`${baseAPIURL}/me`, {
      method: 'GET',
      headers: headers,
      credentials: 'include'
    });
    const data = await res.json();
    
    if (data.data?.user) {
      return await next();
    }
    throw new Error("Unauthorized");
  } catch {
    return c.json({ error: "Unauthorized" }, 401);
  }
};

export function registerMergeRoutes(app: Hono) {
  app.post('/merge', authMiddleware, async (c) => {
    try {
      const body = await c.req.json();
      const { filename, chunks } = body;

      if (!filename || !Array.isArray(chunks) || chunks.length === 0) {
        return c.json({ error: 'invalid payload' }, 400);
      }

      const hostError = validateChunkUrls(chunks);
      if (hostError) return c.json({ error: hostError }, 400);

      const manifest = createManifest(filename, chunks);
      await saveManifest(manifest);

      return c.json({
        status: 'ok',
        id: manifest.id,
        filename: manifest.filename,
        total_parts: manifest.total_parts,
      });
    } catch (e: any) {
      return c.json({ error: e?.message ?? String(e) }, 500);
    }
  });
}
