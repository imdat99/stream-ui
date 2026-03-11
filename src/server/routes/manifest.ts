import { getManifest } from '@/server/modules/merge';
import type { Hono } from 'hono';

export function registerManifestRoutes(app: Hono) {
  app.get('/manifest/:id', async (c) => {
    const manifest = await getManifest(c.req.param('id'));
    if (!manifest) {
      return c.json({ error: 'Manifest not found' }, 404);
    }
    return c.json(manifest);
  });
}
