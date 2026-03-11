export const customFetch: typeof fetch = (input, init) => {
	return fetch(input, {
		...init,
		credentials: 'include',
	});
};