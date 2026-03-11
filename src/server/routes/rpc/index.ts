import { authenticate } from "@/server/middlewares/authenticate";
import {
  exposeTinyRpc,
  httpServerAdapter,
  validateFn,
} from "@hiogawa/tiny-rpc";
import { tinyassert } from "@hiogawa/utils";
import { Hono } from "hono";
import { getContext } from "hono/context-storage";
import { jwt } from "hono/jwt";
import { z } from "zod";
import { meMethods } from "./me";

const routes = {
  // define as a bare function
  checkId: (id: string) => {
    const context = getContext();
    console.log(context.req.raw.headers);
    return id === "good";
  },
  ...meMethods
};
export type RpcRoutes = typeof routes;
export const endpoint = "/rpc";
export const pathsForGET: (keyof typeof routes)[] = ["checkId"];

export function registerRpcRoutes(app: Hono) {
  app.use(endpoint, authenticate, async (c, next) => {
    if (c.req.path !== endpoint && !c.req.path.startsWith(endpoint + "/")) {
      return await next();
    }
    const handler = exposeTinyRpc({
      routes,
      adapter: httpServerAdapter({ endpoint }),
    });
    const res = await handler({ request: c.req.raw });
    if (res) {
      return res;
    }
    return await next();
  });
}
