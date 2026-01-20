import { tryGetContext } from "hono/context-storage";

export const customFetch = async (url: string, options: RequestInit) => {
	options.credentials = "include";
	if (import.meta.env.SSR) {
		const c = tryGetContext<any>();
		if (!c) {
			throw new Error("Hono context not found in SSR");
		}
		Object.assign(options, {
			headers: c.req.header()
		});
		const res = await fetch(["https://cheapest-representations-corporations-related.trycloudflare.com", url.replace(/r\//, '')].join('/'), options);
		res.headers.forEach((value, key) => {
			c.header(key, value);
		});
		return res;
	}
	return fetch(url, options);
}