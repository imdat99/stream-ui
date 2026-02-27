import type { Hono } from 'hono';
import { saveImageFromStream } from '../modules/merge';

export function registerDisplayRoutes(app: Hono) {
  // app.get('/manifest/:id', async (c) => {
  //   const manifest = await getListFiles();
  //   if (!manifest) {
  //     return c.json({ error: "Manifest not found" }, 404);
  //   }
  //   return c.json(manifest);
  // });
  app.put('/display/:id/thumbnail', async (c) => {
    const arrayBuffer = await c.req.arrayBuffer();
    await saveImageFromStream(arrayBuffer, crypto.randomUUID());
    return c.body('ok');
    // nhận rawData, lưu vào storage, cập nhật url thumbnail vào database
    
  });
  app.put('/display/:id/metadata', async (c) => {

  });
  app.post('/display/:id/subs', async (c) => {});
}
