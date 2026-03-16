import { Hono } from 'hono';

import { setupMiddlewares } from './server/middlewares/setup';
import { registerAuthRoutes } from './server/routes/auth';
import { registerRpcRoutes } from './server/routes/rpc';
import { registerSSRRoutes } from './server/routes/ssr';
import { registerWellKnownRoutes } from './server/routes/wellKnown';
import { setupServices } from './server/services/grpcClient';
const app = new Hono();
// Global middlewares
setupMiddlewares(app);
setupServices(app);
// Routes
registerWellKnownRoutes(app);
registerAuthRoutes(app);
registerRpcRoutes(app);
registerSSRRoutes(app);

export default app;
