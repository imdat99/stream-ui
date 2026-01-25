import { tryGetContext } from "hono/context-storage";

export const customFetch = (url: string, options: RequestInit) => {
	options.credentials = "include";
	if (import.meta.env.SSR) {
		const c = tryGetContext<any>();
		if (!c) {
			throw new Error("Hono context not found in SSR");
		}
		// Merge headers properly - keep original options.headers and add request headers
		const reqHeaders = new Headers(c.req.header());
		// Remove headers that shouldn't be forwarded
		reqHeaders.delete("host");
		reqHeaders.delete("connection");

		const mergedHeaders: Record<string, string> = {};
		reqHeaders.forEach((value, key) => {
			mergedHeaders[key] = value;
		});
		options.headers = {
			...mergedHeaders,
			...(options.headers as Record<string, string>)
		};

		const apiUrl = ["https://api.pipic.fun", url.replace(/^r/, '')].join('');
		// const res = await fetch(apiUrl, options);

		// Forward response headers to client (especially Set-Cookie)
		// res.headers.forEach((value, key) => {
		// c.header(key, value);
		// });
		return fetch(apiUrl, options).then(res => {
			// Forward response headers to client (especially Set-Cookie)
			res.headers.forEach((value, key) => {
				c.header(key, value);
			});
			return res;
		});
	}
}