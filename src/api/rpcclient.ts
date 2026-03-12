import { proxyTinyRpc } from "@hiogawa/tiny-rpc";
import { httpClientAdapter } from "@httpClientAdapter";
import type { RpcRoutes } from "@/server/routes/rpc";

const endpoint = "/rpc";
const publicEndpoint = "/rpc-public";
const url = import.meta.env.SSR ? "http://localhost" : "";
const publicMethods = ["login", "register", "forgotPassword", "resetPassword", "getGoogleLoginUrl"];

export const client = proxyTinyRpc<RpcRoutes>({
  adapter: {
    send: async (data) => {
      const targetEndpoint = publicMethods.includes(data.path) ? publicEndpoint : endpoint;
      return await httpClientAdapter({
        url: `${url}${targetEndpoint}`,
        pathsForGET: ["health"],
      }).send(data);
    },
  },
});
