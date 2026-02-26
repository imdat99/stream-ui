import type { Hono } from 'hono';

export function registerWellKnownRoutes(app: Hono) {
  app.get("/.well-known/*", (c) => {
    return c.json({ ok: true });
  });
}
