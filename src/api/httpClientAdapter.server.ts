import { TinyRpcClientAdapter, TinyRpcError } from "@hiogawa/tiny-rpc";
import { Result } from "@hiogawa/utils";
import { tryGetContext } from "hono/context-storage";

const GET_PAYLOAD_PARAM = "payload";
export const baseAPIURL = "https://api.pipic.fun";

export function httpClientAdapter(opts: {
	url: string;
	pathsForGET?: string[];
	JSON?: Partial<JsonTransformer>;
	headers?: () => Promise<Record<string, string>> | Record<string, string>;
}): TinyRpcClientAdapter {
	const JSON: JsonTransformer = {
    parse: globalThis.JSON.parse,
    stringify: globalThis.JSON.stringify,
    ...opts.JSON,
  };
	return {
		send: async (data) => {
			const url = [opts.url, data.path].join("/");
			const payload = JSON.stringify(data.args);
			console.log("RPC Request:", payload);
			const method = opts.pathsForGET?.includes(data.path)
				? "GET"
				: "POST";
			let req: Request;
			if (method === "GET") {
				req = new Request(
					url +
					"?" +
					new URLSearchParams({ [GET_PAYLOAD_PARAM]: payload })
				);
			} else {
				req = new Request(url, {
					method: "POST",
					body: payload,
					headers: {
						"content-type": "application/json; charset=utf-8",
					},
					credentials: "include",
				});
			}
			let res: Response;
			if (import.meta.env.SSR) {
				const c = tryGetContext<any>();
				if (!c) {
					throw new Error("Hono context not found in SSR");
				}
				Object.entries(c.req.header()).forEach(([k, v]) => {
					req.headers.append(k, v);
				});
				res = await c.get("fetch")(req);
			} else {
				res = await fetch(req);
			}

			if (!res.ok) {
				// throw new Error(`HTTP error: ${res.status}`);
				throw new Error(
					JSON.stringify({
						status: res.status,
						statusText: res.statusText,
						data: { message: await res.text() },
						internal: true,
					})
				);
				// throw TinyRpcError.deserialize(res.status);
			}
			// if (res.headers.get("set-cookie")) {
			// 	console.log("Response has set-cookie header:", res.headers.get("set-cookie"));
			// }
			const result: Result<unknown, unknown> = JSON.parse(
				await res.text()
			);
			if (!result.ok) {
				throw TinyRpcError.deserialize(result.value);
			}
			return result.value;
		},
	};
}