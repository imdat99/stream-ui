import { authenticate } from "@/server/middlewares/authenticate";
import { getGrpcMetadataFromContext } from "@/server/services/grpcClient";
import { parse, stringify } from "@/shared/secure-json-transformer";
import { Metadata } from "@grpc/grpc-js";
import { exposeTinyRpc, httpServerAdapter } from "@hiogawa/tiny-rpc";
import { Hono } from "hono";
import { protectedAuthMethods, publicAuthMethods } from "./auth";
import { meMethods } from "./me";
import { getContext } from "hono/context-storage";
import { adminMethods } from "./admin";

declare module "hono" {
  interface ContextVariableMap {
    grpcMetadata: Metadata;
  }
}

const protectedRoutes = {
  health: () => ({ ok: true }),
  ...protectedAuthMethods,
  ...meMethods,
  ...adminMethods
};

const publicRoutes = {
  ...publicAuthMethods,
};

export type RpcRoutes = typeof protectedRoutes & typeof publicRoutes;
export const endpoint = "/rpc/*";
export const publicEndpoint = "/rpc-public/*";
export const pathsForGET: (keyof typeof protectedRoutes)[] = ["health"];

export function registerRpcRoutes(app: Hono) {
  const JSONProcessor: JsonTransformer = {
    parse: (v) => parse(v, () => getContext()?.req.header()),
    stringify: (v) =>
      stringify(v, (headers) => {
        const ctx = getContext();
        if (ctx) {
          Object.entries(headers).forEach(([k, v]) => {
            ctx.header(k, v);
          });
          // ctx.header()
        }
      }),
  };
  const protectedHandler = exposeTinyRpc({
    routes: protectedRoutes,
    adapter: httpServerAdapter({ endpoint: "/rpc", 
      // JSON: JSONProcessor
     }),
  });
  app.use(publicEndpoint, async (c, next) => {
    const publicHandler = exposeTinyRpc({
      routes: publicRoutes,
      adapter: httpServerAdapter({
        endpoint: "/rpc-public",
        // JSON: JSONProcessor,
      }),
    });
    const res = await publicHandler({ request: c.req.raw });
    if (res) {
      return res;
    }
    return await next();
  });
  app.use(endpoint, authenticate, async (c, next) => {
    c.set("grpcMetadata", getGrpcMetadataFromContext());

    const res = await protectedHandler({ request: c.req.raw });
    if (res) {
      return res;
    }
    return await next();
  });
}
