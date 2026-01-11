import {
	proxyTinyRpc,
	TinyRpcClientAdapter,
	TinyRpcError,
} from "@hiogawa/tiny-rpc";
import type { RpcRoutes } from "./rpc";
import { Result } from "@hiogawa/utils";
import {httpClientAdapter} from "@httpClientAdapter";
// console.log("httpClientAdapter module:", httpClientAdapter.toString());
declare let __host__: string;
const endpoint = "/rpc";
const url = import.meta.env.SSR ? "http://localhost" : "";
const headers: Record<string, string> = {}; // inject headers to demonstrate context
export const client = proxyTinyRpc<RpcRoutes>({
	adapter: httpClientAdapter({
		url: url + endpoint,
		pathsForGET: [],
	}),
});
