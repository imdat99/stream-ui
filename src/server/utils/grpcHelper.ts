import { ClientUnaryCall, ServiceError, status } from "@grpc/grpc-js";
type UnaryCallback<TRes> = (
  error: ServiceError | null,
  response: TRes
) => void;

type UnaryLike<TReq, TRes> = (
  req: TReq,
  callback: UnaryCallback<TRes>
) => ClientUnaryCall;

type RequestOf<T> = T extends (
  req: infer TReq,
  callback: UnaryCallback<any>
) => ClientUnaryCall
  ? TReq
  : never;

type ResponseOf<T> = T extends (
  req: any,
  callback: UnaryCallback<infer TRes>
) => ClientUnaryCall
  ? TRes
  : never;

/**
 * Lấy ra overload đúng dạng (req, callback) => ClientUnaryCall
 */
type ExtractUnaryOverload<T> = Extract<T, UnaryLike<any, any>>;

export type PromisifiedClient<TClient> = {
  [K in keyof TClient as ExtractUnaryOverload<TClient[K]> extends never
    ? never
    : K]: (
    req: RequestOf<ExtractUnaryOverload<TClient[K]>>
  ) => Promise<ResponseOf<ExtractUnaryOverload<TClient[K]>>>;
};


const grpcCodeToHttpStatus = (code?: number) => {
  switch (code) {
    case status.INVALID_ARGUMENT:
      return 400;
    case status.UNAUTHENTICATED:
      return 401;
    case status.PERMISSION_DENIED:
      return 403;
    case status.NOT_FOUND:
      return 404;
    default:
      return 500;
  }
};
const normalizeGrpcError = (error: ServiceError) => {
  const normalized = new Error(error.details || error.message) as Error & {
    status?: number;
    code?: number;
    body?: { code?: number; message?: string; data?: unknown };
  };
  normalized.code = error.code;
  normalized.status = grpcCodeToHttpStatus(error.code);

  const trailerBody = error.metadata?.get('x-error-body')?.[0];
  if (typeof trailerBody === 'string' && trailerBody) {
    try {
      normalized.body = JSON.parse(trailerBody) as { code?: number; message?: string; data?: unknown };
      if (normalized.body?.message) {
        normalized.message = normalized.body.message;
      }
      if (typeof normalized.body?.code === 'number') {
        normalized.status = normalized.body.code;
      }
    } catch {
      // ignore malformed structured error payloads
    }
  }

  return normalized;
};
export function promisifyClient<TClient extends object>(
  client: TClient
): PromisifiedClient<TClient> {
  const proto = Object.getPrototypeOf(client);
  const result: Record<string, unknown> = {};

  for (const key of Object.getOwnPropertyNames(proto)) {
    if (key === "constructor") continue;

    const value = (client as Record<string, unknown>)[key];
    if (typeof value !== "function") continue;

    result[key] = (req: unknown) =>
      new Promise((resolve, reject) => {
        (value as Function).call(
          client,
          req,
          (error: ServiceError | null, response: unknown) => {
            if (error) {
              reject(normalizeGrpcError(error));
              return;
            }
            resolve(response);
          }
        );
      });
  }

  return result as PromisifiedClient<TClient>;
}