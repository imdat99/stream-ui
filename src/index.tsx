import { Hono } from 'hono';

import { setupMiddlewares } from './server/middlewares/setup';
import { apiProxyMiddleware } from './server/middlewares/apiProxy';
import { registerWellKnownRoutes } from './server/routes/wellKnown';
import { registerMergeRoutes } from './server/routes/merge';
import { registerManifestRoutes } from './server/routes/manifest';
import { registerSSRRoutes } from './server/routes/ssr';

const app = new Hono();

// Global middlewares
setupMiddlewares(app);

// API proxy middleware (handles /r/*)
app.use(apiProxyMiddleware);

// Routes
registerWellKnownRoutes(app);
registerMergeRoutes(app);
registerManifestRoutes(app);
registerSSRRoutes(app);

export default app;
