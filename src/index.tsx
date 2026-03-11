import { Hono } from 'hono';

import { apiProxyMiddleware } from './server/middlewares/apiProxy';
import { setupMiddlewares } from './server/middlewares/setup';
import { registerDisplayRoutes } from './server/routes/display';
import { registerManifestRoutes } from './server/routes/manifest';
import { registerMergeRoutes } from './server/routes/merge';
import { registerSSRRoutes } from './server/routes/ssr';
import { registerWellKnownRoutes } from './server/routes/wellKnown';
import { setupServices } from './server/services/grpcClient';
const app = new Hono();

// Global middlewares
setupMiddlewares(app);
setupServices(app);
// API proxy middleware (handles /r/*)
app.use(apiProxyMiddleware);
// Routes
registerWellKnownRoutes(app);
registerMergeRoutes(app);
registerDisplayRoutes(app);
registerManifestRoutes(app);
registerSSRRoutes(app);

export default app;
