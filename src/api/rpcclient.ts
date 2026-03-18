import type { RpcRoutes } from "@/server/routes/rpc";
import { proxyTinyRpc } from "@hiogawa/tiny-rpc";
import { httpClientAdapter } from "@httpClientAdapter";

const endpoint = "/rpc";
const publicEndpoint = "/rpc-public";
const url = import.meta.env.SSR ? "http://localhost" : "";
const publicMethods = ["login", "register", "forgotPassword", "resetPassword", "getGoogleLoginUrl"];
// src/client/trpc-client-transformer.ts
import {
  clientJSON
} from "@/shared/secure-json-transformer";


// export function createTrpcClientTransformer(cfg: ServerPublicKeyConfig) {
//   return {
//     input: ,
//     output: superjson,
//   };
// }
// const secureConfig = await fetch("/trpc-secure-config").then((r) => r.json());
export const client = proxyTinyRpc<RpcRoutes>({
  adapter: {
    send: async (data) => {
      const targetEndpoint = publicMethods.includes(data.path) ? publicEndpoint : endpoint;
      return await httpClientAdapter({
        url: `${url}${targetEndpoint}`,
        pathsForGET: ["health"],
        JSON: {
          // parse: clientJSON.parse,
          parse: (v, fn) => JSON.parse(v),
          // stringify: clientJSON.stringify,
          stringify: (v, fn) => JSON.stringify(v),
        },
        headers: () => Promise.resolve({})
      }).send(data);
    },
  },
});
