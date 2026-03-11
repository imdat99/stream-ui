import type { Hono } from 'hono';
import { getManifest, saveImageFromStream, streamManifest } from '../modules/merge';

const guessContentType = (filename: string) => {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.mp4')) return 'video/mp4';
  if (lower.endsWith('.webm')) return 'video/webm';
  if (lower.endsWith('.mov')) return 'video/quicktime';
  if (lower.endsWith('.mkv')) return 'video/x-matroska';
  if (lower.endsWith('.m3u8')) return 'application/vnd.apple.mpegurl';
  return 'application/octet-stream';
};

const buildStreamResponse = async (id: string) => {
  const manifest = await getManifest(id);
  if (!manifest) {
    return new Response(JSON.stringify({ error: 'Manifest not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(streamManifest(manifest), {
    status: 200,
    headers: {
      'Content-Type': guessContentType(manifest.filename),
      'Cache-Control': 'public, max-age=3600',
      'Content-Disposition': `inline; filename="${manifest.filename}"`,
    },
  });
};

export function registerDisplayRoutes(app: Hono) {
  app.get('/display/:id', async (c) => buildStreamResponse(c.req.param('id')));
  app.get('/play/index/:id', async (c) => buildStreamResponse(c.req.param('id')));

  app.put('/display/:id/thumbnail', async (c) => {
    const arrayBuffer = await c.req.arrayBuffer();
    await saveImageFromStream(arrayBuffer, c.req.param('id'));
    return c.body('ok');
  });

  app.put('/display/:id/metadata', async (c) => {
    return c.json({ status: 'not_implemented' }, 501);
  });

  app.post('/display/:id/subs', async (c) => {
    return c.json({ status: 'not_implemented' }, 501);
  });
}
