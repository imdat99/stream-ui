import { tryGetContext } from "hono/context-storage";

export const customFetch = async (url: string, options: RequestInit) => {
	options.credentials = "include";
	if (!options.headers) {
		options.headers = {};
	}
	if (import.meta.env.SSR) {
		const c = tryGetContext<any>();
		if (!c) {
			throw new Error("Hono context not found in SSR");
		}
		// Object.entries(c.req.header()).forEach(([k, v]) => {
		// 	Object.assign(options.headers!, { [k]: v });
		// });
		return await c.get("fetch")(url, options);
	}
	return fetch(url, options);
}