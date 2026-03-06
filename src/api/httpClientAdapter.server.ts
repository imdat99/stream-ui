import { tryGetContext } from 'hono/context-storage';

// export const baseAPIURL = 'https://api.pipic.fun';
export const baseAPIURL = 'http://localhost:8080';

type RequestOptions = RequestInit | { raw: Request };

const isRequest = (input: URL | RequestInfo): input is Request =>
  typeof Request !== 'undefined' && input instanceof Request;

const isRequestLikeOptions = (options: RequestOptions): options is { raw: Request } =>
  typeof options === 'object' && options !== null && 'raw' in options && options.raw instanceof Request;

const resolveInputUrl = (input: URL | RequestInfo, currentRequestUrl: string) => {
  if (input instanceof URL) return new URL(input.toString());
  if (isRequest(input)) return new URL(input.url);

  const baseUrl = new URL(currentRequestUrl);
  baseUrl.pathname = '/';
  baseUrl.search = '';
  baseUrl.hash = '';

  return new URL(input, baseUrl);
};

const resolveApiUrl = (input: URL | RequestInfo, currentRequestUrl: string) => {
  const inputUrl = resolveInputUrl(input, currentRequestUrl);
  const apiUrl = new URL(baseAPIURL);

  apiUrl.pathname = inputUrl.pathname.replace(/^\/?r(?=\/|$)/, '') || '/';
  apiUrl.search = inputUrl.search;
  apiUrl.hash = inputUrl.hash;

  return apiUrl;
};

const getOptionHeaders = (options: RequestOptions) =>
  isRequestLikeOptions(options) ? options.raw.headers : options.headers;

const getOptionMethod = (options: RequestOptions) =>
  isRequestLikeOptions(options) ? options.raw.method : options.method;

const getOptionBody = (options: RequestOptions) =>
  isRequestLikeOptions(options) ? options.raw.body : options.body;

const getOptionSignal = (options: RequestOptions) =>
  isRequestLikeOptions(options) ? options.raw.signal : options.signal;

const getOptionCredentials = (options: RequestOptions) =>
  isRequestLikeOptions(options) ? undefined : options.credentials;

const mergeHeaders = (input: URL | RequestInfo, options: RequestOptions) => {
  const c = tryGetContext<any>();
  const mergedHeaders = new Headers(c?.req.raw.headers ?? undefined);
  const inputHeaders = isRequest(input) ? input.headers : undefined;
  const optionHeaders = getOptionHeaders(options);

  new Headers(inputHeaders).forEach((value, key) => {
    mergedHeaders.set(key, value);
  });

  new Headers(optionHeaders).forEach((value, key) => {
    mergedHeaders.set(key, value);
  });

  mergedHeaders.delete('host');
  mergedHeaders.delete('connection');
  mergedHeaders.delete('content-length');
  mergedHeaders.delete('transfer-encoding');

  return mergedHeaders;
};

const resolveMethod = (input: URL | RequestInfo, options: RequestOptions) => {
  const method = getOptionMethod(options);
  if (method) return method;
  if (isRequest(input)) return input.method;
  return 'GET';
};

const resolveBody = (input: URL | RequestInfo, options: RequestOptions, method: string) => {
  if (method === 'GET' || method === 'HEAD') return undefined;

  const body = getOptionBody(options);
  if (typeof body !== 'undefined') return body;
  if (isRequest(input)) return input.body;
  return undefined;
};

export const customFetch = (input: URL | RequestInfo, options: RequestOptions = {}) => {
  const c = tryGetContext<any>();
  if (!c) {
    throw new Error('Hono context not found in SSR');
  }

  const apiUrl = resolveApiUrl(input, c.req.url);
  const method = resolveMethod(input, options);
  const body = resolveBody(input, options, method.toUpperCase());
  const requestOptions: RequestInit & { duplex?: 'half' } = {
    ...(isRequestLikeOptions(options) ? {} : options),
    method,
    headers: mergeHeaders(input, options),
    body,
    credentials: getOptionCredentials(options) ?? 'include',
    signal: getOptionSignal(options) ?? (isRequest(input) ? input.signal : undefined),
  };

  if (body) {
    requestOptions.duplex = 'half';
  }

  return fetch(apiUrl, requestOptions).then((response) => {
    const setCookies = typeof response.headers.getSetCookie === 'function'
      ? response.headers.getSetCookie()
      : response.headers.get('set-cookie')
        ? [response.headers.get('set-cookie')!]
        : [];

    for (const cookie of setCookies) {
      c.header('Set-Cookie', cookie, { append: true });
    }

    return response;
  });
};
