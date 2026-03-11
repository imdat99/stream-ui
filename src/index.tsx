import { Hono } from 'hono';

import { setupMiddlewares } from './server/middlewares/setup';
import { registerDisplayRoutes } from './server/routes/display';
import { registerManifestRoutes } from './server/routes/manifest';
import { registerMergeRoutes } from './server/routes/merge';
import { registerSSRRoutes } from './server/routes/ssr';
import { registerWellKnownRoutes } from './server/routes/wellKnown';
import { setupServices } from './server/services/grpcClient';
import { registerRpcRoutes } from './server/routes/rpc';
const app = new Hono();

// Global middlewares
setupMiddlewares(app);
setupServices(app);
// Routes
registerWellKnownRoutes(app);
registerRpcRoutes(app);
registerMergeRoutes(app);
registerDisplayRoutes(app);
registerManifestRoutes(app);
registerSSRRoutes(app);

export default app;
