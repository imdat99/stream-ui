export const customFetch = (url: string, options: RequestInit) => {
	return fetch(url, {
		...options,
		credentials: "include",
	});
}