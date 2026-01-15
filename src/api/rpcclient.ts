import {
	proxyTinyRpc,
	TinyRpcClientAdapter,
	TinyRpcError,
} from "@hiogawa/tiny-rpc";
import type { RpcRoutes } from "./rpc";
import { Result } from "@hiogawa/utils";
import { httpClientAdapter } from "@httpClientAdapter";
// console.log("httpClientAdapter module:", httpClientAdapter.toString());
declare let __host__: string;
const endpoint = "/rpc";
const url = import.meta.env.SSR ? "http://localhost" : "";
import { auth } from "../lib/firebase";

export const client = proxyTinyRpc<RpcRoutes>({
	adapter: httpClientAdapter({
		url: url + endpoint,
		pathsForGET: [],
		headers: async () => {
			if (import.meta.env.SSR) return {}; // No client auth on server for now
			const user = auth.currentUser;
			if (user) {
				// Force refresh if needed or just get token
				const token = await user.getIdToken();
				return { Authorization: `Bearer ${token}` };
			}
			return {};
		}
	}),
});
