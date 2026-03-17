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
  // app.get("/trpc-secure-config", (c) => {
  //   return c.json({ kid: process.env.TRPC_SECURE_KID, publicKeyBase64: process.env.TRPC_SECURE_PUBLIC_KEY });
  // });
  app.get("/trpc-secure-config", (c) => {
    return c.json({ kid: 'xUJh4/ADCkL/mZTsxSofIVTgLrTLw2C8h/X8/StUc0E=', publicKeyBase64: 'hvtS8b4RWXkau3B2UXbWhCV1NxS/97DGLfcftf/0TG8=' });
  });
  // app.get("/metrics", (c) => {
  //   //TODO: Implement metrics endpoint/ Prometheus integration
  //   return c.json({ message: "Metrics endpoint" });
  // });
}
