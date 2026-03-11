import type { Hono } from 'hono';

export function registerWellKnownRoutes(app: Hono) {
  app.get("/.well-known/*", (c) => {
    return c.json({ ok: true });
  });
  app.get("/health/live", (c) => {
    return c.json({ status: "alive" });
  });
  app.get("/health/ready", (c) => {
    return c.json({ status: "ready" });
  });
  app.get("/health/detailed", (c) => {
    return c.json({ status: "detailed", uptime: process.uptime() });
  });
  // app.get("/metrics", (c) => {
  //   //TODO: Implement metrics endpoint/ Prometheus integration
  //   return c.json({ message: "Metrics endpoint" });
  // });
}
