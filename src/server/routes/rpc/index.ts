import { authenticate } from "@/server/middlewares/authenticate";
import { exposeTinyRpc, httpServerAdapter } from "@hiogawa/tiny-rpc";
import { Hono } from "hono";
import { Metadata } from "@grpc/grpc-js";
import { meMethods } from "./me";
import { protectedAuthMethods, publicAuthMethods } from "./auth";
import { getGrpcMetadataFromContext } from "@/server/services/grpcClient";

declare module "hono" {
  interface ContextVariableMap {
    grpcMetadata: Metadata;
  }
}

const protectedRoutes = {
  health: () => ({ ok: true }),
  ...protectedAuthMethods,
  ...meMethods,
};

const publicRoutes = {
  ...publicAuthMethods,
};

export type RpcRoutes = typeof protectedRoutes & typeof publicRoutes;
export const endpoint = "/rpc";
export const publicEndpoint = "/rpc-public";
export const pathsForGET: (keyof typeof protectedRoutes)[] = ["health"];

export function registerRpcRoutes(app: Hono) {
  const protectedHandler = exposeTinyRpc({
    routes: protectedRoutes,
    adapter: httpServerAdapter({ endpoint }),
  });
  const publicHandler = exposeTinyRpc({
    routes: publicRoutes,
    adapter: httpServerAdapter({ endpoint: publicEndpoint }),
  });

  app.use(endpoint, authenticate, async (c, next) => {
    if (c.req.path !== endpoint && !c.req.path.startsWith(endpoint + "/")) {
      return await next();
    }

    c.set("grpcMetadata", getGrpcMetadataFromContext());

    const res = await protectedHandler({ request: c.req.raw });
    if (res) {
      return res;
    }
    return await next();
  });

  app.use(publicEndpoint, async (c, next) => {
    if (c.req.path !== publicEndpoint && !c.req.path.startsWith(publicEndpoint + "/")) {
      return await next();
    }

    const res = await publicHandler({ request: c.req.raw });
    if (res) {
      return res;
    }
    return await next();
  });
}
